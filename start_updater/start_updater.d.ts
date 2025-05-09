
/** Configuration object for start_updater behavior */
export type StartUpdateOptions = {
    /** Whether to start the loop immediately (default: true) */
    init: boolean,
    /** Time resolution for delta normalization in milliseconds (default: 1000) */
    resolution: number,
    /** Max delta value before updater is called multiple times in resolution time (default: Infinity) */
    max: number,
    /** Time provider function in milliseconds (default: performance.now) */
    now: () => number,
};


/**
 * Start a requestAnimationFrame loop.
 * 
 * - Return value of `false` from the callback will terminate the loop.
 *
 * @param {(delta: number) => void | boolean} [info] - The callback that will be called every frame
 * @param {Partial<StartUpdateOptions>} [options] - Optional configuration options.
 */
declare function start_updater(
    updater: (delta: number) => void | boolean,
    options?: Partial<StartUpdateOptions>
): void;