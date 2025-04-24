import element_classes from "../element_classes.js";

import { expect } from "chai";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.document = dom.window.document;
global.NodeList = dom.window.NodeList;
global.MutationObserver = dom.window.MutationObserver;

var tests = {
    "one": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).one("selected")

        expect(elements[0].getAttribute("class")).eq("view selected");
        expect(elements[1].getAttribute("class")).eq("view");
        expect(elements[2].getAttribute("class")).eq("view");
        elements[2].setAttribute("class", "view selected");
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view");
        expect(elements[1].getAttribute("class")).eq("view");
        expect(elements[2].getAttribute("class")).eq("view selected");
        elements[2].setAttribute("class", "view");
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view");
        expect(elements[1].getAttribute("class")).eq("view selected");
        expect(elements[2].getAttribute("class")).eq("view");
    },
    "each": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).each("red", "green", "blue")

        expect(elements[0].getAttribute("class")).eq("view red");
        expect(elements[1].getAttribute("class")).eq("view red");
        expect(elements[2].getAttribute("class")).eq("view red");
        elements[0].classList.add("green")
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view green");
        expect(elements[1].getAttribute("class")).eq("view red");
        expect(elements[2].getAttribute("class")).eq("view red");
        elements[2].classList.remove("red")
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view green");
        expect(elements[1].getAttribute("class")).eq("view red");
        expect(elements[2].getAttribute("class")).eq("view green");
    },
    "each cycle": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).each("red", "green", "blue")

        expect(elements[0].getAttribute("class")).eq("view red");
        elements[0].classList.remove("red");
        await Promise.resolve();
        // expect(elements[0].getAttribute("class")).eq("view green");
        // elements[2].classList.remove("green");
        // await Promise.resolve();
        // expect(elements[0].getAttribute("class")).eq("view blue");
        // elements[2].classList.remove("blue");
        // await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view red");
    },
    "interconnected one and each": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).one("selected").each("unselected", "selected");

        expect(elements[0].getAttribute("class")).eq("view selected");
        expect(elements[1].getAttribute("class")).eq("view unselected");
        expect(elements[2].getAttribute("class")).eq("view unselected");
        elements[2].setAttribute("class", "view selected");
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view unselected");
        expect(elements[1].getAttribute("class")).eq("view unselected");
        expect(elements[2].getAttribute("class")).eq("view selected");
        elements[2].setAttribute("class", "view");
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view unselected");
        expect(elements[1].getAttribute("class")).eq("view selected");
        expect(elements[2].getAttribute("class")).eq("view unselected");
    },
    "one between": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).between(0, 2, "selected")

        expect(elements[0].getAttribute("class")).eq("view");
        expect(elements[1].getAttribute("class")).eq("view");
        expect(elements[2].getAttribute("class")).eq("view");
        elements[0].classList.add("selected")
        elements[1].classList.add("selected")
        elements[2].classList.add("selected")
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view");
        expect(elements[1].getAttribute("class")).eq("view selected");
        expect(elements[2].getAttribute("class")).eq("view selected");
    },
    "one between order": async () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div class="view"></div>
            <div class="view"></div>
            <div class="view"></div>
        `
        const elements = container.querySelectorAll(".view");
        element_classes(elements).between(0, 2, "selected")

        expect(elements[0].getAttribute("class")).eq("view");
        expect(elements[1].getAttribute("class")).eq("view");
        expect(elements[2].getAttribute("class")).eq("view");
        elements[2].classList.add("selected")
        elements[1].classList.add("selected")
        elements[0].classList.add("selected")
        await Promise.resolve();
        expect(elements[0].getAttribute("class")).eq("view selected");
        expect(elements[1].getAttribute("class")).eq("view selected");
        expect(elements[2].getAttribute("class")).eq("view");
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
console.log("PASS element_classes")
