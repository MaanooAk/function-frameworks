import safe_guard from "../safe_guard.js";

import { expect } from "chai";
import { assert } from "console";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.window = dom.window;

var tests = {
    "prop_missing": () => {
        const object = safe_guard({
            "a": true,
            "b": false,
        })

        expect(object.a).eq(true);
        expect(object.b).eq(false);
        expect(object["a"]).eq(true);
        expect(object["b"]).eq(false);

        expect(() => object.c).to.throw(/Property missing/);
        expect(() => object["c"]).to.throw(/Property missing/);
        expect(() => object[1]).to.throw(/Property missing/);

        expect(() => object.c = 10).to.throw(/Property missing/);
        expect(() => object["c"] = 10).to.throw(/Property missing/);
        expect(() => object[1] = 10).to.throw(/Property missing/);
    },
    "function_basic": () => {
        const hello = safe_guard(function hello(person) {
            return "hello " + person
        })

        hello(1);
        expect(() => hello()).to.throw(/Missing 1/);
        expect(() => hello(1, 2)).to.throw(/Overflowed 1/);
        expect(() => hello(1, 2, 3)).to.throw(/Overflowed 2/);
        expect(() => hello(1, 2, 3, 4)).to.throw(/Overflowed 3/);
    },
    "function_defaults": () => {
        const hello = safe_guard(function hello(person, greet = "hello") {
            return greet + " " + person
        })

        hello(1);
        hello(1, 2);
        expect(() => hello()).to.throw(/Missing 1/);
        expect(() => hello(1, 2, 3)).to.throw(/Overflowed 1/);
        expect(() => hello(1, 2, 3, 4)).to.throw(/Overflowed 2/);
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
console.log("PASS safe_guard")
