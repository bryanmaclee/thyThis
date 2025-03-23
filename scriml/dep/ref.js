async function parseByChar(inputFile, outputFile) {
  try {
    const statementPartials = [];
    const file = await Bun.file(inputFile).text();
    const fileByChar = file.split("");
    const partUnknownType = [];
    const statements = [];
    let partial = { type: undefined, value: "" };

    function resetPartial() {
      partial = { type: undefined, value: "" };
    }

    for (let i = 0; i < fileByChar.length; i++) {
      while (fileByChar[i] === " " || fileByChar[i] === "\n") {
        partial.value += fileByChar[i];
        partial.type = "whitespace-formatting";
        i++;
      }
      if (partial.type !== undefined) statements.push(partial);
      resetPartial();
      if (i >= fileByChar.length) break;
      if (fileByChar[i] === "<" && fileByChar[i + 1] === "!") {
        console.log("Found a DOCTYPE");
        partial.type = "doctype";
        while (fileByChar[i] !== ">") {
          partial.type += fileByChar[i];
          i++;
        }
        statements.push(partial);
        resetPartial();
        if (i >= fileByChar.length) break;
      } else if (fileByChar[i] === "<" && fileByChar[i + 1] === "?") {
        console.log("Found a processing instruction");
        partial.type = "processing-instruction";
        while (fileByChar[i] !== ">") {
          i++;
          partial.type += fileByChar[i];
        }
        statements.push(partial);
        resetPartial();
        if (i >= fileByChar.length) break;
      }
      // else if (fileByChar[i] === "<" && fileByChar[i + 1] === "/") {
      //   // console.log("Found a closing tag");
      //   partial.type = "closing-tag";
      //   while (fileByChar[i] !== ">") {
      //     i++;
      //     partial.type += fileByChar[i];
      //   }
      //   statements.push(partial);
      //   resetPartial();
      //   if (i >= fileByChar.length) break;
      // }
      if (fileByChar[i] === "/" && fileByChar[i + 1] === "/") {
        console.log("Found a comment");
        partial.type = "comment";
        while (fileByChar[i] !== "\n") {
          i++;
          partial.type += fileByChar[i];
        }
        statements.push(partial);
        resetPartial();
        if (i >= fileByChar.length) break;
      } else if (fileByChar[i] === "/" && fileByChar[i + 1] === "*") {
        console.log("Found a multi-line comment");
        partial.type = "comment";
        while (fileByChar[i] !== "*" && fileByChar[i + 1] !== "/") {
          i++;
          partial.type += fileByChar[i];
        }
        statements.push(partial);
        resetPartial();
        if (i >= fileByChar.length) break;
        i += 2; // Skip the closing */
      }
      resetPartial();
      if (fileByChar[i] === "<") {
        partial.value += fileByChar[i];
        partial.type = "html-tag";
        while (fileByChar[i] !== ">") {
          i++;
          partial.value += fileByChar[i];
        }
        const tagAttributes = parseTagAttributes(partial.value);
        // console.log(tagAttributes);
        statementPartials.push(partial.value);
        statements.push({ type: "html-tag", value: tagAttributes });
        resetPartial();
      } else if (fileByChar[i] === "#") {
        statementPartials.push(fileByChar[i]);
      } else if (fileByChar[i] === "f") {
        console.log(i, nextSome(fileByChar, i));
        // nextSome(fileByChar, i);
        if (nextSome(fileByChar, i) === "function") {
          console.log("Found a function");
          let func = fileByChar[i];
          let openScopes = 1;
          while (fileByChar[i] !== "}" && openScopes === 1) {
            if (fileByChar[i] === "{") openScopes++;
            if (fileByChar[i] === "}") openScopes--;
            i++;
            func += fileByChar[i];
          }
          statementPartials.push(func);
          statements.push({ type: "function", value: func });
          resetPartial();
        }
      }
    }
    await Bun.write(outputFile, JSON.stringify(statements, null, 2));
    console.log(`Parsed content saved to ${outputFile}`);
  } catch (err) {
    console.error("Error:", err);
  }
}
