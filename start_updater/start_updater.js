/**
 * start_updater.js
 * version: 0.2
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/function-frameworks
 */


/**
 * Start a requestAnimationFrame loop.
 * 
 * - Return value of `false` from the callback will terminate the loop.
 *
 * @param {(delta: number, last: boolean, total: number) => void | boolean} [info] - The callback that will called every frame
 * @param {Partial<StartUpdateOptions>} [options] - Optional configuration options.
 */
function start_updater(updater = null, options = null) {

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
            if (updater(res_delta, true, res_delta) === false) return;

        } else {
            const steps = Math.ceil(res_delta / max)
            const step = res_delta / steps;
            for (let i = 0; i < steps - 1; i++) {
                if (updater(step, false, res_delta) === false) return;
            }
            if (updater(step, true, res_delta) === false) return;
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
