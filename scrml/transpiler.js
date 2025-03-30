import { buildTagObj } from "./dep/mods/buildTagObj";
import { transformHTML, joinMultilineTag } from "./dep/mods/transformHTML";
import { isCSSSyntax, parseCSS } from "./dep/mods/cssParser";
import { prarseJs } from "./dep/mods/jsParserB.js";

async function main() {
  const inputFile = "exampleToDo.html";
  const outputFile = "out/output.txt";

  let data = await Bun.file(inputFile).text();
  // const lines = Split(data,"{", 1)
  const lines = await transformHTML(data);

  

  for (let i = 0; i < lines.length; i++) {
    // console.log(lines)
    const tagStart = lines[i].indexOf("<");
    if (tagStart !== -1) {
      const tagEnd = lines[i].indexOf(">", tagStart);
      if (tagEnd !== -1) {
        lines[i] = buildTagObj(lines[i], tagStart, tagEnd, i, lines); // Convert to JSON object
      } else {
        // multi-line tag;
        // console.log(lines.length);
        const multiLineTag = joinMultilineTag(lines, i, i + 1);
        lines.splice(i, multiLineTag[1] - i + 1, multiLineTag[0]);
        lines[i] = multiLineTag[0]
        // console.log(lines[i]);
        const tagTerminatedAt = lines[i].indexOf(">", tagStart);
        lines[i] = buildTagObj(lines[i], tagStart, lines[i].indexOf(">"), tagTerminatedAt, lines);
      }
    } else {
      const codeBlock = identifyCodeBlock(lines, i, i);
      if (codeBlock){
        
        lines.splice(i, codeBlock[1] - i , codeBlock[0]);
        if ( isCSSSyntax(codeBlock[0]) ) {
          lines[i] = parseCSS(codeBlock[0]);
        }else{
          // lines[i] = parseSomeJS(codeBlock[0]);
          lines[i] = prarseJs(codeBlock[0]);
        }
        // lines[i] = codeBlock[0];

      }
    }
  }
  await Bun.write(outputFile, JSON.stringify(lines, null, 2));
}

main().then(() => {
  console.log("Transformation complete. Check output.txt for results.");
});

function identifyCodeBlock(lines, i, j) {

  let openScope = 0;
  while (j < lines.length ) {
    if (lines[j].includes("{")) openScope++;
    if (lines[j].includes("}")) openScope--;
    j++;
    if (openScope === 0) break;
  }
  return [lines.slice(i, j).join(" "), j] 
}

function Split(str, splitter, side){
  // const spl = str.split(splitter);
  const spl = []
  while (str.includes(splitter)){
    let index = str.indexOf(splitter);
    if (side > 0) index += splitter.length;
    if (side < 0) index -= splitter.length;
    spl.push(str.slice(0, index));
    str = str.slice(index + 1);
  }
  // else if (side > 0) return splitter + spl[1];
  return spl;
}
