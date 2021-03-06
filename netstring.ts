import { concat, findIndex } from "https://deno.land/std/bytes/mod.ts";

const COLON = new Uint8Array([0x3a]);
const COMMA = 0x2c;

export function encode(strings: string[]): Uint8Array {
  // TODO fail if not ascii?
  const te = new TextEncoder();
  const byteArrays = strings.map((s) => te.encode(`${s.length}:${s},`));
  let all: Uint8Array | undefined = byteArrays.shift();
  while (byteArrays.length > 0) {
    const next = byteArrays.shift();
    if (all && next) all = concat(all, next);
  }
  return all || new Uint8Array(0);
}

export function decode(bytes: Uint8Array, max?:number): string[] {
  const td = new TextDecoder();
  const strings = [];
  let b = bytes.slice(0);
  while (b.length > 0) {
    if (max && strings.length === max) return strings
    const colonIdx = findIndex(b, COLON);
    const len = parseInt(td.decode(b.slice(0, colonIdx)));
    const strStart = colonIdx + 1;
    const str = td.decode(b.slice(strStart, strStart + len));
    if (b[strStart+len] !== COMMA) return strings
    strings.push(str);
    b = b.slice(strStart + len + 1);
  }
  return strings;
}

interface HeaderResult {
  header: string
  bodyStart: number
}

export function parseHeader(bytes: Uint8Array): HeaderResult {
  const header = decode(bytes, 1)[0]
  const bodyStart = `${header.length}:${header},`.length
  return { header, bodyStart }
}
