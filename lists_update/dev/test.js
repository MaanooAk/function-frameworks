import lists_update from "../lists_update.js";

import { expect } from "chai";
import { JSDOM } from "jsdom";

const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;

var tests = {
    "basic list rendering": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something" id="list-root">
                <template><div>Item: {{}}</div></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = [1, 2, 3];
        lists_update(el);

        const container = el.querySelector("[data-listing] > div");
        expect(container.innerHTML.trim()).to.eq([
            `<div>Item: 1</div>`,
            `<div>Item: 2</div>`,
            `<div>Item: 3</div>`
        ].join(""));
    },
    "dynamic list updates": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something" id="list-root">
                <template><span>Value: {{}}</span></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = [10, 20];
        lists_update(el);

        const container = el.querySelector("[data-listing] > div");
        expect(container.innerHTML.trim()).to.eq([
            `<span>Value: 10</span>`,
            `<span>Value: 20</span>`
        ].join(""));

        global.something = [100, 200, 300];
        lists_update(el);
        expect(container.innerHTML.trim()).to.eq([
            `<span>Value: 100</span>`,
            `<span>Value: 200</span>`,
            `<span>Value: 300</span>`
        ].join(""));
    },
    "empty list renders nothing": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><div>Number: {{}}</div></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = [];
        lists_update(el);

        const container = el.querySelector("[data-listing] > div");
        expect(container.innerHTML.trim()).to.eq("");
    },
    "template lookup by id": () => {
        const template = document.createElement("template");
        template.id = "template-mylist";
        template.innerHTML = `<p>Hello: {{}}</p>`;
        document.body.appendChild(template);

        const el = document.createElement("div");
        el.innerHTML = `<div data-list="mylist of something"><div></div></div>`;
        document.body.appendChild(el);

        global.something = ["A", "B"];
        lists_update(el);

        const container = el.querySelector("[data-listing] > div");
        expect(container.innerHTML.trim()).to.eq([
            `<p>Hello: A</p>`,
            `<p>Hello: B</p>`
        ].join(""));
    },
    "consume attribute removes data-list": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><div>Item: {{}}</div></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = ["X"];
        lists_update(el, { consume: true, remember: false });

        const child = el.querySelector("div");
        expect(child.getAttribute("data-list")).to.be.null;
    },
    "reflect attribute preserves definition": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><div>Item: {{}}</div></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = [5];
        lists_update(el, { consume: false, remember: false });

        const child = el.querySelector("div");
        expect(child.getAttribute("data-list")).to.be.null;
        expect(child.getAttribute("data-listing")).to.eq("something");
    },
    "updates after removing elements": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><div>Item: {{}}</div></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = [1, 2];
        lists_update(el);

        const listEl = el.querySelector("div");
        listEl.remove();

        lists_update();
    },
    "throws if template missing": () => {
        const el = document.createElement("div");
        el.innerHTML = `<div data-list="missingTemplate of something"></div>`;
        document.body.appendChild(el);

        global.something = [1];

        expect(() => lists_update(el)).to.throw(/Template with id 'template-missingTemplate' not found/);
    },
    "throws on bad root selector": () => {
        expect(() => lists_update("#no-such-id")).to.throw(/Root selects no elements/);
    },
    "throws on multiple root selector": () => {
        const el1 = document.createElement("div");
        const el2 = document.createElement("div");
        el1.className = "multi";
        el2.className = "multi";
        document.body.appendChild(el1);
        document.body.appendChild(el2);

        expect(() => lists_update(".multi")).to.throw(/Root selects multiple elements/);
    },
    "throws if template produces no elements": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);

        global.something = ["bad"];

        expect(() => lists_update(el)).to.throw(/Template must contain an element/);
    },
    "shuffling list": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><p>{{}}</p></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);
        const container = el.querySelector("[data-list] > div");

        global.something = Array.from({ length: 20 }, (i, index) => index);
        for (let i = 0; i < 100; i++) {
            global.something = global.something.map(i => [Math.random(), i]).sort().map(i => i[1]);
            lists_update(el);
            expect(container.innerHTML).eq(global.something.map(i => `<p>${i}</p>`).join(""));
        }
    },
    "mutating list": () => {
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-list="something">
                <template><p>{{}}</p></template>
                <div></div>
            </div>
        `;
        document.body.appendChild(el);
        const container = el.querySelector("[data-list] > div");

        global.something = Array.from({ length: 20 }, (i, index) => index);
        for (let i = 0; i < 400; i++) {
            global.something[(Math.random() * global.something.length) | 0] = 20 + i;
            lists_update(el);
            expect(container.innerHTML).eq(global.something.map(i => `<p>${i}</p>`).join(""));
        }
    },
}

for (const name in tests) {
    try {
        tests[name]()
    } catch (e) {
        console.log("FAIL:", name);
        throw e;
    }
}
console.log("PASS lists_update");
