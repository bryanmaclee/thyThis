

export function prarseJs(jsStr) {
    const splitJs = splitJS(jsStr)
    const decTypeObj = decType(splitJs[0])
    console.log(decTypeObj)
    const statementObj = {
        declaration: {
            text: splitJs[0],
            type: decTypeObj ? decTypeObj[0] : null,
            name: decTypeObj ? decTypeObj[1] : null,
            params: decTypeObj ? decTypeObj[2] : null,
        },

        body: splitJs[1],
    }
    return statementObj

}

function splitJS(jsStr) {
    return [jsStr.slice(0, jsStr.indexOf("{")), jsStr.slice(jsStr.indexOf("{") + 1, jsStr.lastIndexOf("}"))];
}

function decType(declaration) {
    // const typeRegex = /(?:const|let|var|function|if|for|switch|while|do|class)\s+(\w+)/;
    // const typeRegex = /\b(const|let|var|function|if|for|switch|while|do|class)\b\s+(\w+)/;
    const typeRegex = /\b(const|let|var|function|if|for|switch|while|do|class)\b\s+(\w+)/g;

    const parameterRegex = /\(([^)]+)\)/;
    // const decMatch = declaration.match(typeRegex);

    const matches = [...declaration.matchAll(typeRegex)];

    const decMatch = matches.map(match => [match[1], match[2]]);

    if (decMatch) {
        const paramMatch = declaration.match(parameterRegex);
        return [decMatch[0], decMatch[1], paramMatch ? paramMatch[1].split(",").map(param => param.trim()) : []];
    }
    return null;
}

function extractJsScopes(jsStr) {
    const scopes = [];
    let openScope = 0;
    let start = 0;

    for (let i = 0; i < jsStr.length; i++) {
        if (jsStr[i] === '{') {
            if (openScope === 0) {
                start = i;
            }
            openScope++;
        } else if (jsStr[i] === '}') {
            openScope--;
            if (openScope === 0) {
                scopes.push(jsStr.slice(start, i + 1));
            }
        }
    }

    return scopes;
}