import template_inflate from "../template_inflate.js";

import { expect } from "chai";
import { JSDOM } from "jsdom"


const dom = new JSDOM()
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement
global.HTMLTemplateElement = dom.window.HTMLTemplateElement

var tests = {
    "empty template": () => {
        expect(template_inflate()).eq(undefined)
        expect(template_inflate(null)).eq(null)
        expect(template_inflate("")).eq("")
    },
    "inflate a string template with embedded expressions": () => {
        const template = "Hello, {{ self.name }}!";
        const context = { name: "Alice" };
        const result = template_inflate(template, context);
        expect(result).eq("Hello, Alice!");
    },
    "handle HTMLTemplateElement input": () => {
        {
            const template = document.createElement("template");
            template.innerHTML = "<div>{{ self.value }}</div>";
            const result = template_inflate(template, { value: "42" });
            expect(result).eq("<div>42</div>");
        }
        {
            const template = document.createElement("template");
            template.innerHTML = "<div>{{ self.value > 10 }}</div>";
            const result = template_inflate(template, { value: "42" });
            expect(result).eq("<div>true</div>");
        }
        {
            const template = document.createElement("template");
            template.innerHTML = "<div>{{ self.value < 11 }}</div>";
            const result = template_inflate(template, { value: "42" });
            expect(result).eq("<div>false</div>");
        }
        {
            const template = document.createElement("template");
            template.innerHTML = "<div>{{ self.value && false }}</div>";
            const result = template_inflate(template, { value: "42" });
            expect(result).eq("<div>false</div>");
        }
        {
            const template = document.createElement("template");
            template.innerHTML = "<div>{{ self.value < 12 }}<template></template></div>";
            const result = template_inflate(template, { value: "42" });
            expect(result).eq("<div>false<template></template></div>");
        }
    },
    "handle HTMLElement input": () => {
        const div = document.createElement("div");
        div.innerHTML = "Static {{ self.value }}";
        const result = template_inflate(div, { value: "Content" });
        expect(result).eq("<div>Static Content</div>");
    },
    "throw an error on unclosed brackets": () => {
        const brokenTemplate = "Hello {{ self.name";
        expect(() => template_inflate(brokenTemplate, { name: "Bob" })).throw("Missing closing '}}'");
    },
    "work with custom handler function": () => {
        const template = "2 + 2 = {{ sum }}";
        const result = template_inflate(template, {}, {
            handler: (expr) => 4
        });
        expect(result).eq("2 + 2 = 4");
    },
    "work with custom open and close": () => {
        const template = "sum=(1)";
        const result = template_inflate(template, {}, {
            open: "(", close: ")"
        });
        expect(result).eq("sum=1");
    },
    "work with only custom open and close": () => {
        const template = "{sum}=(1)";
        const result = template_inflate(template, {}, {
            open: "(", close: ")"
        });
        expect(result).eq("{sum}=1");
    },
    "work with remember changes": () => {
        expect(template_inflate("{{}}", null, { handler: () => 1, remember: false })).eq("1");
        expect(template_inflate("{{}}", null, {})).eq("");
        expect(template_inflate("{{}}", null, { handler: () => 2, remember: true })).eq("2");
        expect(template_inflate("{{}}", null, {})).eq("2");
        expect(template_inflate("{{}}", null, { handler: () => 3, remember: false })).eq("3");
        expect(template_inflate("{{}}", null, {})).eq("2");
        expect(template_inflate("{{}}", null, { handler: () => 4, reset: true })).eq("4");
        expect(template_inflate("{{}}", null, {})).eq("");
    },
    "work with custom handler function": () => {
        const template = "2 + 2 = {{ sum }}";
        const result = template_inflate(template, {}, {
            handler: (expr) => 4
        });
        expect(result).eq("2 + 2 = 4");
    },
    "trim expressions if trim option is enabled": () => {
        const template = "Result: {{  value   }}";
        const result = template_inflate(template, { value: 100 }, {
            trim: true,
            handler: (expr, self) => self[expr]
        });
        expect(result).eq("Result: 100");
    },
    "return DOM element when html option is false": () => {
        const template = "<span>{{ self.text }}</span>";
        const resultHtml = template_inflate(template, { text: "DOM" }, { html: true });
        expect(resultHtml).eq("<span>DOM</span>");
        const result = template_inflate(template, { text: "DOM" }, { html: false });
        expect(result instanceof HTMLElement).eq(true);
        expect(result.outerHTML).eq("<span>DOM</span>");
    },
    "cache template html": () => {
        const options = { cache: true };
        const template = document.createElement("template");
        template.innerHTML = "<div>about to be changed</div>"
        const r1 = template_inflate(template, null, options);
        template.innerHTML = "<div>changed</div>"
        const r2 = template_inflate(template, null, options);
        expect(r1).eq(r2);
    },
    "not cache template html": () => {
        const options = { cache: false };
        const template = document.createElement("template");
        template.innerHTML = "<div>about to be changed</div>"
        const r1 = template_inflate(template, null, options);
        template.innerHTML = "<div>changed</div>"
        const r2 = template_inflate(template, null, options);
        expect(r1).not.eq(r2)
    },
    "handle missing context properties": () => {
        const template = "Hello, {{ self.name }}!";
        expect(template_inflate(template, {})).eq("Hello, !");
        expect(template_inflate(template, { self: "test" })).eq("Hello, !");
        expect(template_inflate(template, { "self.name": "test" })).eq("Hello, !");
        expect(template_inflate(template, { name: "" })).eq("Hello, !");
        expect(template_inflate(template, { name: null })).eq("Hello, !");
        expect(template_inflate(template, { name: undefined })).eq("Hello, !");
    },
    "handle complex expressions": () => {
        const template = "Hello, {{ self.greeting + ' ' + self.name }}!";
        const context = { greeting: "Hi", name: "Alice" };
        const result = template_inflate(template, context);
        expect(result).eq("Hello, Hi Alice!");
    },
    "throw error for invalid template": () => {
        expect(() => template_inflate(1)).to.throw();
        expect(() => template_inflate(true)).to.throw();
        expect(() => template_inflate(new Date())).to.throw();
        expect(() => template_inflate({})).to.throw();
    },
    "allow null context": () => {
        const template = "Hello, {{ 10 }}!";
        const result = template_inflate(template, null);
        expect(result).eq("Hello, 10!");
    },
    "propagate null errors": () => {
        const template = "Hello, {{ self.name }}!";
        expect(() => template_inflate(template, null)).to.throw();
    },
    "handle multiple expressions": () => {
        const template = "Hello, {{ self.name }}! You are {{ self.age }} years old.";
        const context = { name: "Alice", age: 30 };
        const result = template_inflate(template, context);
        expect(result).eq("Hello, Alice! You are 30 years old.");
    },
    "ignore expressions inside a <template>": () => {
        const template = document.createElement("template");
        template.innerHTML = `
            <div>{{ self.value }}</div>
            <template>
                <div>{{ self.ignored }}</div>
            </template>
        `;
        const context = { value: "Visible", ignored: "Hidden" };
        const result = template_inflate(template, context);
        expect(result).to.include("<div>Visible</div>");
        expect(result).to.not.include("<div>Hidden</div>");
        expect(result).to.include("<template><div>{{ self.ignored }}</div></template>");
    },
    "ignore expressions inside a <template>": () => {
        const template = document.createElement("template");
        template.innerHTML = `
            <div>{{ self.value1 }}</div>
            <template>
                <span>{{ self.ignored }}</span>
            </template>
            <div>{{ self.value2 }}</div>
        `;
        const context = { value1: "Visible1", value2: "Visible2", ignored: "Hidden" };
        const result = template_inflate(template, context);
        expect(result).to.include("Visible1");
        expect(result).to.include("Visible2");
        expect(result).to.not.include("Hidden");
    },
    "ignore expressions inside nested <template> elements": () => {
        const template = document.createElement("template");
        template.innerHTML = `
            <section>
                {{ self.title }}
                <template>
                    <div>
                        {{ self.ignored }}
                        <template>
                            <p>{{ self.deepIgnored }}</p>
                        </template>
                    </div>
                </template>
            </section>
        `;
        const context = {
            title: "Hello World",
            ignored: "Should not appear",
            deepIgnored: "Still ignored"
        };
        const result = template_inflate(template, context);
        expect(result).to.include("Hello World");
        expect(result).to.include("{{ self.ignored }}");
        expect(result).to.include("{{ self.deepIgnored }}");
    },
    "evaluate outside, ignore inside template elements (mixed levels)": () => {
        const template = document.createElement("template");
        template.innerHTML = `
            <div>{{ self.value }}</div>
            <template>
                <div>{{ self.inside }}</div>
                <template>
                    <div>{{ self.reallyInside }}</div>
                </template>
            </template>
            <footer>{{ self.footer }}</footer>
        `;
        const context = {
            value: "Main",
            inside: "Skip this",
            reallyInside: "Definitely skip",
            footer: "Bottom"
        };
        const result = template_inflate(template, context);
        expect(result).to.include("<div>Main</div>");
        expect(result).to.include("<footer>Bottom</footer>");
        expect(result).to.include("{{ self.inside }}");
        expect(result).to.include("{{ self.reallyInside }}");
    },
    "ensure template tags themselves are not rendered (if html=true)": () => {
        const template = `
            <div>{{ self.outer }}</div>
            <template>
                <p>{{ self.inner }}</p>
            </template>
        `;
        const context = {
            outer: "Rendered",
            inner: "Should stay untouched"
        };
        const result = template_inflate(template, context, { html: true });
        expect(result).to.include("<div>Rendered</div>");
        expect(result).to.include("<template>");
        expect(result).to.include("{{ self.inner }}");
    },
    "evaluate expression next to a <template> tag": () => {
        const template = document.createElement("template");
        template.innerHTML = `{{ self.before }}<template id="a"><div>{{ self.inside }}</div></template>{{ self.after }}`;
        const context = { before: "Start", inside: "Hidden", after: "End" };
        const result = template_inflate(template, context);
        expect(result).eq(`Start<template id="a"><div>{{ self.inside }}</div></template>End`);
    },
    "template tags mismatch": () => {
        expect(() => template_inflate(`<template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template><template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template><template></template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template><template></template></template><template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template><template>{{}}</template></template><template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template><template>{{}}</template>{{}}</template><template>{{}}`)).to.throw();
        expect(() => template_inflate(`<template></template></template><template>{{}}`)).to.throw();
    },
}

for (const name in tests) {
    try {
        tests[name]()
    } catch (e) {
        console.log("FAIL:", name);
        throw e
    }
}
console.log("PASS template_inflate")
