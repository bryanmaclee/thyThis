// import { htmlTagsByCat } from "./dep/html";
// import htmlTagsFlat from "./dep/html";

import { json } from "stream/consumers";

function parseTagAttributes(html) {
  const tagMatch = html.match(/<(\w+)(.*?)\/?>/);
  if (!tagMatch) return html;

  const tagName = tagMatch[1];
  const attributesString = tagMatch[2];
  const attributes = {};

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

// Example Usage
const htmlTag = `<input type="text" id="taskInput" placeholder="Enter a task" onclick="alert('Clicked!')" JvaL="taskText.trim()" />`;

// console.log(parseTagAttributes(htmlTag));

function ifIsCss(content) {
  const cssRegex =
    /^[\s]*(?:@[a-z-]+\s*\([^\)]+\)\s*|[.#]?[a-zA-Z0-9_-]+|\*)\s*\{/gm;
  const cssMatch = content.match(cssRegex);

  const matches = [...content.matchAll(cssRegex)].map((match) => {
    const selector = match.groups.selector.trim().replace("{", "").trim();
    const rules = match.groups.rules.trim();

    return {
      type: selector.startsWith("@")
        ? "css-media-query"
        : selector.startsWith(".")
        ? "css-class-selector"
        : selector.startsWith("#")
        ? "css-id-selector"
        : "css-element-selector",
      selector,
      rules,
    };
  });

  console.log(JSON.stringify(matches, null, 2));

  // if (cssMatch) {
  //     return true;
  // }
  // return false;
}

function parseDocToStatements(content) {
  const statements = content.split(";").map((statement) => statement.trim());
  return statements;
}

// const tagRegex = /<(\w+)([^>]*?)\/?>|<\/(\w+)>|([^<>]+)/g;
const tagRegex = /<(\w+)([^>]*?)\/?>|<\/(\w+)>|([^<>]+)|<!DOCTYPE\s+([^>]+)>/gi;

const attrRegex = /(\w+)=["']((?:.(?!["']\s|\s\w+=))*.?)["']/g;

function parseHTMLTag(line, lineNumber) {
  const result = [];

  let match;
  let currentTag = null;

  let scopesOpen = 0;

  while ((match = tagRegex.exec(line)) !== null) {
    if (match[1]) {
      // Opening tag
      const tagName = match[1];
      const attributesString = match[2];
      const attributes = {};

      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesString)) !== null) {
        const key = attrMatch[1];
        const value = attrMatch[2];
        attributes[key] = value;
      }

      currentTag = { tagName, attributes };
      result.push(currentTag);
    } else if (match[3]) {
      // Closing tag
      currentTag = null; // Reset for next tag
    } else if (match[4] && currentTag) {
      // Inner content
      currentTag.content = match[4].trim();
    }
  }

  return JSON.stringify(result, null, 4);
}

async function transformHTML(inputFile, outputFile) {
  try {
    let data = await Bun.file(inputFile).text();
    const fileByLine = data.split("\n");
    // const fileByTags = data.split(tagRegex);
    const fileByTags = data.match(tagRegex);
    // console.log("this is split by tag: ", fileByTags);
    const tagsFound = [];
    ifIsCss(data);
    // for (let i = 0; i < fileByTags.length; i++) {
    //     fileByTags[i] = fileByTags[i].trim()
    //     // fileByLine[i] = JSON.stringify(parseTagAttributes(fileByLine[i]));
    //     fileByTags[i] = parseHTMLTag(fileByTags[i], i);
    // }

    const htmlRegex = /<[^>]+>/g;
    const htmlMatch = data.match(htmlRegex);

    // Write transformed content to output file
    await Bun.write(outputFile, JSON.stringify(fileByTags));
    // await Bun.write(outputFile, fileByLine);
    // await Bun.write(outputFile, transformed);
    console.log(`Transformed HTML saved to ${outputFile}`);
  } catch (err) {
    console.error("Error:", err);
  }
}
transformHTML("exampleToDo.html", "outputB.html");

// transformHTML("exampleToDo.html", "output.json");
// transformHTML('input.html', 'output.html');
