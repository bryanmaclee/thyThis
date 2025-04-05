import { isCSSSyntax, parseCSS } from "./cssParser.js";
import { parseJs } from "./jsParserB.js";
// import { buildAst } from "./dep/mods/buildAST.js";

export function analyzeLine(lines, startIndex, endIndex) {
  // Analyze lines only within the specified range [startIndex, endIndex)
  const builtItems = []; // Use a local array for results at this level
  let i = startIndex;

  while (i < endIndex) {
    const currentLine = lines[i];
    if (currentLine.length === 0) {
      i++;
      continue; // Skip empty lines
    }

    const tagStart = currentLine.indexOf("<");

    // --- Tag Handling ---
    if (tagStart !== -1) {
      const tagEnd = currentLine.indexOf(">", tagStart);
      if (tagEnd !== -1) {
        // Check if it's likely an opening tag (basic check)
        const potentialTag = currentLine.slice(tagStart, tagEnd + 1);
        const openTagRegex = /<[^/!][^>]*>/; // Exclude closing and doctype/comments initially
        const closeTagRegex = /<\/[^>]+>/;

        if (
          openTagRegex.test(potentialTag) &&
          !closeTagRegex.test(potentialTag)
        ) {
          // It's likely an opening tag, try to build the object
          const tagObject = buildTagObj(lines, i, tagStart, tagEnd, endIndex); // Pass endIndex for boundary

          if (tagObject) {
            // Check if buildTagObj succeeded
            builtItems.push(tagObject);
            // IMPORTANT: Skip lines that were processed as children
            if (!tagObject.selfClosing && tagObject.closeLine > i) {
              i = tagObject.closeLine + 1; // Jump past the closing tag
            } else {
              i++; // Move to the next line for self-closing or single-line tags
            }
            continue; // Continue the loop
          }
          // else: buildTagObj decided not to create an object (e.g., malformed), just proceed
        }
        // else: It's a closing tag, comment, doctype, or self-closing on same line handled by buildTagObj.
        // Just move to the next line; the parent's buildTagObj handled the range.
        // Or if specifically parsing comments/doctype, add logic here.
      } else {
        // Multi-line tag opening? Handle appropriately.
        // This might involve looking ahead similar to buildTagObj's findClosingTag
        // Or potentially restructuring multiLineHtml if that exists.
        // For now, just increment to avoid infinite loop on malformed line.
        const tagObj = multiLineTag(lines, tagStart, i);
        if (tagObj) {
          builtItems.push(tagObj);
          i = tagObj.closeLine + 1; // Move past the closing line
        console.warn(
          "Potential multi-line tag start or malformed tag on line",
          i
        );
      }}
    } else {
      // Line is not empty, has no tag start, and wasn't part of a code block
      // Treat as plain text? Or part of a larger structure?
      // You might need a text node type.
      //  builtItems.push({ type: 'text', content: currentLine, line: i });
      // const codeBlockInfo = identifyCodeBlock(lines, i, endIndex); // Needs modification
      // if (codeBlockInfo) {
      //   console.log("working on line: ", i, lines[i]);
      //   console.log("codeBlockInfo: ", codeBlockInfo);
      //   const [blockContent, endLineIndex] = codeBlockInfo;
      //   let parsedBlock;
      //   if (isCSSSyntax(blockContent)) {
      //     parsedBlock = parseCSS(blockContent); // parseCSS should return the object
      //   } else {
      //     parsedBlock = parseJs(blockContent); // parseJs should return the object
      //   }
      //   // Add language, line info etc. to parsedBlock if not done internally
      //   builtItems.push(parsedBlock);
      //   i = endLineIndex + 1; // Jump index past the code block
      //   continue; // Move to next iteration
      // }
    }

    i++; // Move to the next line by default if nothing else advanced 'i'
  }

  return builtItems; // Return the items found at this level/range
}

