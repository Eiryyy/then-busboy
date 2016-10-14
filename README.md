# then-busboy

Promise-based wrapper around Busboy, inspired by async-busboy

## Installation

Use can install `then-pusboy` from npm:

```bash
npm install then-busboy --save
```

Or with yarn

```bash
yarn add then-busboy
yarn
```

## Usage

### busboy(request[, options]) -> Promise

* http.IncomingMessage **request** - HTTP request object
* object **options**
  - boolean **split** - when this options passed with `true`, the `data`
      object will contain two keys: `fields` and `files`.
  - more information about busboy options [here](https://github.com/mscdex/busboy#busboy-methods).

Just import `then-busboy` and pass `request` object as first argument.

For example:

```js
var busboy = require("then-busboy");
var createServer = require("http").createServer;

function callback(req, res) {
  if (req.method === "GET") {
    res.statusCode = 404
    return res.end("Not Found");
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  // Get result from then-busboy
  function onFulfilled(data) {
    res.writeHead("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  }

  // Handle errors
  function onRejected(err) {
    res.statusCode = err.status || 500;
    res.end(String(err));
  }

  // Call `then-busboy` with `req`
  busboy(req).then(onFulfilled, onRejected);
}

createServer(callback)
  .listen(2319, () => console.log("Server started on http://localhost:2319"))
```

`then-busboy` always return a Promise, so you can use it with
[asynchronous function](https://github.com/tc39/ecmascript-asyncawait) syntax:

```js
// Some your awesome code with async workflow...
var data = await busboy(req);
```

And the same code, but with `split: true` option:

```js
var {fields, files} = await busboy(req, {split: true});
```

## License

[MIT](https://github.com/octet-stream/then-busboy/blob/master/LICENSE)
