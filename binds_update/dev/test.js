import binds_update from "../binds_update.js";

import { expect } from "chai";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.document = dom.window.document;

var tests = {
    "basics": () => {
        global.counter = 1
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="1+counter++"></div>`
        document.body.appendChild(el)
        expect(el.innerHTML).eq(`<div data-bind="1+counter++"></div>`)
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="1+counter++">2</div>`)
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="1+counter++">3</div>`)
        el.remove()
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="1+counter++">3</div>`)
    },
    "implicit binding": () => {
        global.dynamicValue = "Hello World";
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="html: dynamicValue"></div>`;
        document.body.appendChild(el);
        expect(el.innerHTML).eq(`<div data-bind="html: dynamicValue"></div>`);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="html: dynamicValue">Hello World</div>`);
        global.dynamicValue = "Updated Value";
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="html: dynamicValue">Updated Value</div>`);
    },
    "dynamic class binding": () => {
        global.isActive = true;
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="class-active: isActive"></div>`;
        document.body.appendChild(el);
        debugger;
        expect(el.innerHTML).eq(`<div data-bind="class-active: isActive"></div>`);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="class-active: isActive" class="active"></div>`);
        global.isActive = false;
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="class-active: isActive" class=""></div>`);
    },
    "dynamic attribute binding": () => {
        global.dynamicClass = "highlight";
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="attr-class: dynamicClass"></div>`;
        document.body.appendChild(el);
        expect(el.innerHTML).eq(`<div data-bind="attr-class: dynamicClass"></div>`);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="attr-class: dynamicClass" class="highlight"></div>`);
        global.dynamicClass = "lowlight";
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="attr-class: dynamicClass" class="lowlight"></div>`);
    },
    "dynamic style binding": () => {
        global.dynamicColor = "red";
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="var-color: dynamicColor"></div>`;
        document.body.appendChild(el);
        expect(el.innerHTML).eq(`<div data-bind="var-color: dynamicColor"></div>`);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="var-color: dynamicColor" style="--color: red;"></div>`);
        global.dynamicColor = "blue";
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="var-color: dynamicColor" style="--color: blue;"></div>`);
    },
    "multiple elements": () => {
        global.counter = 1;
        const el1 = document.createElement("div");
        const el2 = document.createElement("div");
        el1.innerHTML = `<div data-bind="1+counter++"></div>`;
        el2.innerHTML = `<div data-bind="1+counter++"></div>`;
        document.body.appendChild(el1);
        document.body.appendChild(el2);
        binds_update(el1);
        binds_update(el2);
        expect(el1.innerHTML).eq(`<div data-bond="1+counter++">2</div>`);
        expect(el2.innerHTML).eq(`<div data-bond="1+counter++">3</div>`);
        global.counter = 100;
        binds_update(el1);
        binds_update(el2);
        expect(el1.innerHTML).eq(`<div data-bond="1+counter++">101</div>`);
        expect(el2.innerHTML).eq(`<div data-bond="1+counter++">102</div>`);
    },
    "multiple expressions": () => {
        const el = document.createElement("div");
        const exprs = `1; class-hello: true; class-bye: false; var-pad: '1px'`
        el.innerHTML = `<div data-bind="${exprs}"></div>`;
        document.body.appendChild(el);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="${exprs}" class="hello" style="--pad: 1px;">1</div>`);
    },
    "multiple expressions lines": () => {
        const el = document.createElement("div");
        const exprs = `\n1; \nclass-hello: true;\n class-bye: false\n; \n\nvar-pad: '1px'`
        el.innerHTML = `<div data-bind="${exprs}"></div>`;
        document.body.appendChild(el);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond="${exprs}" class="hello" style="--pad: 1px;">1</div>`);
    },
    "consume attribute": () => {
        global.counter = 1;
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="1+counter++"></div>`;
        document.body.appendChild(el);
        binds_update(el, { consume: true, remember: false });
        expect(el.innerHTML).eq(`<div>2</div>`);
    },
    "missing binding expression": () => {
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind=""></div>`;
        document.body.appendChild(el);
        binds_update(el);
        expect(el.innerHTML).eq(`<div data-bond=""></div>`);
    },
    "unknown binding type": () => {
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="unknown: 123"></div>`;
        document.body.appendChild(el);
        expect(() => binds_update(el)).to.throw();
        el.remove()
    },
    "unknown dynamic binding type": () => {
        const el = document.createElement("div");
        el.innerHTML = `<div data-bind="unknown-dynamic: 123"></div>`;
        document.body.appendChild(el);
        expect(() => binds_update(el)).to.throw();
        el.remove()
    },
    "cleanup": () => {
        global.counter2 = 0
        const el = document.createElement("div");
        el.innerHTML = `
            <div data-bind="counter2++"></div>
            <div data-bind="counter2++"></div>
            <div data-bind="counter2++"></div>
            <span data-bind="counter2++"></span>
        `;
        document.body.appendChild(el);
        binds_update();
        expect(global.counter2).eq(4);
        binds_update();
        expect(global.counter2).eq(8);
        el.querySelectorAll("div").forEach(i => i.remove())
        binds_update();
        expect(global.counter2).eq(9);
        binds_update();
        expect(global.counter2).eq(10);
        el.remove()
        binds_update();
        expect(global.counter2).eq(10);
    }
}

for (const name in tests) {
    try {
        tests[name]()
    } catch (e) {
        console.log("FAIL:", name);
        throw e
    }
}
console.log("PASS binds_update")
