# storage_sync

Synchronize objects with the localStorage.

Features: customizable, keeps track of object names, versioning support

```js
storage_sync(object, info, options)
```

```js
object: object
info: {
  name: null, // required
  version: 1,
  migrate: (object, from, to) => null,
  track: true,
  init: true,
}
options: {
  prefix: "Storage",
  storage: localStorage,
  encoder: default_encoder,
  decoder: default_decoder,
  stringify: JSON.stringify,
  parse: JSON.parse,
  remember: true,
  reset: false,
}
```

## Examples

```js
var state = { ... }
var profile = { ... }

storage_sync(state, { name: "State", version: 1 })
storage_sync(profile, { name: "Profile", version: 4 })

// ...

// changes to state
storage_sync(state)

// ...

// changes to all
storage_sync()
```
