
export function buildTagObj(tagLine, tagStart, tagEnd, i, lines) {
  const tag = tagLine.slice(tagStart + 1, tagEnd).trim();
  const attribs = tag.split(" ");
  const attribsObj = buildAttributes(attribs);
  const tagClosedAt = findClosingTag(attribs[0], lines, i);
  const selfCloses = tag.endsWith("/") || tagClosedAt === lines.length;

  return {
    language: "html",
    name: attribs[0],
    openLine: i, // Line number
    tagEnd: tagEnd, // Tag end index
    closeLine: tagClosedAt === lines.length ? i : tagClosedAt, // Close line number
    attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}), // Merge attributes into a single object
    selfClosing: selfCloses, // Check if the tag is self-closing
    children: selfCloses ? [] : [i + 1, tagClosedAt], // Get the children of the tag
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
    return { [attrib]: true }; // Boolean attribute (e.g., <input checked>)
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

