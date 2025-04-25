/**
 * storage_sync.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Synchronize objects with the localStorage.
 *
 * - If called with no arguments, stores all tracked objects.
 * - If called with just an object, stores that specific tracked object.
 * - If called with object + info/options, will store/load/migrate accordingly.
 *
 * @param {Object} object - The object to synchronize.
 * @param {string | Partial<StorageSyncInfo>} [info] - Name of the object in storage or an info object.
 * @param {Partial<StorageSyncOptions>} [options] - Optional configuration options.
 */
function storage_sync(object, info, options) {

    const default_options = {
        prefix: "Storage",
        storage: localStorage,
        encoder: default_encoder,
        decoder: default_decoder,
        stringify: JSON.stringify,
        parse: JSON.parse,
        remember: true,
        reset: false,
    }
    let remembered_options = {};

    const default_info = {
        name: null,
        version: 1,
        migrate: (object, from, to) => null,
        track: true,
        init: true,
    }

    function calc_options(options_param, info_param) {
        const options = Object.assign({}, default_options, remembered_options, default_info);
        if (options_param) {
            Object.assign(options, options_param);
            if (options.remember) remembered_options = options_param;
            if (options_param.reset) remembered_options = {};
        }
        if (info_param) {
            if (typeof info_param === "string") {
                Object.assign(options, { name: info_param })
            } else {
                Object.assign(options, info_param)
            }
        }
        return options;
    }


    function default_encoder(object, version, stringify) {
        return version + " " + stringify(object)
    }

    function default_decoder(text, parse) {
        const index = text.indexOf(" ");
        return {
            object: parse(text.substring(index + 1)),
            version: +text.substring(0, index),
        }
    }

    class ObjectInfo {
        constructor(object, options) {
            this.object = object;
            this.options = options;
        }

        store() {
            const o = this.options;
            const code = o.encoder(this.object, o.version, o.stringify);
            o.storage[o.prefix + o.name] = code;
            return true;
        }

        load() {
            const o = this.options;
            const code = o.storage[o.prefix + o.name];
            if (code === undefined) return false;
            const { object, version } = o.decoder(code, o.parse);
            if (version == o.version) {
                Object.assign(this.object, object)
            } else {
                const migrated = migrated_object(o.migrate, object, version, o);
                if (!migrated) return false;
                Object.assign(this.object, migrated);
            }
            return true;
        }
    }

    function migrated_object(m, object, version, options) {
        if (!m) return m;
        if (typeof m === "function") {
            return m(object, version, options.version);
        }
        return migrated_object(m[version], object, version, options);
    }

    const infos = new Map();

    storage_sync = function storage_sync(object, info_param, options_param) {
        const options = calc_options(options_param, info_param);

        if (arguments.length == 0) {
            for (const info of infos.values()) {
                info.store();
            }

        } else if (object == null) {
            return null;

        } else if (!info_param) {
            const info = infos.get(object);
            if (!info) throw new Error("Unknown object, 'info' param is required");
            info.store();

        } else {
            const info = new ObjectInfo(object, options);
            if (options.track) {
                if (!infos.has(object)) {
                    if (options.init) info.load();
                }
                infos.set(object, info);
            } else {
                if (options.init) info.load();
            }
            info.store();
        }
    }

    return storage_sync(object, info, options);
}

export default function (...args) { return storage_sync(...args); }
