import {promises as fs} from "fs"

import test from "ava"

import {FormData, File, fileFromPath} from "formdata-node"
import {HttpError} from "http-errors"

import createRequest from "./__helper__/createRequest"
import createServer from "./__helper__/createServer"

import {parse} from "./parse"

test("Parses empty form into empty object", async t => {
  const form = new FormData()

  const {body} = await createRequest(createServer(parse), form)

  t.deepEqual(body, {})
})

test("Parses regular form-data fields", async t => {
  const expected = {
    first: "First field",
    second: "Second field"
  }

  const form = new FormData()

  Object.entries(expected).forEach(([name, value]) => form.set(name, value))

  const {body} = await createRequest(createServer(parse), form)

  t.deepEqual(body, expected)
})

test("Casts values to their initial types by default", async t => {
  const expected = {
    number: 42,
    true: true,
    false: false,
    null: null
  }

  const form = new FormData()

  Object.entries(expected)
    .forEach(([name, value]) => form.set(name, String(value)))

  const {body} = await createRequest(createServer(parse), form)

  t.deepEqual(body, expected)
})

test("Ignores types casting when options.castTypes set to false", async t => {
  const expected = {
    number: "42",
    true: "true",
    false: "false",
    null: "null"
  }

  const form = new FormData()

  Object.entries(expected).forEach(([name, value]) => form.set(name, value))

  const {body} = await createRequest(
    createServer(parse, {castTypes: false}),

    form
  )

  t.deepEqual(body, expected)
})

test("Parses form with a File", async t => {
  const expected = "My hovercraft is full of eels"

  const form = new FormData()

  form.set("file", new File([expected], "file.txt"))

  const {body} = await createRequest(createServer(parse), form)

  t.deepEqual(body, {file: expected})
})

test("Parses form with both files and fields", async t => {
  const expected = {
    field: "Field content",
    file: await fs.readFile("license", "utf-8")
  }

  const form = new FormData()

  form.set("field", expected.field)
  form.set("file", await fileFromPath("license"))

  const {body} = await createRequest(createServer(parse), form)

  t.deepEqual(body, expected)
})

test("Throws error when file size limit exceeded", async t => {
  const form = new FormData()

  form.set("file", await fileFromPath("license"))

  const {error} = await createRequest(
    createServer(parse, {
      limits: {
        fileSize: 3 // set limit to 1 byte
      }
    }),

    form
  )

  t.is(
    (error as unknown as HttpError).status, 413,

    "The error status must be 413"
  )
  t.is(
    (error as any).text,

    "File size limit exceeded: Available up to 3 bytes per file."
  )
})

test("Throws an error when field size limit exceeded", async t => {
  const form = new FormData()

  form.set("field", "Some a very very long string as field's value")

  const {error} = await createRequest(
    createServer(parse, {
      limits: {
        fieldSize: 4
      }
    }),

    form
  )

  t.is(
    (error as any).text,

    "Field size limit exceeded: Available up to 4 bytes per field."
  )
})

test("Throws an error when parts limit exceeded", async t => {
  const form = new FormData()

  form.set("field", "First")
  form.set("file", await fileFromPath("license"))

  const {error} = await createRequest(
    createServer(parse, {
      limits: {
        parts: 1
      }
    }),

    form
  )

  t.is((error as any).text, "Parts limit exceeded: Available up to 1 parts.")
})

test("Throws an error when given amount of fields exceeded limit", async t => {
  const form = new FormData()

  form.set("first", "First")
  form.set("second", "Second")

  const {error} = await createRequest(
    createServer(parse, {
      limits: {
        fields: 1
      }
    }),

    form
  )

  t.is((error as any).text, "Fields limit exceeded: Available up to 1 fields.")
})

test("Throws an error wnen given amount of files exceeded limit", async t => {
  const form = new FormData()

  form.set("license", await fileFromPath("license"))
  form.set("readme", await fileFromPath("readme.md"))

  const {error} = await createRequest(
    createServer(parse, {
      limits: {
        files: 1
      }
    }),

    form
  )

  t.is((error as any).text, "Files limit exceeded: Available up to 1 files.")
})
