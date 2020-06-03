import http from "http"

import isFile from "lib/util/isFile"

import isPlainObject from "lib/util/isPlainObject"

const isArray = Array.isArray

const entries = Object.entries

async function readStream(stream) {
  const chunks = []

  for await (const ch of stream) {
    chunks.push(ch)
  }

  return Buffer.concat(chunks)
}

async function mapFiles(obj, cb, ctx) {
  const res = isArray(obj) ? [] : {}

  for (const [key, value] of entries(obj)) {
    if (isPlainObject(value) || isArray(value)) {
      res[key] = await mapFiles(value, cb, ctx)
    } else {
      res[key] = await cb.call(ctx, value, key, obj)
    }
  }

  return res
}

const mockServer = busboy => options => http.createServer((req, res) => {
  const toJSON = body => body.json()

  const onData = data => mapFiles(
    data,

    async value => isFile(value)
      ? String(await readStream(value.stream()))
      : value
  )

  function onFulfilled(data) {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }

  function onRejected(err) {
    res.statusCode = err.status || 500
    res.end(String(err))
  }

  busboy(req, options).then(toJSON).then(onData).then(onFulfilled, onRejected)
})

export default mockServer
