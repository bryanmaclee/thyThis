const htmlTagsByCat = {
    metadata: ["base", "head", "link", "meta", "style", "title"],
    contentSectioning: ["address", "article", "aside", "footer", "header", "h1", 
                        "h2", "h3", "h4", "h5", "h6", "hgroup", "main", "nav", 
                        "section"],
    textContent: ["blockquote", "dd", "div", "dl", "dt", "figcaption", "figure", 
                  "hr", "li", "ol", "p", "pre", "ul"],
    inlineTextSemantics: ["a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", 
                          "data", "dfn", "em", "i", "kbd", "mark", "q", "rp", 
                          "rt", "ruby", "s", "samp", "small", "span", "strong", 
                          "sub", "sup", "time", "u", "var", "wbr"],
    imageMultimedia: ["area", "audio", "img", "map", "track", "video"],
    embeddedContent: ["embed", "iframe", "object", "picture", "portal", "source"],
    scripting: ["canvas", "noscript", "script"],
    demarcatingEdits: ["del", "ins"],
    tableContent: ["caption", "col", "colgroup", "table", "tbody", "td", "tfoot", 
                   "th", "thead", "tr"],
    forms: ["button", "datalist", "fieldset", "form", "input", "label", "legend", 
            "meter", "optgroup", "option", "output", "progress", "select", 
            "textarea"],
    interactiveElements: ["details", "dialog", "summary"],
    webComponents: ["slot", "template"]
  };

  const htmlTagsFlat = [
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
  
  export default htmlTagsFlat;
  export { htmlTagsByCat };