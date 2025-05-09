import start_updater from "../start_updater.js";

import { expect } from "chai";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.document = dom.window.document;
global.requestAnimationFrame = (x) => setTimeout(x, 1);

var tests = {
    "basic": async () => {
        const prom = new Promise((resolve, reject) => {
            start_updater((delta) => {
                resolve(100);
                return false;
            })
        });
        expect(await prom).eq(100);
    },
    "loop": async () => {
        const prom = new Promise((resolve, reject) => {
            let count = 0;
            start_updater((delta) => {
                count += 1;
                if (count == 3) {
                    resolve(count);
                    return false;
                }
            })
        });
        expect(await prom).eq(3);
    },
    "init delta": async () => {
        const prom = new Promise((resolve, reject) => {
            start_updater((delta) => {
                resolve(delta);
                return false;
            }, { now: () => Math.random() })
        });
        expect(await prom).not.eq(0);
    },
}

for (const name in tests) {
    try {
        await tests[name]()
    } catch (e) {
        console.log("FAIL:", name);
        throw e
    }
}
console.log("PASS start_updater")
