import { DOMParser, Node, CSSStyleSheet } from 'linkedom';

function parseHTMLToJSON(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const result = [];

    // Helper function to extract attributes from an element
    function getAttributes(element) {
        const attributes = {};
        for (const attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    // Helper function to parse CSS rules
    function parseCSSRules(cssText) {
        const rules = [];
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(cssText);

        for (const rule of styleSheet.cssRules) {
            const cssRule = {
                type: "cssRule",
                selector: rule.selectorText,
                properties: {}
            };
            for (const prop of rule.style) {
                cssRule.properties[prop] = rule.style[prop];
            }
            rules.push(cssRule);
        }
        return rules;
    }

    // Parse HTML elements recursively
    function parseElement(element, openLine) {
        const jsonElement = {
            type: "htmlElement",
            tagName: element.tagName.toLowerCase(),
            attributes: getAttributes(element),
            content: element.textContent.trim(),
            openLine: openLine,
            closeLine: openLine // Default, will be updated for nested elements
        };

        if (element.childNodes.length > 0) {
            jsonElement.children = [];
            for (const child of element.childNodes) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    jsonElement.children.push(parseElement(child, openLine));
                }
            }
        }

        return jsonElement;
    }

    // Parse the entire document
    function parseDocument(doc) {
        const body = doc.body;
        const head = doc.head;

        // Parse <head> content
        for (const child of head.childNodes) {
            // if (child.nodeType === Node.ELEMENT_NODE) {
            if (child.nodeType === 1) {
                if (child.tagName.toLowerCase() === 'style') {
                    const cssRules = parseCSSRules(child.textContent);
                    result.push(...cssRules);
                } else {
                    result.push(parseElement(child, 1)); // Assuming openLine is 1 for simplicity
                }
            }
        }

        // Parse <body> content
        for (const child of body.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                result.push(parseElement(child, 1)); // Assuming openLine is 1 for simplicity
            }
        }

        // Parse <script> content
        const scripts = doc.querySelectorAll('script');
        for (const script of scripts) {
            result.push({
                type: "script",
                content: script.textContent.trim(),
                openLine: 1, // Assuming openLine is 1 for simplicity
                closeLine: 1
            });
        }
    }

    parseDocument(doc);
    return result;
}

async function transformHTML(inputFile, outputFile) {
    try {
      let data = await Bun.file(inputFile).text();
    //   const fileByLine = data.split("\n");
    //   const tagsFound = [];
    //   for (let i = 0; i < fileByLine.length; i++) {
    //       fileByLine[i] = parseHTMLToJSON(fileByLine[i]);
    //   }
        const jsonOutput = parseHTMLToJSON(data);
      await Bun.write(outputFile, jsonOutput);
      console.log(`Transformed HTML saved to ${outputFile}`);
    } catch (err) {
      console.error("Error:", err);
    }
  }
  
  transformHTML("examp.html", "output.json");

// const jsonOutput = parseHTMLToJSON(htmlContent);
// console.log(JSON.stringify(jsonOutput, null, 2));