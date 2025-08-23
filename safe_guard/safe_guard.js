/**
 * safe_guard.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * TODO
 */
function safe_guard(object) {

    function parse_args(source) {
        const match = source.match(/\(([^)]*)\)/);
        if (!match || !match[1].trim()) return 0;
        if (match[1].includes("...")) return Infinity;
        return match[1].split(",").length;
    }

    const function_handler = {
        apply(target, thisArg, args) {
            const min = target.length;

            const source = target.toString();
            const max = parse_args(source);

            if (args.length < min) throw new Error(`Missing ${min - args.length} arguments`);
            if (args.length > max) throw new Error(`Overflowed ${args.length - max} arguments`);
            return Reflect.apply(target, thisArg, args);
        },
        construct(target, args, new_target) {
            const instance = Reflect.construct(target, args, new_target);
            return safe_guard(instance);
        },
    }

    const object_handler = {
        get(target, prop, receiver) {
            if (!(prop in target)) throw new Error(`Property missing: ${prop} get`);
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === "function") {
                return new Proxy(value, function_handler)
            } else {
                return value;
            }
        },
        set(target, prop, value, receiver) {
            if (!(prop in target)) throw new Error(`Property missing: ${prop} set`);
            return Reflect.set(target, prop, value, receiver);
        },
    };

    safe_guard = function safe_guard(target) {

        if (target === undefined) {

            const globals = Object.getOwnPropertyNames(window);
            for (const name of globals) {
                const value = window[name];

                if (typeof value === "function") {
                    const code = Function.prototype.toString.call(value);
                    const user = !code.includes("[native code]");
                    if (user) {
                        window[name] = safe_guard(value)
                    }
                }
            }
        }

        if (target === null) { // || target === undefined) {
            return target;
        } else if (typeof target === "object") {
            return new Proxy(target, object_handler)
        } else if (typeof target === "function") {
            return new Proxy(target, function_handler)
        } else {
            return target;
        }
    }

    return safe_guard(object);
}

export default function (...args) { return safe_guard(...args); }
