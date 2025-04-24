/**
 * template_inflate.js 
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Inflate a template by evaluating embedded expressions.
 *
 * @param {string | HTMLTemplateElement | HTMLElement} template - A template string or a DOM element.
 * @param {any} self - The context object used to evaluate expressions.
 * @param {Partial<TemplateInflateOptions>} [options] - Optional configuration options.
 * @returns {string | HTMLElement} The resulting HTML string or DOM element, depending on the `html` option.
 */
function template_inflate(template, self, options) {

    const default_options = {
        open: "{{",
        close: "}}",
        trim: false,
        handler: (expr, self, index) => eval(expr),
        html: true,
        renderer: (html) => create_element(html),
        cache: true,
        remember: false,
        reset: false,
    }
    let remembered_options = {};

    function calc_options(options_param) {
        const options = Object.assign({}, default_options, remembered_options);
        if (options_param) {
            Object.assign(options, options_param);
            if (options_param.remember) remembered_options = options_param;
            if (options_param.reset) remembered_options = {}
        }
        return options;
    }

    const cache = new Map();

    function extract_template(template) {
        if (typeof template === "string") {
            return template;
        } else if (template instanceof HTMLTemplateElement) {
            return template.innerHTML;
        } else if (template instanceof HTMLElement) {
            return template.outerHTML;
        } else {
            throw new TypeError(`Unsupported template type: ${template}`);
        }
    }

    function parse_template(template, options) {
        if (options.cache) {
            const cached = cache.get(template);
            if (cached) return cached;
        }

        const html = extract_template(template);
        const parsed = parse_html(html, options);

        if (options.cache) {
            cache.set(template, parsed);
        }
        return parsed
    }

    const TEMPLATE_OPEN = "<template";
    const TEMPLATE_CLOSE = "</template>";

    function parse_html(source, options) {

        let brackets_open = source.indexOf(options.open);
        if (brackets_open == -1) return [source];

        let template_open = source.indexOf(TEMPLATE_OPEN);
        if (template_open == -1) return parse_html_simple(source, options);

        const parts = [];
        let i = 0;
        while (i < source.length) {

            if (brackets_open == -1) {
                parts.push(source.substring(i));
                return parts;
            }
            const start = i;

            while (template_open != -1 && (template_open < brackets_open || brackets_open == -1)) {

                i = template_open + TEMPLATE_OPEN.length;
                template_open = source.indexOf(TEMPLATE_OPEN, i);
                let template_close = source.indexOf(TEMPLATE_CLOSE, i);

                let depth = 1;
                while (depth > 0) {
                    if (template_close == -1) throw new Error(`Template contains an unclosed template tag`);
                    if (template_open != -1 && template_open < template_close) {
                        i = template_open + TEMPLATE_OPEN.length;
                        template_open = source.indexOf(TEMPLATE_OPEN, i);
                        depth += 1;
                    } else {
                        i = template_close + TEMPLATE_CLOSE.length;
                        template_close = source.indexOf(TEMPLATE_CLOSE, i);
                        depth -= 1;
                    }
                }

                if (brackets_open < i) {
                    brackets_open = source.indexOf(options.open, i);
                    if (brackets_open == -1) {
                        parts.push(source.substring(start));
                        return parts;
                    }
                }
            }

            let brackets_close = source.indexOf(options.close, brackets_open + options.open.length);
            if (brackets_close == -1) throw new Error(`Missing closing '${options.close}'`);

            parts.push(
                source.substring(start, brackets_open),
                source.substring(brackets_open + options.open.length, brackets_close)
            )
            i = brackets_close + options.close.length;

            brackets_open = source.indexOf(options.open, i)
            if (template_open < i && template_open != -1) {
                template_open = source.indexOf(TEMPLATE_OPEN, i);
            }
        }

        return parts;
    }

    function parse_html_simple(source, options) {

        const parts = [];
        let i = 0;
        while (i < source.length) {
            let brackets_open = source.indexOf(options.open, i);
            if (brackets_open == -1) {
                parts.push(source.substring(i))
                break;
            }
            let brackets_close = source.indexOf(options.close, brackets_open + options.open.length);
            if (brackets_close == -1) throw new Error(`Missing closing '${options.close}'`);

            parts.push(
                source.substring(i, brackets_open),
                source.substring(brackets_open + options.open.length, brackets_close)
            )
            i = brackets_close + options.close.length;
        }

        return parts;
    }

    function inflate_parsed(parsed, self, options) {
        const inflated = new Array(parsed.length);
        for (let i = 0; i + 1 < parsed.length; i += 2) {
            inflated[i] = parsed[i]

            const expr = options.trim ? parsed[i + 1].trim() : parsed[i + 1];
            const index = (i / 2) | 0;
            inflated[i + 1] = options.handler(expr, self, index);
        }

        if (parsed.length % 2 == 1) {
            const last = parsed.length - 1;
            inflated[last] = parsed[last];
        }
        return inflated.join("")
    }

    function create_element(html) {
        const holder = document.createElement("div");
        holder.innerHTML = html;
        return holder.children[0];
    }

    template_inflate = function template_inflate(template, self, options_param) {
        const options = calc_options(options_param);

        if (!template) return template;

        const parsed = parse_template(template, options);
        const inflated = inflate_parsed(parsed, self, options);

        if (options.html) return inflated;

        const element = options.renderer(inflated)
        return element;
    }

    return template_inflate(template, self, options);
}

export default function (...args) { return template_inflate(...args); }
