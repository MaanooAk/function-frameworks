# element_classes

Define constraints that should be applied to the classes of a collection of elements.

Features: customizable, combine multiple constrains, execution in micro task

```js
element_classes(elements) = {
    one(name)
    exactlyOne(name)
    atLeastOne(name)
    atMostOne(name)
    between(min, max, name)
    each(...names)
    eachExactlyOne(...names)
    eachAtLeastOne(...names)
    eachAtMostOne(...names)
    eachBetween(min, max, ...names)
}
```

## Examples

```js
element_classes(".view")
    .exactlyOne("selected")
    .eachExactlyOne("unselected", "selected")
```

```html
<div id="v1" class="view">...</div>
<div id="v2" class="view">...</div>
<div id="v3" class="view">...</div>
  ⇓
<div id="v1" class="view selected">...</div>
<div id="v2" class="view unselected">...</div> 
<div id="v3" class="view unselected">...</div>
  ⇓
<!-- #v3.classList.add("selected") -->
  ⇓
<div id="v1" class="view unselected">...</div>
<div id="v2" class="view unselected">...</div> 
<div id="v3" class="view selected">...</div>
```