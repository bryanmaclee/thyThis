export function buildTagObj(tagLine, tagStart, tagEnd, i, lines) {
  // console.log(tagEnd);
  const openTagRegex = /<[^/][^>]*>/;
  const closeTagRegex = /<\/[^>]+>/;
  const contentBetweenTagsRegex = /<[^/][^>]*>(.*?)<\/[^>]+>/;
  const rareHtmlRegex = /<\!([A-Za-z\-]+)([^>]*?)\>/;


  if ((closeTagRegex.test(tagLine) && !openTagRegex.test(tagLine)) || rareHtmlRegex.test(tagLine)) {
    // console.log("this is a closing or rare html tag ", tagLine);
    return;
  }


  const tag = tagLine.slice(tagStart + 1, tagEnd).trim();
  const attribs = tag.split(" ");
  const attribsObj = buildAttributes(attribs);
  const tagClosedAt = findClosingTag(attribs[0], lines, i);
  const selfCloses = tag.endsWith("/") || tagClosedAt === lines.length;
  let tagStrStartToEnd = "";
  if (tagClosedAt === i && !selfCloses) {
    tagStrStartToEnd = tagLine.match(contentBetweenTagsRegex)[1];
  }else {
       tagStrStartToEnd = lines.slice(i+1, tagClosedAt === lines.length ? i : tagClosedAt).join(" ");
  }
  
  return {
    language: "html",
    name: attribs[0],
    openLine: i,
    tagEnd,
    closeLine: tagClosedAt === lines.length ? i : tagClosedAt,
    attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    selfClosing: selfCloses,
    // childrenText: tagStrStartToEnd,
    children: selfCloses ? [] : {fromLine: i, toLine: tagClosedAt},
  };
}

function buildAttributes(attribs) {
  return attribs.map((attrib, i) => {
    if (i == 0) return;
    if (attrib.includes("=")) {
      const [key, value] = attrib.split("=");
      return { [key]: value.replace(/['"]/g, "") };
    } else if (attrib.endsWith("/")) {
      return;
    }
    return { [attrib]: true };
  });
}

function identifyClosingTag(line, elName) {
  const closingTagRegex = /<\/\w+>/g;
  return closingTagRegex.test(line) && line.includes(elName);
}

function findClosingTag(name, lines, i) {
  while (i < lines.length && !identifyClosingTag(lines[i], name)) {
    i++;
  }
  return i;
}

export function joinMultilineTag(lines, i, j) {
  while (
    j < lines.length &&
    !/\s>/.test(lines[j]) &&
    !lines[j].includes("/>")
  ) {
    j++;
  }
  // console.log(lines.slice(i, j + 1).join(" "));
  return [lines.slice(i, j + 1).join(" "), j];
}