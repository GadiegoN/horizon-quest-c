import test from "node:test";
import assert from "node:assert/strict";
import { parseHqToCents, formatHqCents } from "./money";

test("parse pt-BR", () => {
  assert.equal(parseHqToCents("10,50"), 1050);
  assert.equal(parseHqToCents("HQ$ 1.234,56"), 123456);
});

test("format pt-BR", () => {
  assert.equal(formatHqCents(1050), "HQ$ 10,50");
  assert.equal(formatHqCents(-1050), "-HQ$ 10,50");
});
