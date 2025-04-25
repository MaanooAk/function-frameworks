/**
 * binds_update.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */

/**
 * Bind expressions with element properties with attributes.
 * 
 * @param {Document} [root=document] - Selector string or root element.
 * @param {Partial<BindsUpdateOptions>} options - Optional configuration options. 
 */
function binds_update(root = document, options) {

    const default_options = {
        attr: "data-bind",
        consume: false,
        reflect: "data-bond",
        implicit: "html",
        separator: ";",
        binder: ":",
        compiler: (expr) => eval(`() => ${expr}`),
        remember: true,
        reset: false,
    }
    let remembered_options = {};

    function calc_options(options_param) {
        const options = Object.assign({}, default_options, remembered_options);
        if (options_param) {
            Object.assign(options, options_param);
            if (options.remember) remembered_options = options_param;
            if (options_param.reset) remembered_options = {};
        }
        return options;
    }

    const types = {
        "html": (e, v) => e.innerHTML = v,
        "text": (e, v) => e.innerText = v,
        "value": (e, v) => e.value = v,
        "checked": (e, v) => e.checked = !!v,
        "context": (e, v) => e.context = v,
        "hidden": (e, v) => e.hidden = !!v,
    }
    const dynamic_types = {
        "class-": (e, v, name) => v ? e.classList.add(name) : e.classList.remove(name),
        "attr-": (e, v, name) => e.setAttribute(name, v),
        "var-": (e, v, name) => e.style.setProperty("--" + name, v)
    }

    function find_root(root, options) {
        if (typeof root === "string") {
            const possible = Array.from(document.querySelectorAll(root));
            if (possible.length == 0) throw new Error(`Root selects no elements: ${root}`)
            if (possible.length >= 2) throw new Error(`Root selects multiple elements: ${root}`)
            return possible[0]
        } else if (root.querySelectorAll) {
            return root;
        } else {
            throw new TypeError(`Unsupported root type: ${root}`)
        }
    }

    function collect_new_elements(root, options) {
        if (typeof root === "string") {
            return Array.from(document.querySelectorAll(`${root} [${options.attr}]`));
        } else if (root.querySelectorAll) {
            return Array.from(root.querySelectorAll(`[${options.attr}]`));
        } else {
            throw new TypeError(`Unsupported root type: ${root}`)
        }
    }

    function parse_defs(text, options) {
        const def_texts = text.split(options.separator);
        const defs = [];
        for (const i of def_texts) {
            const def = parse_def(i, options);
            if (def) defs.push(def);
        }
        return defs;
    }

    function parse_def(text, options) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        const index = trimmed.indexOf(options.binder);
        if (index == -1) return create_updater(options.implicit, null, trimmed, options);

        const type = trimmed.substring(0, index).trim();
        const expr = trimmed.substring(index + 1).trim();
        if (types[type]) return create_updater(type, null, expr, options);

        const type_index = type.indexOf("-");
        if (type_index == -1) throw new Error(`Unknown type '${type}' in: ${text}`);

        const prefix = type.substring(0, type_index + 1)
        const name = type.substring(type_index + 1)
        if (dynamic_types[prefix]) return create_updater(prefix, name, expr, options)

        throw new Error(`Unknown dynamic type '${prefix}' in: ${text}`);
    }

    function create_updater(type, name, expr, options) {
        const handler = name === null ? types[type] : dynamic_types[type];
        const provider = options.compiler(expr);

        let last = undefined;
        return (ele) => {
            const value = provider();
            if (value === last) return false;
            last = value;
            handler(ele, value, name);
            return true;
        }
    }

    const elements = [];
    let elements_dead = 0;

    function update_all() {
        for (const i of elements) {
            if (i.updaters.length) {
                update_element(i)
            }
        }
    }

    function update_inside(root_element) {
        for (const i of elements) {
            if (i.updaters.length && root_element.contains(i.element)) {
                update_element(i)
            }
        }
    }

    function update_element({ element, updaters }, options) {
        if (!document.contains(element)) {
            updaters.length = 0;
            elements_dead += 1;
            return false;
        }
        for (const updater of updaters) {
            updater(element);
        }
        return true;
    }

    binds_update = function binds_update(root = document, options_param) {
        const options = calc_options(options_param);

        if (!root) return update_all();

        const new_elements = collect_new_elements(root, options);
        for (const element of new_elements) {
            const defs_text = element.getAttribute(options.attr);
            const updaters = parse_defs(defs_text, options);
            elements.push({ element, updaters })

            if (!options.consume) {
                element.setAttribute(options.reflect, defs_text);
            }
            element.removeAttribute(options.attr);
        }

        const root_element = find_root(root);
        return update_inside(root_element);
    }

    return binds_update(document, options);
}

export default function (...args) { return binds_update(...args); }
