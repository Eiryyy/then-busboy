import util from "util"

import test from "ava"

import getType from "lib/util/getType"

test("Should return a string with type name", t => {
  const res = getType({})

  t.true(util.isString(res))
  t.is(res, "object")
})

test("Should return lowercased string for all basic types", t => {
  const boolean = getType(false)
  const nullType = getType(null)
  const undefType = getType(undefined)
  const string = getType("string")
  const number = getType(451)
  const array = getType([])
  const func = getType(() => {})
  const object = getType({})

  t.is(boolean, "boolean")
  t.is(nullType, "null")
  t.is(undefType, "undefined")
  t.is(string, "string")
  t.is(number, "number")
  t.is(array, "array")
  t.is(func, "function")
  t.is(object, "object")
})

test("Should return as-is name for non-basic types", t => {
  const genFn = getType(function* noop() { yield 0 })
  const set = getType(new Set())
  const map = getType(new Map())

  t.is(genFn, "GeneratorFunction")
  t.is(set, "Set")
  t.is(map, "Map")
})