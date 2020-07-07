import { equal, concat } from "https://deno.land/std/bytes/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { encode, decode, parseHeader } from "./netstring.ts";

Deno.test("encode netstring", () => {
  const bytes = encode(["hello world!"]);
  assert(
    equal(
      bytes,
      // prettier-ignore
      // deno-fmt-ignore
      new Uint8Array([
        0x31, 0x32, 0x3a, 0x68,
        0x65, 0x6c, 0x6c, 0x6f,
        0x20, 0x77, 0x6f, 0x72,
        0x6c, 0x64, 0x21, 0x2c,
      ])
    )
  );
});

Deno.test("decode netstring", () => {
  // prettier-ignore
  // deno-fmt-ignore
  const bytes = new Uint8Array([
    0x31, 0x32, 0x3a, 0x68,
    0x65, 0x6c, 0x6c, 0x6f,
    0x20, 0x77, 0x6f, 0x72,
    0x6c, 0x64, 0x21, 0x2c,
  ])
  const strs = decode(bytes);
  assert(strs.length === 1 && strs[0] === "hello world!");
});

Deno.test("decode netstring with garbage after", () => {
  // prettier-ignore
  // deno-fmt-ignore
  const bytes = new Uint8Array([
    0x31, 0x32, 0x3a, 0x68,
    0x65, 0x6c, 0x6c, 0x6f,
    0x20, 0x77, 0x6f, 0x72,
    0x6c, 0x64, 0x21, 0x2c,
    0x99, 0x99, 0x99
  ])
  const strs = decode(bytes);
  assert(strs.length === 1 && strs[0] === "hello world!");
});

Deno.test("handle multiples", () => {
  const input = ["hi", "there", "here's more"];
  const bytes = encode(input);
  const strs = decode(bytes);
  assert(JSON.stringify(input) === JSON.stringify(strs));
});

Deno.test("parse header", ()=> {
  const header = encode(["hi!"])
  const te = new TextEncoder()
  const payload = concat(header, te.encode("yo"))
  const result = parseHeader(payload)
  const body = new TextDecoder().decode(payload.slice(result.bodyStart))
  assert(body === 'yo')
  assert(result.header === 'hi!')
})