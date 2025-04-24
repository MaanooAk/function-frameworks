/**
 * element_classes.js 
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Define constraints that should be applied to the classes of a collection of elements. 
 * 
 * @param {string | Element[] | NodeList} elements - Selector string or array of elements.
 * @returns {ElementClasses} Instance of ElementClasses to define the constraints.
 */
function element_classes(elements) {

    function elements_list(elements) {
        if (Array.isArray(elements)) return elements;
        if (typeof elements === "string") {
            return Array.from(document.querySelectorAll(elements));
        } else if (elements instanceof NodeList) {
            return Array.from(elements);
        } else {
            throw new TypeError(`Unsupported elements type: ${elements}`);
        }
    }

    class ElementClasses {
        constructor(elements) {
            this.elements = elements;
        }

        one(name) {
            handler_one(this.elements, 1, 1, name);
            return this;
        }
        exactlyOne(name) {
            handler_one(this.elements, 1, 1, name);
            return this;
        }
        atLeastOne(name) {
            handler_one(this.elements, 1, Infinity, name);
            return this;
        }
        atMostOne(name) {
            handler_one(this.elements, 0, 1, name);
            return this;
        }
        between(min, max, name) {
            handler_one(this.elements, min, max, name);
            return this;
        }
        each(...names) {
            handler_each(this.elements, 1, 1, names.flat());
            return this;
        }
        eachExactlyOne(...names) {
            handler_each(this.elements, 1, 1, names.flat());
            return this;
        }
        eachAtLeastOne(...names) {
            handler_each(this.elements, 1, Infinity, names.flat());
            return this;
        }
        eachAtMostOne(...names) {
            handler_each(this.elements, 0, 1, names.flat());
            return this;
        }
        eachBetween(min, max, ...names) {
            handler_each(this.elements, min, max, names.flat());
            return this;
        }
    }

    const observe_options = {
        attributes: true,
        attributeFilter: ['class'],
    }
    const observe_options_old = {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
    }

    function handler_one(elements_param, min, max, name) {
        if (min < 0 || min > max) throw new Error(`Invalid min max range: ${min}-${max}`);

        const elements = elements_param.map(i => i);

        function listener() {
            const has = [], mis = [];
            for (const element of elements) {
                (element.classList.contains(name) ? has : mis).push(element)
            }
            const count = has.length;
            if (count >= min && count <= max) return;

            if (count < min) {
                const count_add = min - count;
                for (let i = 0; i < count_add && i < mis.length; i++) {
                    mis[i].classList.add(name)
                }
            } else { // if (count > max) {
                const count_remove = count - max;
                for (let i = 0; i < count_remove && i < has.length; i++) {
                    has[i].classList.remove(name)
                }
            }
        }

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const element = mutation.target;
                const index = elements.indexOf(element);
                elements.splice(index, 1);
                elements.push(element)
            }
            listener();
        })
        for (const element of elements) {
            observer.observe(element, observe_options);
        }
        listener();
    }

    function handler_each(elements, min, max, names_param) {
        if (min < 0 || min > max) throw new Error(`Invalid min max range: ${min}-${max}`);
        if (names_param.length < min) throw new Error(`Number of names do not satisfy th range`)

        const names = new Set(names_param);
        function listener(element, old) {
            const has = [], mis = [];
            for (const name of names) {
                (element.classList.contains(name) ? has : mis).push(name)
            }
            const count = has.length;
            if (count >= min && count <= max) return;

            const current_names = new Set(has);
            const prev_names = new Set(old.split(" "));

            if (count < min) {
                const missing_names = names.difference(current_names);
                const count_add = min - count;
                const to_add = Array.from(missing_names.difference(prev_names)).slice(0, count_add);
                if (to_add.length < count_add) {
                    const left_missing_names = missing_names.intersection(prev_names)
                    to_add.push(...Array.from(left_missing_names).slice(0, count_add - to_add.length))
                }
                for (const i of to_add) {
                    element.classList.add(i)
                }
            } else { // if (count > max) {
                const count_remove = count - max;
                const to_remove = Array.from(current_names.intersection(prev_names)).slice(0, count_remove);
                if (to_remove.length < count_remove) {
                    const left_current_names = current_names.difference(prev_names)
                    to_remove.push(...Array.from(left_current_names).slice(0, count_remove - to_remove.length))
                }
                for (const i of to_remove) {
                    element.classList.remove(i)
                }
            }
        }

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const element = mutation.target;
                const old = mutation.oldValue;
                listener(element, old)
            }
        })
        for (const element of elements) {
            observer.observe(element, observe_options_old);
            listener(element, element.getAttribute("class") || "")
        }
    }

    element_classes = function (elements_param) {
        const elements = elements_list(elements_param);
        return new ElementClasses(elements);
    }

    return element_classes(elements);
}

export default function (...args) { return element_classes(...args); }
