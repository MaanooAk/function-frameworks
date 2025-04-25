import storage_sync from "../storage_sync.js";

import { expect } from "chai";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.document = dom.window.document;
global.localStorage = {}; //dom.window.localStorage;

var tests = {
    "store": async () => {
        const o = { number: 10 };
        storage_sync(o, { name: "Number" })
        expect(localStorage["StorageNumber"]).eq(`1 {"number":10}`);
        o.number = 20;
        expect(localStorage["StorageNumber"]).eq(`1 {"number":10}`);
        storage_sync(o, { name: "Number" })
        expect(localStorage["StorageNumber"]).eq(`1 {"number":20}`);
        o.number = 30;
        storage_sync(o)
        expect(localStorage["StorageNumber"]).eq(`1 {"number":30}`);
        storage_sync(o)
        expect(localStorage["StorageNumber"]).eq(`1 {"number":30}`);
    },
    "load": async () => {
        const o1 = { name: "test" };
        storage_sync(o1, { name: "test" }, { prefix: "" })
        expect(localStorage["test"]).eq(`1 {"name":"test"}`);
        const o2 = { name: "should be replaced" };
        storage_sync(o2, { name: "test" })
        expect(localStorage["test"]).eq(`1 {"name":"test"}`);
        expect(o1.name).eq("test")
        expect(o2.name).eq("test")
        storage_sync(null, null, { reset: true })
    },
    "store and load complex objects": async () => {
        const o1 = {
            a: 1,
            b: [2, 3, { c: "hello" }],
            d: { e: true }
        };
        storage_sync(o1, { name: "Complex" });
        const stored = localStorage["StorageComplex"];
        expect(stored.startsWith("1 ")).to.be.true;
        const parsed = JSON.parse(stored.substring(2));
        expect(parsed).to.deep.equal(o1);

        // simulate reloading
        const o2 = {};
        storage_sync(o2, { name: "Complex" });
        expect(o2).to.deep.equal(o1);
    },
    "multiple objects": async () => {
        const a = { x: 1 };
        const b = { y: 2 };
        storage_sync(a, { name: "A" });
        storage_sync(b, { name: "B" });
        a.x = 10;
        b.y = 20;
        storage_sync();
        expect(localStorage["StorageA"]).eq(`1 {"x":10}`);
        expect(localStorage["StorageB"]).eq(`1 {"y":20}`);
        a.x = 100;
        b.y = 200;
        storage_sync(a);
        expect(localStorage["StorageA"]).eq(`1 {"x":100}`);
        expect(localStorage["StorageB"]).eq(`1 {"y":20}`);
    },
    "costume encoding": async () => {
        const encoder = (obj, version) => version + "|" + btoa(JSON.stringify(obj));
        const decoder = (text) => {
            const [v, b64] = text.split("|");
            return { version: v, object: JSON.parse(atob(b64)) };
        };

        const stored = { secret: "encoded" };
        storage_sync(stored, { name: "Encoded" }, { encoder, decoder });
        expect(localStorage["StorageEncoded"]).to.match(/^1\|/);

        const loaded = {};
        storage_sync(loaded, { name: "Encoded" });
        expect(loaded.secret).to.equal("encoded");
        storage_sync(null, null, { reset: true })
    },
    "custom stringify/parse": async () => {
        const customStringify = (o) => "wrapped:" + JSON.stringify(o);
        const customParse = (s) => JSON.parse(s.replace("wrapped:", ""));

        const stored = { key: "val" };
        storage_sync(stored, { name: "CustomJSON" }, { stringify: customStringify, parse: customParse });

        expect(localStorage["StorageCustomJSON"]).to.match(/^1 wrapped:/);

        const loaded = {};
        storage_sync(loaded, { name: "CustomJSON" }, { stringify: customStringify, parse: customParse });
        expect(loaded.key).to.eq("val");
    },
    "load with version mismatch and no migration": async () => {
        localStorage["StorageMismatch"] = `1 {"field":"old"}`;
        const o = { field: "new" };
        storage_sync(o, { name: "Mismatch", version: 2 });
        expect(o.field).to.eq("new");
    },
    "load with migration function": async () => {
        localStorage["StorageMigrated"] = `1 {"value":1}`;
        const migrate = (old, from, to) => {
            return { value: old.value + 1, migrated: true };
        };
        const o = {};
        storage_sync(o, {
            name: "Migrated",
            version: 2,
            migrate
        });
        expect(o.value).to.eq(2);
        expect(o.migrated).to.be.true;
    },
    "no tracking": async () => {
        const obj = { untracked: 1 };
        storage_sync(obj, { name: "NoTrack" }, { track: false });
        obj.untracked = 2;
        storage_sync();
        expect(localStorage["StorageNoTrack"]).to.contain("1");
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
console.log("PASS storage_sync")
