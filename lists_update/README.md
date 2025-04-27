# lists_update

Populate element children from expressions.

Features: customizable, javascript expression, minimal template inflation 

```js
lists_update(root = document, options);
```

```js
options: {
    attr: "data-list",
    consume: false,
    reflect: "data-listing",
    separator: " of ",
    container: true,
    compiler: (expr) => eval(`(self, context) => ${expr}`),
    implicit: "self",
    prefix: "template-",
    key: (i) => i,
    inflater: template_inflate || default_inflate,
    context: true,
    lock: "list_key",
    remember: true,
    reset: false,
}
```

The default _placeholder_

- expression compiler is `eval`

## Examples

```html
<div data-list="[1, 2, 3]">
    <template>
        <div class="item">Item: {{}}</div>
    </template>
    <div class="list"></div>
</div>
⇓
<div data-listing="[1, 2, 3]">
    <div class="list">
        <div class="item">Item: 1</div>
        <div class="item">Item: 2</div>
        <div class="item">Item: 3</div>
    </div>
</div>
```

```html
<template id="template-item">
    <div class="item">Item: {{}}</div>
</template>
<div data-bind="item of state.items">
    <div class="list"></div>
</div>
⇓
<div data-listing="item of state.items">
    <div class="list">
        <div class="item">Item: A</div>
        <div class="item">Item: B</div>
        <div class="item">Item: C</div>
    </div>
</div>
```
