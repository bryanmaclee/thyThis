import { buildTagObj, joinMultilineTag } from "./dep/mods/buildTagObj";
import { transformHTML } from "./dep/mods/transformHTML";
import { isCSSSyntax, parseCSS } from "./dep/mods/cssParser";
import { parseJs } from "./dep/mods/jsParserB.js";
// import { parseJavaScriptStatements, codeSample } from "./dep/mods/parseExper.js";

// console.log(parseJavaScriptStatements(codeSample));
function multiLineHtml(lines, builtLines, tagStart, i, j) {
  // console.log("built lines: ", builtLines);
  const multiLineTag = joinMultilineTag(lines, i, i + 1);
  // lines.splice(i, multiLineTag[1] - i + 1, multiLineTag[0]);
  // const extracted = lines.slice(i, multiLineTag[1] + 1).join(" ");
  // console.log(multiLineTag);
  // lines[i] = multiLineTag[0];
  // console.log(lines[i]);
  const tagTerminatedAt = multiLineTag[0].indexOf(">", tagStart);
  builtLines.push(
    buildTagObj(
      // lines[i],
      multiLineTag[0],
      tagStart,
      multiLineTag[0].indexOf(">"),
      tagTerminatedAt,
      lines
    )
  );
  return multiLineTag[1];
}

async function main() {
  // const inputFile = "./scrml/exampleToDo.html";
  const inputFile = "exampleToDo.html";
  const outputFile = "out/output.txt";
  const outputRaw = "./scrml/out/outputRaw.txt";
  const outputCSS = "./scrml/out/outputCSS.txt";
  const outputJS = "./scrml/out/outputJS.txt";
  const outputHTML = "./scrml/out/outputHTML.txt";

  let data = await Bun.file(inputFile).text();
  // const lines = Split(data,"{", 1)
  const lines = await transformHTML(data);
  const builtLines = [];
  // await
  Bun.write(outputRaw, JSON.stringify(lines, null, 2));

  for (let i = 0; i < lines.length; i++) {
    const tagStart = lines[i].indexOf("<");
    if (tagStart !== -1) {
      const tagEnd = lines[i].indexOf(">", tagStart);
      if (tagEnd !== -1) {
        // lines[i] = buildTagObj(lines[i], tagStart, tagEnd, i, lines);
        builtLines.push(
          buildTagObj(lines[i], tagStart, tagEnd, i, lines)
        );
      } else {
        i = multiLineHtml(lines, builtLines, tagStart, i, i + 1);
      }
    } else {
      const codeBlock = identifyCodeBlock(lines, i, i);
      // console.log(codeBlock);
      if (codeBlock) {
        lines.splice(i, codeBlock[1] - i, codeBlock[0]);
        if (isCSSSyntax(codeBlock[0])) {
          builtLines.push(parseCSS(codeBlock[0]))
        } else {
          // lines[i] = parseSomeJS(codeBlock[0]);
          builtLines.push(parseJs(codeBlock[0]))
        }
        // lines[i] = codeBlock[0];
      }
    }
  }
  // console.log(lines.length);
  await Bun.write(outputFile, JSON.stringify(builtLines, null, 2));
}

main().then(() => {
  console.log("Transformation complete. Check output.txt for results.");
});

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
