/**
 * start_updater.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Start a requestAnimationFrame loop.
 * 
 * - Return value of `false` from the callback will terminate the loop.
 *
 * @param {(delta: number) => void | boolean} [info] - The callback that will called every frame
 * @param {Partial<StartUpdateOptions>} [options] - Optional configuration options.
 */
function start_updater(updater, options) {

    const default_options = {
        init: true,
        resolution: 1000,
        max: Infinity,
        now: performance.now.bind(performance),
    };

    const {
        init,
        resolution,
        max,
        now,
    } = Object.assign({}, default_options, options || {});

    let last_update = now();

    const loop = () => {
        const delta = now() - last_update;
        last_update += delta;

        const res_delta = delta / resolution;

        if (res_delta <= max) {
            if (updater(res_delta) === false) return;

        } else {
            let left = res_delta;
            while (left > max) {
                if (updater(max) === false) return;
                left -= max;
            }
            if (updater(left) === false) return;
        }

        requestAnimationFrame(loop);
    }

    if (init) {
        loop();
    } else {
        requestAnimationFrame(loop);
    }
}


export default function (...args) { return start_updater(...args); }
