export function buildTagObj(tagLine, tagStart, tagEnd, i, lines) {
  // console.log(tagEnd);
  const openTagRegex = /<[^/][^>]*>/;
  const closeTagRegex = /<\/[^>]+>/;
  const contentBetweenTagsRegex = /<[^/][^>]*>(.*?)<\/[^>]+>/;
  const rareHtmlRegex = /<\!([A-Za-z\-]+)([^>]*?)\>/;


  if (tagLine.test(closeTagRegex) || tagLine.test(rareHtmlRegex)) {
    console.log("this tag is a closing tag or a rare html tag");
    return;
  }


  const tag = tagLine.slice(tagStart + 1, tagEnd).trim();
  console.log(tag);
  const attribs = tag.split(" ");
  // console.log(attribs);
  const attribsObj = buildAttributes(attribs);
  const tagClosedAt = findClosingTag(attribs[0], lines, i);
  console.log(tagClosedAt, " = ", i);
  const selfCloses = tag.endsWith("/") || tagClosedAt === lines.length;
  let tagStrStartToEnd = "";
  // const childText = tagLine.slice(tagEnd + 1, lines[i].length).trim();
  if (tagClosedAt === i) {
    console.log("this is the tagLine" , tagLine);
    tagStrStartToEnd = tagLine.match(contentBetweenTagsRegex)[1];
    console.log(tagStrStartToEnd);
  }else {
       tagStrStartToEnd = lines.slice(i+1, tagClosedAt === lines.length ? i : tagClosedAt).join(" ");
  console.log(attribs[0], " = \n", tagStrStartToEnd , "\n");
  }

  // console.log(childText);

  return {
    language: "html",
    name: attribs[0],
    openLine: i,
    tagEnd,
    closeLine: tagClosedAt === lines.length ? i : tagClosedAt,
    attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    selfClosing: selfCloses,
    // childrenText: childText,
    children: selfCloses ? [] : [i, tagClosedAt],
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
  return [lines.slice(i, j + 1).join(" "), j];
}