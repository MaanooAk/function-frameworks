# start_updater

A requestAnimationFrame loop wrapper.

Features: customizable delta resolution and timer provider, optimal max delta

```js
start_updater(updater, options)
```

```js
object: (delta) => {}
options: {
  init: true,
  resolution: 1000,
  now: performance.now,
}
```

## Examples

```js
start_updater(update);
```

```js
start_updater((delta) => console.log(delta), { now: Date.now });
```
