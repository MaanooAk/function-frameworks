# template_inflate

Inflate a template by evaluating embedded expressions between `{{` and `}}`.

Features: customizable, skips template tags, caches parsed templates

```js
template_inflate(template, self, options)
```

```js
options = {
    open: "{{",
    close: "}}",
    trim: false,
    handler: (expr, self, index) => eval(expr),
    html: true,
    renderer: (html) => create_element(html),
    cache: true,
    remember: false,
    reset: false,
}
```

## Examples

```html
<div class="item">{{ self.name }}</div>
  ⇓
<div class="item">The name</div>
```

```html
<div>
    <div class="header">{{ self.title }}</div>
    <div data-list="{{ self.list.source }}">
        <template>
            <div class="item">{{ self.name }}</div>
        </template>
    </div>
</div>
  ⇓
<div>
    <div class="header">The Entities Title</div>
    <div data-list="entities">
        <template>
            <div class="item">{{ self.name }}</div>
        </template>
    </div>
</div>
```

###
