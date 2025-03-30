export function transformHTML(data) {
  const htmlWithoutComments = removeComments(replaceQuoteText(data)); // Remove comments from HTML
  const fileByLine = htmlWithoutComments.split("\n");
  const trimedbyLine = fileByLine
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  // console.log(`Transformed HTML saved to ${outputFile}`);
  return trimedbyLine;
}

function removeComments(data) {
  return data
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove HTML, JS, and CSS comments
}

const compiler = {
  stringReplacements: [],
};

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

