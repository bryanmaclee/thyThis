// import { buildTagObj, multiLineHtml } from "./dep/mods/buildTagObj";
import { transformHTML } from "./dep/mods/transformHTML.js";
import { isCSSSyntax, parseCSS } from "./dep/mods/cssParser.js";
import { parseJs } from "./dep/mods/jsParserB.js";
import { buildAst } from "./dep/mods/buildAST.js";
import { fragments, isolateDecorators } from "./dep/mods2/fragmentLib.js";
import { buildTagObj, analyzeLine } from "./dep/mods/buildTagObj.js";
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
  // console.log(lines);
  const astLines = analyzeLine(lines, 0, lines.length);
  const jsonFlat = JSON.stringify(astLines, null, 2);
  // console.log(astLines)
  await Bun.write(flatJson, jsonFlat);
  // console.log(builtLines)
  // console.log(jsonNested)
//   const jsonNested = buildAst(builtLines);
//   await Bun.write(outputFile, JSON.stringify(jsonNested, null, 2));
  // const
}
main().then(() => {
  console.log("Transformation complete. Check outputht.txt for results.");
});



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



