# binds_update

Bind expressions with element properties with attributes

Features: customizable, javascript expression, minimal DOM changed with caching 

```js
binds_update(root = document, options);
```

```js
options: {
  attr: "data-bind",
  consume: false,
  reflect: "data-bond",
  implicit: "html",
  separator: ";",
  binder: ":",
  compiler: (expr) => eval(`() => ${expr}`),
  remember: true,
  reset: false,
}
```

Expression types:
```
html
text
value
checked
context
hidden
class-[name]
attr-[name]
var-[name]
```

The default _placeholder_

- expression compiler is `eval`

## Examples

```html
<div data-bind="1 + 1"></div>
⇓
<div data-bond="1 + 1">2</div>
```

```html
<div data-bind="class-dark: ui.theme == 'dark'" class="view"></div>
⇓
<div data-bond="class-dark: ui.theme == 'dark'" class="view dark"></div>
```

```html
<!-- consume: true --> 
<div data-bind="text: 'hello'.toUpperCase()"></div>
⇓
<div>HELLO</div>
```
