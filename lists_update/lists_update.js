/**
 * lists_update.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Populate element children from expressions.
 * 
 * @param {Document | Element | string} [root=document] - Selector string or root element.
 * @param {Partial<ListsUpdateOptions>} options - Optional configuration options. 
 */
function lists_update(root = document, options) {

    const template_inflate_options = { html: false };
    const best_inflater = window.template_inflate ?
        (html, self) => window.template_inflate(html, self, template_inflate_options) :
        default_inflate;

    const default_options = {
        attr: "data-list",
        consume: false,
        reflect: "data-listing",
        separator: " of ",
        container: true,
        compiler: (expr) => eval(`(self, context) => ${expr}`),
        implicit: "self",
        prefix: "template-",
        key: (i) => i,
        inflater: best_inflater,
        context: true,
        lock: "list_key",
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

    function find_root(root) {
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

    function default_inflate(html, self) {
        const holder = document.createElement("div");
        holder.innerHTML = html.replaceAll("{{}}", self);
        if (holder.children.length == 0) throw new Error(`Template must contain an element: ${html}`)
        return holder.children[0];
    }

    function create_entry(element, options) {
        const text = element.getAttribute(options.attr).trim();
        if (!text) throw new Error("Missing definition");

        const sep_index = text.indexOf(options.separator);
        const name = sep_index == -1 ? null : text.substring(0, sep_index);
        const expr = sep_index == -1 ? text : text.substring(sep_index + options.separator.length);

        const template_name = options.prefix + name;

        let template_element = element.querySelector("template");
        if (template_element) {
            if (name && template_element.id && template_element.id != template_name) {
                throw new Error(`Template id mismatch, expected ${template_name}`);
            }
        } else {
            template_element = document.querySelector("template#" + template_name);
            if (!template_element) {
                throw new Error(`Template with id '${template_name}' not found`);
            }
        }
        const template_html = template_element.innerHTML;

        const container = options.container ? element.querySelector("div, span") : element;
        container.innerHTML = "";

        const provider = options.compiler(expr);
        const keys = [];
        const updater = () => update_list(element, container, provider, keys, template_html, options)
        return { element, updaters: [updater] }
    }

    function update_list(element, container, provider, keys, template_html, options) {
        const current_list = provider(element, element.context);

        const current_keys = current_list.map(i => options.key(i));
        if (same_arrays(current_keys, keys)) return;
        keys.length = 0;
        keys.push(...current_keys);

        const old = new Map();
        while (container.children.length) {
            const child = container.children[0];
            child.remove();
            old.set(child[options.lock], child);
        }

        for (let i = 0; i < current_list.length; i++) {
            const self = current_list[i];
            const key = current_keys[i];

            let item = old.get(key);
            if (!item) {
                item = options.inflater(template_html, self)
            }

            item.context = self;
            item[options.lock] = key;
            container.appendChild(item);
        }
    }

    function same_arrays(a1, a2) {
        if (a1.length != a2.length) return false;
        for (let i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) return false;
        }
        return true;
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
        if (!element.isConnected) {
            updaters.length = 0;
            elements_dead += 1;
            return false;
        }
        for (const updater of updaters) {
            updater();
        }
        return true;
    }

    function clean_elements() {
        let start = 0;
        while (elements[start]?.updaters.length == 0) start++;
        const reduced = [];
        for (let i = start; i < elements.length; i++) {
            if (elements[i].updaters.length == 0) continue;
            reduced.push(elements[i]);
        }
        elements.length = start + reduced.length;
        for (let i = 0; i < reduced.length; i++) {
            elements[start + i] = reduced[i];
        }
        elements_dead = 0;
    }

    lists_update = function lists_update(root = document, options_param) {
        const options = calc_options(options_param);

        if (!root) return update_all();

        const new_elements = collect_new_elements(root, options);
        for (const element of new_elements) {

            const entry = create_entry(element, options);
            elements.push(entry)

            if (!options.consume) {
                element.setAttribute(options.reflect, element.getAttribute(options.attr));
            }
            element.removeAttribute(options.attr);
        }

        if (elements_dead > elements.length / 2) {
            clean_elements();
        }

        const root_element = find_root(root);
        return update_inside(root_element);
    }

    return lists_update(document, options);
}

export default function (...args) { return lists_update(...args); }
