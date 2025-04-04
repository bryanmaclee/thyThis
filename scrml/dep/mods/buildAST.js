export function buildAstVar(flatList) {
    const scopeStack = []; // Use an array as a stack (primarily for HTML structure)
    let parent = null; // To store the parent of the current node

    for (const node of flatList) {
        if (node === null) {
            if (scopeStack.length > 0) {
                scopeStack.pop();
            } else {
                // console.warn("Warning: Encountered null (closing tag) with an empty stack.");
            }
        }
        
    }
}

export function buildAst(flatList) {
    const stack = []; // Use an array as a stack (primarily for HTML structure)
    const astRoots = []; // To store the root(s) of the tree

    // Handle empty or invalid input early
    // console.log(flatList)
    // flatList = JSON.parse(flatList)
    // console.log('Checking if flatList exists:');
    if (!flatList) {
        // console.log('flatList is undefined or null.');
        return null;
    }

    // console.log('Checking if flatList is an array:');
    if (!Array.isArray(flatList)) {
        // console.log('flatList is not an array.');
        return null;
    }

    // console.log('Checking if flatList is non-empty:');
    if (flatList.length === 0) {
        // console.log('flatList is empty.');
        return null;
    }

    for (const item of flatList) {
        if (item === null) {
            if (stack.length > 0) {
                stack.pop();
            } else {
                // console.warn("Warning: Encountered null (closing tag) with an empty stack.");
            }
        } else if (typeof item === 'object' && item !== null) {
            const node = { ...item, children: [] };
            if (stack.length > 0) {
                const parent = stack[stack.length - 1];
                if (parent.children) {
                    parent.children.push(node);
                } else {
                    console.warn("Parent node missing children array:", parent);
                    parent.children = [node];
                }
            } else {
                astRoots.push(node);
            }
            if (node.language !== 'javascript' && !node?.selfClosing && node.openLine !== node.closeLine && node.language !== 'css') {
                stack.push(node);
            }
        } else {
            // console.warn("Warning: Encountered unexpected item type in flatList:", item);
        }
    }

    if (stack.length > 0) {
        const unclosedTags = stack.map(s => s?.name || 'Unnamed').join(', ');
        console.warn(`Warning: Stack not empty after processing. Unclosed HTML tags: ${unclosedTags}`);
    }

    if (astRoots.length === 1) {
        return astRoots[0]; // Common case: return the single root object
    } else if (astRoots.length > 1) {
        return astRoots; // Return array if multiple roots (fragments)
    } else {
        // No roots found, likely due to empty input or malformed structure
        return null;
    }
}

