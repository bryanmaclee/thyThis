
const scrmlJS = []
const scrmlCSS = []
const scrmlHTML = []

export function isolateDecorators(str) {
    return str.replace(/\*#\d+/g, '\"\"');
}

const jsKeywords = [
    "const",
    "let",
    "var",
    "function",
    "=>",
    "if",
    "for",
    "while",
    "switch",
    "class",
    "return",
    "break",
    "continue",
    "throw",
    "try",
    "catch",
    "finally",
    "async",
    "await",
    "import",
    "export",
    "default",
    "class",
    "extends",
    "implements",
    "interface",
    "public",
    "private",
    "protected",
    "static",
    "get",
    "set",
    "new",
    "this",
    "super",
    "typeof",
    "instanceof",
    "in",
    "of",
    "as",
    "void",
    "delete",
    "yield",
    "do",
    "with",
    "debugger",
    "volatile",
    "synchronized",
    "native",
]

const htmlTags = [
    "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base",
    "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption",
    "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details",
    "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption",
    "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head",
    "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd",
    "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter",
    "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p",
    "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp",
    "script", "section", "select", "small", "source", "span", "strong", "style",
    "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea",
    "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var",
    "video", "wbr"
];

const openingJsTokens = [
    "{",
    "(",
    "[",
    ".",
    ",",
];
const openingCssTokens = [
    "{",
    "(",
    "[",
    ".",
    "#",
    "@",
    ":",
    ",",
];
const openingHtmlTokens = [
    "<",
    "<%",
    "</",
    "<!",
];
const stringTokens = [
    "\"",
    "'",
    "`",
];
const closingJsTokens = [
    "}",
    ")",
    "]",
    ";",
];
const closingCssTokens = [
    "}",
    ")",
    "]",
];
const closingHtmlTokens = [
    ">",
    "/>",
    "</",
    "<%",
    "<!",
]
const arbitraryScopeOpeners = [
    "{",
    "(",
    "[",
    "/<(\w+)(.*?)\/?>/",
];
// const jsKeywords = ["const", "let", "var", "function", "=>"];
// const cssTokens = ["{", "}", "(", ")", "[", "]", ";", ",", ":", "="];
// const jsTokens = ["{", "}", "(", ")", "[", "]", ";", ",", ":", "=", "=>"];
const jsOperators = ["+", "-", "*", "/", "%", "++", "--", "**", "+=", "-=", "*=", "/=", "%=", "==", "===", "!=", "!==", ">", "<", ">=", "<=", "&&", "||", "!", "&", "|", "^", "~", "<<", ">>", ">>>", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "=>"];
const cssOperators = ["+", "-", "*", "/", "%", "++", "--", "**", "+=", "-=", "*=", "/=", "%=", "==", "===", "!=", "!==", ">", "<", ">=", "<=", "&&", "||", "!", "&", "|", "^", "~", "<<", ">>", ">>>", "<<=", ">>=", ">>>=", "&=", "|=", "^="];
const arbitraryStatementOpeners = [
    "const", "let", "var", "function", "if", "for", "while", "do",
    "switch", "class", "return", "throw", "try", "async", "import",
    "export", "default", "new", "this", "super", "typeof",
    "instanceof", "void", "delete", "yield", "debugger", "with", "{",
    "(", "[", ".", "#", "@", ":", ",", "<", "<%", "</", "<!",
]
const ignorableTokens = [
    '*#'
];
const scrmlDecorators = {
    "I" : { variableType: "const", dataType: "int" },
    "S" : { variableType: "const", dataType: "string" },
    "F" : { variableType: "const", dataType: "float" },
    "B" : { variableType: "const", dataType: "boolean" },
    "O" : { variableType: "const", dataType: "object" },
    "A" : { variableType: "const", dataType: "array" },
    "i" : { variableType: "let", dataType: "int" },
    "s" : { variableType: "let", dataType: "string" },
    "f" : { variableType: "let", dataType: "float" },
    "b" : { variableType: "let", dataType: "boolean" },
    "o" : { variableType: "let", dataType: "object" },
    "a" : { variableType: "let", dataType: "array" },
    "C" : { variableType: "let", dataType: "class" },
    "C" : { variableType: "const", dataType: "class" },
    "fn" : { variableType: null, dataType: "function" },
}
export const fragments = {
    js: {
        opening: openingJsTokens,
        closing: closingJsTokens,
        keywords: jsKeywords,
        operators: jsOperators,
        scrml: scrmlJS,
        userDefined: [],
    },
    css: {
        opening: openingCssTokens,
        closing: closingCssTokens,
        keywords: [],
        operators: cssOperators,
        scrml: scrmlCSS,
        userDefined: [],
    },
    html: {
        opening: openingHtmlTokens,
        closing: closingHtmlTokens,
        keywords: htmlTags,
        operators: [],
        scrml: scrmlHTML,
        userDefined: [],
    },
    arbitraryStatementOpeners: arbitraryStatementOpeners,
    decorators: scrmlDecorators,
    string: stringTokens,
}

// const tagMatch = /<(\w+)(.*?)\/?>/
// console.log(tagMatch.test("</test stuff is='hello'>"));