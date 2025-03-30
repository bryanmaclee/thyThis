

// console.log(parseJavaScriptStatements(codeSample));
import * as parser from '@babel/parser';

// Helper function to get the simplified statement type
function getSimplifiedStatementType(node) {
    switch (node.type) {
        case 'FunctionDeclaration':
            return 'function';
        case 'VariableDeclaration':
            return node.kind; // 'const', 'let', or 'var'
        case 'ClassDeclaration':
            return 'class';
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
            return 'for';
        case 'IfStatement':
            return 'if';
        case 'WhileStatement':
            return 'while';
        case 'DoWhileStatement':
            return 'do-while';
        case 'SwitchStatement':
            return 'switch';
        case 'ExportNamedDeclaration':
        case 'ExportDefaultDeclaration':
        case 'ExportAllDeclaration':
            return 'export'; // Could refine further if needed
        case 'ImportDeclaration':
            return 'import';
        case 'ExpressionStatement':
             // Could be an assignment, function call, etc.
             // Let's try to be a bit more specific if it's an assignment
            if (node.expression.type === 'AssignmentExpression') {
                return 'assignment';
            }
            // If it's just an identifier or something simple, maybe skip or label 'expression'
            // For this example, we might primarily care about declarations/blocks
            return 'expression'; // General fallback for statements that are just expressions
        // Add other statement types as needed
        default:
            return node.type; // Return the raw AST type if not specifically handled
    }
}


/**
 * Extracts valid top-level JavaScript statements from a string containing mixed text and JS.
 * Assumes the JS is embedded within a template literal like `export const codeSample = \`...\`;`
 *
 * @param {string} documentString The full document string.
 * @returns {Array<{statement: string, type: string, lineNumber: number}> | null} An array of objects,
 * each containing the statement code, its type, and original line number, or null if parsing fails.
 */
function extractJsStatements(documentString) {
    let templateLiteralContent = '';
    let templateLiteralStartLine = -1;

    // --- Step 1: Parse the outer document to find and extract the template literal content ---
    try {
        const outerAst = parser.parse(documentString, {
            sourceType: 'module', // Assume module context for 'export'
            errorRecovery: true   // Try to continue parsing even with errors
        });

        // Find the VariableDeclaration for 'codeSample'
        const declaration = outerAst.program.body.find(node =>
            node.type === 'ExportNamedDeclaration' &&
            node.declaration &&
            node.declaration.type === 'VariableDeclaration' &&
            node.declaration.declarations[0] &&
            node.declaration.declarations[0].id.name === 'codeSample'
        );

        if (declaration && declaration.declaration.declarations[0].init.type === 'TemplateLiteral') {
            const templateLiteralNode = declaration.declaration.declarations[0].init;
            // Extract raw content between backticks
            // Node locations usually include the quotes/backticks, so adjust indices.
            // templateLiteralNode.start/end are character offsets
            templateLiteralContent = documentString.substring(templateLiteralNode.start + 1, templateLiteralNode.end - 1);
            // Get the line number where the template literal *content* begins
            templateLiteralStartLine = templateLiteralNode.loc.start.line;
        } else {
            console.error("Could not find the expected 'export const codeSample = `...`' structure.");
            return null;
        }

    } catch (outerError) {
        console.error("Error parsing the outer document structure:", outerError);
        // Attempt fallback: simple regex to find template literal (less robust)
        const match = /export\s+const\s+codeSample\s*=\s*`([\s\S]*)`;/.exec(documentString);
         if (match && match[1]) {
             templateLiteralContent = match[1];
             // Estimate start line - count newlines before the match starts
             const linesBefore = documentString.substring(0, match.index).split('\n').length;
             templateLiteralStartLine = linesBefore; // Line where ` starts
             console.warn("Used fallback regex to extract template literal content.");
         } else {
             console.error("Fallback regex also failed. Cannot extract JS content.");
             return null;
         }
    }

     // The first line *inside* the template literal corresponds to the line *after* the opening backtick.
     const contentStartLineInOriginalDoc = templateLiteralStartLine + 1;


    // --- Step 2: Parse the extracted template literal content ---
    const results = [];
    if (templateLiteralContent) {
        try {
            const innerAst = parser.parse(templateLiteralContent, {
                sourceType: 'module', // Or 'script' if no import/export expected inside
                errorRecovery: true, // IMPORTANT: Tolerate syntax errors from plain text
                tolerant: true       // Enable tolerant mode
            });

            // --- Step 3: Iterate through top-level nodes in the AST body ---
            innerAst.program.body.forEach(node => {
                 // Basic check to filter out potential nodes created from errors/text
                if (!node.type || !node.loc || typeof node.start !== 'number' || typeof node.end !== 'number') {
                    // Skip nodes that look incomplete or invalid, potentially generated by error recovery
                    // console.log("Skipping potentially invalid node:", node);
                    return;
                }

                // Filter out nodes that might just be representing the plain text errors (heuristics may be needed)
                // For now, let's assume errorRecovery + checking type/loc is enough for simple cases.
                // A very basic check: if a node spans multiple lines but contains only non-JS like text,
                // the parser might create an odd node type or error. We rely on standard types here.
                const validJsTypes = [
                    'FunctionDeclaration', 'VariableDeclaration', 'ClassDeclaration', 'ForStatement',
                    'ForInStatement', 'ForOfStatement', 'IfStatement', 'WhileStatement',
                    'DoWhileStatement', 'SwitchStatement', 'ExpressionStatement',
                    'ImportDeclaration', 'ExportNamedDeclaration', 'ExportDefaultDeclaration',
                    'ExportAllDeclaration'
                    // Add other valid top-level statement types if needed
                ];

                if (validJsTypes.includes(node.type)) {
                    const statementType = getSimplifiedStatementType(node);
                    const statementCode = templateLiteralContent.substring(node.start, node.end);
                    // Calculate the line number relative to the *original* document
                    const originalLineNumber = contentStartLineInOriginalDoc + node.loc.start.line - 1;

                    results.push({
                        statement: statementCode.trim(),
                        type: statementType,
                        lineNumber: originalLineNumber
                    });
                } else {
                    // Log nodes that are parsed but not extracted, for debugging
                    // console.log(`Skipping node of type ${node.type} at line ${node.loc.start.line}`);
                }
            });

        } catch (innerError) {
            // Even with tolerant mode, severe errors might stop parsing.
            // The results array might contain successfully parsed statements before the error.
            console.warn("Parsing error within template literal content (might be partial results):", innerError.message);
             // If results were gathered before the error, we can still return them.
            if (results.length === 0) {
                 console.error("No statements extracted due to parsing error.");
                 return null; // Indicate failure if nothing was extracted
            }
        }
    }

    return results;
}

// --- Example Usage ---
const codeSample = `
export const codeSample = \`
    This is some text outside of JavaScript.

    function example() {
        this is some text inside javascript;
        if (true) {
            this is some text inside javascript;
            let x = 10;
        }
    }

    More plain text here.

    for (let i = 0; i < 10; i++) {
        this is some text inside javascript;
        console.log(i);
    }

    const y = 20;

    Some other text that should not be included.

    class Test {
        this is some text inside javascript;
        constructor() {
            this is some text inside javascript;
            this.value = 5;
        }
    }
\`;
`;


const extractedStatements = extractJsStatements(codeSample);

if (extractedStatements) {
    console.log(JSON.stringify(extractedStatements, null, 2));
} else {
    console.log("Failed to extract statements.");
}