import { concat } from "https://deno.land/std/bytes/mod.ts";
import { encode } from "./netstring.ts";
import { parseRequest } from "./scgi.ts";

const CRLF = new Uint8Array([0x0d, 0x0a]);
const DOUBLE_CRLF = concat(CRLF, CRLF);

async function server() {
  const listener = Deno.listen({ port: 7878, hostname: "127.0.0.1" });
  console.log("listening...");
  for await (const conn of listener) {
    console.log("server saw client");
    // const req = await Deno.readAll(conn);
    let req: Uint8Array = new Uint8Array(1024);
    await conn.read(req);
    console.log("> raw req:", new TextDecoder().decode(req));
    const payload = parseRequest(req);
    // console.log("> -- headers:", payload.headers);
    const te = new TextEncoder();
    await conn.write(te.encode("status: 200 ok"));
    await conn.write(CRLF);
    await conn.write(te.encode("content-type: text/plain"));
    await conn.write(DOUBLE_CRLF);
    await conn.write(te.encode("42"));
    conn.close();
  }
}

const serverPromise = server();

async function client() {
  const conn = await Deno.connect({ port: 7878 });
  console.log("connected...");

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

  const td = new TextDecoder();

  await conn.write(payload);

  const buf = new Uint8Array(1024);
  let len;
  let total = 0;
  let maxSize = 1024;

  do {
    len = await conn.read(buf);
    if (len) total += len;
    // console.warn("< -- read", len, "bytes");
    if (len) {
      await Deno.stdout.write(buf.slice(0, len));
    }
  } while (len !== null && total <= maxSize);
  console.log("\n[done]");
  Deno.exit();
  conn.close();
  // const res = await Deno.readAll(server);
  // console.log(new TextDecoder().decode(res));
}

client();
