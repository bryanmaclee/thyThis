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

export const compiler = {
  stringReplacements: {},
};

function replaceQuoteText(data) {
  const regex = /(["'])(?:\\\1|.)*?\1/;
  if (regex.test(data)) {
    const newString = data.replace(
      regex,
      `*#${Object.keys(compiler.stringReplacements).length}`
      
    );
    compiler.stringReplacements[`*#${Object.keys(compiler.stringReplacements).length}`] = data.match(regex)[0];
    // console.log(
    //   `Replaced string: ${data.match(regex)[0]} with *#${Object.keys(compiler.stringReplacements).length - 1}`
    // );
    return replaceQuoteText(newString);
  }
  return data; // Return the modified data if no more quoted text is found
}


export function concatMultilineHtmlTags(inputText) {
  // const lines = inputText.split('\n');
  const lines = inputText
  const resultLines = [];
  let isInsideTag = false;
  let currentTagBuffer = '';

  for (const line of lines) {
    let processedLine = line;
    let consumed = false; 
    if (isInsideTag) {
      currentTagBuffer += ' ' + processedLine.trim(); 
      if (processedLine.includes('>')) {
        // Found the end of the tag
        resultLines.push(currentTagBuffer); 
        isInsideTag = false;
        currentTagBuffer = '';
        consumed = true;
      } else {
        consumed = true;
      }
    } else {
      // We are not currently inside a tag
      const tagStartIndex = processedLine.indexOf('<');
      const tagEndIndex = processedLine.indexOf('>');

      if (tagStartIndex !== -1 && (tagEndIndex === -1 || tagStartIndex > tagEndIndex)) {
        // Line starts a tag but doesn't end it (or '>' appears before '<')
        isInsideTag = true;
        currentTagBuffer = processedLine.trim(); // Start buffer with trimmed line
        consumed = true; // The whole line starts the tag
      }
    }
    if (!consumed) {
      resultLines.push(processedLine);
    }
  }
  if (isInsideTag) {
    resultLines.push(currentTagBuffer);
  }

  return resultLines;
}