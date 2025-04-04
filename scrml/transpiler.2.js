// import { buildTagObj, multiLineHtml } from "./dep/mods/buildTagObj";
import { transformHTML } from "./dep/mods/transformHTML";
import { isCSSSyntax, parseCSS } from "./dep/mods/cssParser";
import { parseJs } from "./dep/mods/jsParserB.js";
import { buildAst } from "./dep/mods/buildAST.js";
import { fragments, isolateDecorators } from "./dep/mods2/fragmentLib.js";
import { buildTagObj } from "./dep/mods/buildTagObj.js";
import { multiLineHtml } from "./transpiler.js";
// import { parseJavaScriptStatements, codeSample } from "./dep/mods/parseExper.js";

// console.log(parseJavaScriptStatements(codeSample));

async function main() {
  const inputFile = "./exampleToDo.html";
  const outputFile = "out/output.json";
  const outputText = "out/output.txt";
  const flatJson = "out/flat.json";

  let data = await Bun.file(inputFile).text();
  const lines = await transformHTML(data);

  // cycleLines(lines, 0);
  const builtLines = analyzeLine(lines, 0, []);
  const jsonFlat = JSON.stringify(builtLines, null, 2);
  // console.log(jsonFlat)
  await Bun.write(flatJson, jsonFlat);
  const jsonNested = buildAst(builtLines);
  // console.log(jsonNested)
  await Bun.write(outputFile, JSON.stringify(jsonNested, null, 2));
  // const
}
main().then(() => {
  console.log("Transformation complete. Check outputht.txt for results.");
});

function cycleLines(lines, i) {
  // console.log(lines[i]);
  // const line = isolateDecorators(lines[i]);
  // const nextToken = identifyNextToken(lines[i])

  // console.log("Next token: ", nextToken);

  // const token = identifyToken(line);
  analyzeLine(lines[i], i);
}

function analyzeLine(lines, i, builtLines) {
  console.log(lines[i]);
  if (i >= lines.length) return;
  if (lines[i].length === 0) return analyzeLine(lines, lineIndex + 1);
  const stateObj = {
    line: lines[i],
    index: i,
    language: null,
    type: null,
    scope: null,
    statementOpen: false,
  };
  const tagStart = lines[i].indexOf("<");
  if (tagStart !== -1) {
    const tagEnd = lines[i].indexOf(">", tagStart);
    if (tagEnd !== -1) {
      // lines[i] = buildTagObj(lines[i], tagStart, tagEnd, i, lines);
      builtLines.push(buildTagObj(lines[i], tagStart, tagEnd, i, lines));
    } else {
      i = multiLineHtml(lines, builtLines, tagStart, i, i + 1);
    }
  } else {
    const codeBlock = identifyCodeBlock(lines, i, i);
    // console.log(codeBlock);
    if (codeBlock) {
      lines.splice(i, codeBlock[1] - i, codeBlock[0]);
      if (isCSSSyntax(codeBlock[0])) {
        builtLines.push(parseCSS(codeBlock[0]));
      } else {
        // lines[i] = parseSomeJS(codeBlock[0]);
        builtLines.push(parseJs(codeBlock[0]));
      }
      // lines[i] = codeBlock[0];
    }
  }
  analyzeLine(lines, i + 1, builtLines);
  // const
  // const nextToken = identifyNextToken(stateObj)
  // console.log("Next token: ", nextToken);
  // const token = identifyToken(line);
  return builtLines;
}

function identifyNextToken(state) {
  // const firstToken = firstOccurrenceOf(line, fragments);
  const line = state.line;
  const lineIndex = state.index;
  console.log("line: ", line[1]);
  const tokensInLine = [];
  const firstToken = { index: line.length, value: null };
  for (let i in fragments.arbitraryStatementOpeners) {
    const col = line.indexOf(fragments.arbitraryStatementOpeners[i]);
    tokensInLine.push(col);
    if (col !== -1 && col < firstToken.index) {
      firstToken.index = col;
      firstToken.value = fragments.arbitraryStatementOpeners[i];
    }
  }
  // console.log("tokensInLine: ", tokensInLine);
  // console.log("firstTokenIndex: ", firstToken);
  // console.log(fragments.arbitraryStatementOpeners[firstToken.index]);
  return firstToken;
}

// function firstOccurrenceOf(str, searchString) {
//     const index = str.indexOf(searchString);
//     if (index !== -1) {
//         return str.slice(index, str.length);
//     }
//     return null;
// }

// const lsj = "this is a string test"
// const lkj = firstOccurrenceOf(lsj,"is")

// console.log(lkj)

async function mai() {
  // const inputFile = "./scrml/exampleToDo.html";
  const inputFile = "exampleToDo.html";
  const outputFile = "out/output.json";
  const outputText = "out/output.txt";
  const flatJson = "out/flat.json";
  const outputRaw = "./scrml/out/outputRaw.txt";
  const outputCSS = "./scrml/out/outputCSS.txt";
  const outputJS = "./scrml/out/outputJS.txt";
  const outputHTML = "./scrml/out/outputHTML.txt";

  let data = await Bun.file(inputFile).text();
  const lines = await transformHTML(data);
  const builtLines = [];
  //   Bun.write(outputRaw, JSON.stringify(lines, null, 2));

  for (let i = 0; i < lines.length; i++) {
    const tagStart = lines[i].indexOf("<");
    if (tagStart !== -1) {
      const tagEnd = lines[i].indexOf(">", tagStart);
      if (tagEnd !== -1) {
        builtLines.push(buildTagObj(lines[i], tagStart, tagEnd, i, lines));
      } else {
        i = multiLineHtml(lines, builtLines, tagStart, i, i + 1);
      }
    } else {
      const codeBlock = identifyCodeBlock(lines, i, i);
      // console.log(codeBlock);
      if (codeBlock) {
        lines.splice(i, codeBlock[1] - i, codeBlock[0]);
        if (isCSSSyntax(codeBlock[0])) {
          builtLines.push(parseCSS(codeBlock[0]));
        } else {
          // lines[i] = parseSomeJS(codeBlock[0]);
          builtLines.push(parseJs(codeBlock[0]));
        }
        // lines[i] = codeBlock[0];
      }
    }
  }
  // console.log(lines.length);
  const jsonFlat = JSON.stringify(builtLines, null, 2);
  // console.log(jsonFlat)
  await Bun.write(flatJson, jsonFlat);
  const jsonNested = buildAst(builtLines);
  // console.log(jsonNested)
  await Bun.write(outputFile, JSON.stringify(jsonNested, null, 2));
}

function identifyLangAgnosticScope(lines, i, j) {
  const openTagRegex = /<[^/][^>]*>/;
  const closeTagRegex = /<\/[^>]+>/;
  let openScope = 0;
  while (j < lines.length) {
    if (lines[j].includes("{") || openTagRegex.test(lines[j])) openScope++;
    if (lines[j].includes("}") || closeTagRegex.test(lines[j])) openScope--;
    j++;
    if (openScope === 0) break;
  }
  return [lines.slice(i, j).join(" "), j];
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

function Split(str, splitter, side) {
  // const spl = str.split(splitter);
  const spl = [];
  while (str.includes(splitter)) {
    let index = str.indexOf(splitter);
    if (side > 0) index += splitter.length;
    if (side < 0) index -= splitter.length;
    spl.push(str.slice(0, index));
    str = str.slice(index + 1);
  }
  // else if (side > 0) return splitter + spl[1];
  return spl;
}
