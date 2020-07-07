import { assert } from "https://deno.land/std/testing/asserts.ts";
import { concat } from "https://deno.land/std/bytes/mod.ts";
import { encode } from "./netstring.ts";
import { parseRequest } from "./scgi.ts";

Deno.test("parse an sgci request", async () => {
  // prettier-ignore
  // deno-fmt-ignore
  const headerBytes = [
    'CONTENT_LENGTH','27',
    'SCGI','1',
    'REQUEST_METHOD','GET',
    'REQUEST_URI','/deepthought'
  ].join('\0')
  const header = encode([headerBytes]);
  const body = new TextEncoder().encode("What is the answer to life?");
  const payload = concat(header, body);

  const result = parseRequest(payload);
  assert((await result.text()) === "What is the answer to life?");
  assert(result.headers.get("request_method") === "GET");
});
