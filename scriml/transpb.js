const compiler = {
  stringReplacements: [],
};

async function transformHTML(data) {
  try {
    const htmlWithoutComments = removeComments(data); // Remove comments from HTML
    const fileByLine = htmlWithoutComments.split("\n");
    const trimedbyLine = fileByLine
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    // console.log(`Transformed HTML saved to ${outputFile}`);
    return trimedbyLine;
  } catch (err) {
    console.error("Error:", err);
  }
}

function replaceQuoteText(data) {
  const regex = /(["'])(?:\\\1|.)*?\1/;
  if (regex.test(data)) {
    const newString = data.replace(
      regex,
      `*#${compiler.stringReplacements.length}`
    );
    compiler.stringReplacements.push(data.match(regex)[0]);
    return replaceQuoteText(newString);
  }
  return data; // Return the modified data if no more quoted text is found
}

function removeComments(data) {
  return data
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove HTML, JS, and CSS comments
}

function removeEls(s, e, ar) {
  //   const startArray = ["a", "b", "c", "d", "e"];
  return ar.filter((_, index) => {
    // return index >= s && index <= e;
    return index < s || index > e;
  }); // Remove elements from start to end index
}

// console.log(removeEls(2, 3, ["a", "b", "c", "d", "e"])); // ['a', 'b', 'e']

async function main() {
  const inputFile = "exampleToDo.html";
  const outputFile = "out/output.txt";

  let data = await Bun.file(inputFile).text();
  data = replaceQuoteText(data);
  const lines = await transformHTML(data);

  for (let i = 0; i < lines.length; i++) {
    const tagStart = lines[i].indexOf("<");
    if (tagStart !== -1) {
      const tagEnd = lines[i].indexOf(">", tagStart);
      if (tagEnd !== -1) {
        lines[i] = buildTagObj(lines[i], tagStart, tagEnd, i); // Convert to JSON object
      } else {
        console.warn(`Warning: No closing '>' found for tag in line ${i + 1}`);
        let j = i + 1;
        while (j < lines.length && !lines[j].includes(">")) {
          j++;
        }
        console.log(lines[j]);
        removeEls(i, j + 1, lines); // Remove lines from i to j-1
        lines[i] = lines.slice(i, j + 1).join(" ");
        console.log(`Joining lines from ${i} to ${j}: ${lines[i]}`);
        lines[i] = buildTagObj(lines[i], tagStart, lines[i].indexOf(">"), i);
      }
    }
  }
  await Bun.write(outputFile, JSON.stringify(lines, null, 2));
}

function buildTagObj(tagLine, tagStart, tagEnd, i) {
  const tag = tagLine.slice(tagStart + 1, tagEnd).trim();
  const attribs = tag.split(" ");
  // console.log(`Tag: ${tag}, Attributes: ${attribs}`);
  const attribsObj = attribs.map((attrib, i) => {
    if (i == 0) return; // Skip the tag name itself
    if (attrib.includes("=")) {
      const [key, value] = attrib.split("=");
      return { [key]: value.replace(/['"]/g, "") }; // Remove quotes from value
    } else if (attrib.endsWith("/")) {
      // return { "selfClosing": true }; // Self-closing tag (e.g., <img/>)
      return;
    }
    return { [attrib]: true }; // Boolean attribute (e.g., <input checked>)
  });
  const tagObj = {
    language: "html",
    name: attribs[0],
    openLine: i, // Line number
    closeLine: i, // Close line number
    attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}), // Merge attributes into a single object
    selfClosing: tag.endsWith("/"), // Check if the tag is self-closing
  };
  return tagObj; // Return the tag object for further processing if needed
}

main().then(() => {
  console.log("Transformation complete. Check output.txt for results.");
});
