export function parseCSS(cssString) {
    const cssRegex = /(?<selector>[.#]?\w[\w-]*)\s*\{(?<rules>[^}]+)\}/g;
    const nestedRegex = /(?<selector>[.#]?\w[\w-]*)\s*\{(?<rules>(?:[^{}]*|\{[^{}]*\})*)\}/g;

    const parseRules = (rulesString) => {
        const rules = {};
        const children = [];

        for (const match of rulesString.matchAll(nestedRegex)) {
            if (match.groups) {
                const { selector, rules } = match.groups;
                children.push(parseCSS(`${selector} { ${rules} }`));
            }
        }

        rulesString.split(';').forEach(rule => {
            const [property, value] = rule.split(':').map(part => part.trim());
            if (property && value) {
                rules[property] = value;
            }
        });

        return { rules, children };
    };

    const matches = [...cssString.matchAll(cssRegex)];
    if (!matches.length) {
        throw new Error("Invalid CSS format");
    }

    const results = matches.map(match => {
        const { selector, rules } = match.groups;
        const { rules: attributes, children } = parseRules(rules);

        let selectorType = 'unknown';
        if (selector.startsWith('.')) {
            selectorType = 'class';
        } else if (selector.startsWith('#')) {
            selectorType = 'id';
        } else if (/^[a-z]+$/i.test(selector)) {
            selectorType = 'element';
        }

        return {
            language: "css",
            selectorType,
            selector,
            attributes,
            children
        };
    });

    return results.length === 1 ? results[0] : results;
}

export function isCSSSyntax(code) {
    // CSS-specific patterns
    const cssPattern = /([.#]?\w[\w-]*\s*[,>+~]?\s*)+\s*{[^{}]*}/; // Selectors + `{}`
    const mediaQueryPattern = /@media\s*\([^{}]*\)\s*{[^{}]*}/; // Media queries

    // JavaScript-specific patterns
    const jsFunctionPattern = /function\s*\w*\s*\([^)]*\)\s*{/; // JS functions
    const jsImportPattern = /import\s.*from\s['"].*['"]/; // JS import syntax

    // Detection logic
    if (cssPattern.test(code) || mediaQueryPattern.test(code)) {
        return true; // Likely CSS
    }

    if (jsFunctionPattern.test(code) || jsImportPattern.test(code)) {
        return false; // Likely JavaScript
    }

    // Fallback based on common traits
    return code.includes(':') && code.includes(';'); // Typical CSS property syntax
}