function multiLineTag(lines, tagStart, i) {
  const multiLineTag = joinMultilineTag(lines, i, i + 1);
  const tagTerminatedAt = multiLineTag[0].indexOf(">", tagStart);
  return buildTagObj(
    // lines[i],
    multiLineTag[0],
    tagStart,
    multiLineTag[0].indexOf(">"),
    tagTerminatedAt,
    lines
  );
}

export function buildTagObj(lines, i, tagStart, tagEnd, boundaryEndIndex) {
  const openTagRegex = /<[^/!][^>]*>/; // More specific opening tag check
  const closeTagRegex = /<\/[^>]+>/;
  const selfCloseEndRegex = /\/\s*>$/; // Check for />
  const tagLine = lines[i];
  const fullTag = tagLine.slice(tagStart, tagEnd + 1);

  // Basic check: if it looks like a closing tag, skip (the parent handles the range)
  if (closeTagRegex.test(fullTag)) {
    return null; // Indicate skip
  }
  // Add checks for <!DOCTYPE...> or if needed, return null

  const tagContent = tagLine.slice(tagStart + 1, tagEnd).trim();
  const selfClosesInline =
    selfCloseEndRegex.test(tagContent) || tagContent.endsWith("/"); // Check for <tag /> or <tag/>
  const attribsRaw = tagContent.replace(/\/$/, "").trim().split(" "); // Remove trailing / before split
  const tagName = attribsRaw[0];

  // Basic check for common void elements (might need a more comprehensive list)
  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);
  const isVoid = voidElements.has(tagName.toLowerCase());

  const attribsObj = buildAttributes(attribsRaw); // Assuming buildAttributes works

  let children = [];
  let closeLine = i; // Default for self-closing/void
  const selfClosing = selfClosesInline || isVoid;

  if (!selfClosing) {
    // findClosingTag needs to respect the boundaryEndIndex
    closeLine = findClosingTag(tagName, lines, i, boundaryEndIndex); // Start searching from next line

    if (closeLine < boundaryEndIndex) {
      // Found a closing tag within bounds
      // Recursively analyze ONLY the lines BETWEEN the tags
      children = analyzeLine(lines, i + 1, closeLine); // New array, limited range
    } else {
      // No closing tag found within bounds - treat as unclosed or implicitly closed at boundary
      console.warn(
        `No closing tag found for <${tagName}> starting on line ${i} within boundary ${boundaryEndIndex}`
      );
      closeLine = boundaryEndIndex - 1; // Or handle as error
      children = analyzeLine(lines, i + 1, boundaryEndIndex); // Analyze content until boundary
    }
  }

  return {
    language: "html",
    name: tagName,
    openLine: i,
    // tagEnd: tagEnd, // Index within the line might be less useful than line numbers
    closeLine: closeLine, // Line index where the tag closes (or starts if self-closing)
    attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    selfClosing: selfClosing,
    children: children, // Result of the isolated analyzeLine call
  };
}

function identifyCodeBlock(lines, i, j) {
  let openScope = 0;
  while (j < lines.length) {
    if (lines[j].includes("{")) openScope++;
    if (lines[j].includes("}")) openScope--;
    j++;
    if (openScope === 0) break;
  }
  return [lines.slice(i, j).join(" "), j];
}

// --- Helper function (Conceptual) ---
// function findClosingTag(tagName, lines, startSearchLine, boundaryEndIndex) {
//    let openCount = 1;
//    for (let k = startSearchLine; k < boundaryEndIndex; k++) {
//       // Use regex to find opening and closing tags for specifically tagName on lines[k]
//       // Increment openCount for <tagName...>
//       // Decrement openCount for </tagName>
//       // If openCount becomes 0, return k (the line index of the closing tag)
//    }
//    return boundaryEndIndex; // Not found
// }

// --- Placeholder for identifyCodeBlock ---
// Needs to return [blockContentAsString, endLineIndexOfBlock] or null/undefined
// function identifyCodeBlock(lines, startIndex, endIndex) {
//    // Look for <script>, <style>, ```, etc. at lines[startIndex]
//    // If found, find the corresponding closing tag/marker
//    // Extract content, return [content, endLine]
//    return null;
// }

