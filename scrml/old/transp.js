async function transformHTML(inputFile, outputFile) {
  try {
    let data = await Bun.file(inputFile).text();
    const fileByLine = data.split("\n");
    const trimedbyLine = fileByLine
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    // const fileByTags = trimedbyLine.map((line, index) => {
    //   return parseHTMLTag(line, index);
    // });

    const htmlMatch = data.match(htmlRegex);
    const classified = classifyStatementsRecursively(trimedbyLine, []);
    // console.log("classified: ", classified);

    // await Bun.write(outputFile, JSON.stringify(trimedbyLine, null, 2));
    await Bun.write(outputFile, JSON.stringify(classified, null, 2));
    console.log(`Transformed HTML saved to ${outputFile}`);
  } catch (err) {
    console.error("Error:", err);
  }
}
transformHTML("exampleToDo.html", "out/outputB.html");
const htmlRegex = /<[^>]+>/g;

function parseTagAttributes(html) {
  const tagMatch = html.match(/<(\w+)(.*?)\/?>/);
  if (!tagMatch) return html;
  console.log("tagMatch: ", tagMatch);
  const tagName = tagMatch[1];
  const attributesString = tagMatch[2];
  const attributes = {};

  const tagRegex =
    /<(\w+)([^>]*?)\/?>|<\/(\w+)>|([^<>]+)|<!DOCTYPE\s+([^>]+)>/gi;
  const attrRegex = /(\w+)=["']((?:.(?!["']\s|\s\w+=))*.?)["']/g;

  let match;
  while ((match = attrRegex.exec(attributesString)) !== null) {
    const key = match[1];
    const value = match[2];

    console.log(match);
    // Check if it's a JS event handler (e.g., onclick, onmouseover)
    // if (key.startsWith('on')) {
    //     // Add as a method in the object
    //     attributes[key] = new Function(value);
    // } else {
    attributes[key] = value;
    // }
  }

  return {
    tagName,
    ...attributes,
  };
}

function classifyStatementsRecursively(unAltered, altered) {
  //   console.log("unAltered: ", unAltered);
  if (unAltered.length === 0) {
    // console.log("altered: ", altered);
    return altered;
  }
  if (unAltered[0]?.match(/<[^>]+>/g)) {
    // console.log(unAltered[0]?.match(/<[^>]+>/g));
    // altered.push(unAltered[0]?.replace(/<[^>]+>/g, ""));
    // parseTagAttributes(unAltered[0]);
    altered.push(parseTagAttributes(unAltered[0]));
    // altered.push(unAltered[0]);
    unAltered.shift();
    return classifyStatementsRecursively(unAltered, altered);
  } else {
    altered.push(unAltered[0]);
    unAltered.shift();
    return classifyStatementsRecursively(unAltered, altered);
  }
}