// --- Initial Call ---
// Assuming 'allLines' is your array of strings from the file
// const parsedStructure = analyzeLine(allLines, 0, allLines.length);
// console.log(JSON.stringify(parsedStructure, null, 2));

// export function analyzeLine(lines, i, builtLines) {
//   // if (lines[i]) console.log(lines[i]);
// console.log(builtLines)
//   if (i >= lines.length) return builtLines;
//   if (lines[i].length === 0) return analyzeLine(lines, i + 1, builtLines);
//   const stateObj = {
//     line: lines[i],
//     index: i,
//     language: null,
//     type: null,
//     scope: null,
//     statementOpen: false,
//   };
//   // console.log("still here")
//   const tagStart = lines[i].indexOf("<");
//   if (tagStart !== -1) {
//     const tagEnd = lines[i].indexOf(">", tagStart);
//     if (tagEnd !== -1) {
//       console.log("still here homie")
//       const freshBuiltLine = buildTagObj(lines, i, tagStart, tagEnd, builtLines);
//       builtLines.push(freshBuiltLine);
//     } else {
//       i = multiLineHtml(lines, builtLines, tagStart, i, i + 1);
//     }
//   } else {
//     const codeBlock = identifyCodeBlock(lines, i, i);
//     // console.log(codeBlock);
//     if (codeBlock) {
//       lines.splice(i, codeBlock[1] - i, codeBlock[0]);
//       if (isCSSSyntax(codeBlock[0])) {
//         builtLines.push(parseCSS(codeBlock[0]));
//       } else {
//         // lines[i] = parseSomeJS(codeBlock[0]);
//         builtLines.push(parseJs(codeBlock[0]));
//       }
//       // lines[i] = codeBlock[0];
//     }
//   }
//   // if (lines) console.log(lines);
//   return analyzeLine(lines, i + 1, builtLines);
//   // const
//   // const nextToken = identifyNextToken(stateObj)
//   // console.log("Next token: ", nextToken);
//   // const token = identifyToken(line);
//   // return builtLines;
// }

// export function buildTagObj(lines, i, tagStart, tagEnd, builtLines) {

//   // console.log(tagEnd);
//   const openTagRegex = /<[^/][^>]*>/;
//   const closeTagRegex = /<\/[^>]+>/;
//   const contentBetweenTagsRegex = /<[^/][^>]*>(.*?)<\/[^>]+>/;
//   const rareHtmlRegex = /<\!([A-Za-z\-]+)([^>]*?)\>/;
//   const tagLine = lines[i]

//   if ((closeTagRegex.test(tagLine) && !openTagRegex.test(tagLine)) || rareHtmlRegex.test(tagLine)) {
//     // console.log("this is a closing or rare html tag ", tagLine);
//     return;
//   }

//   const tag = tagLine.slice(tagStart + 1, tagEnd).trim();
//   const attribs = tag.split(" ");
//   const attribsObj = buildAttributes(attribs);
//   const tagClosedAt = findClosingTag(attribs[0], lines, i);
//   const selfCloses = tag.endsWith("/") || tagClosedAt === lines.length;
//   let tagStrStartToEnd = "";
//   if (tagClosedAt === i && !selfCloses) {
//     tagStrStartToEnd = tagLine.match(contentBetweenTagsRegex)[1];
//   }else {
//        tagStrStartToEnd = lines.slice(i+1, tagClosedAt === lines.length ? i : tagClosedAt).join(" ");
//   }

//   return {
//     language: "html",
//     name: attribs[0],
//     openLine: i,
//     tagEnd,
//     closeLine: tagClosedAt === lines.length ? i : tagClosedAt,
//     attributes: attribsObj.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
//     selfClosing: selfCloses,
//     // childrenText: tagStrStartToEnd,
//     children: selfCloses ? [] : analyzeLine(lines, i + 1, builtLines),
//     // children: selfCloses ? [] : {fromLine: i, toLine: tagClosedAt},
//   };
// }

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
