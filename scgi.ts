import { decode, parseHeader } from "./netstring.ts";

export function parseSCGIHeader(str: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const parts = str.split("\0");
  for (let i = 0; i < parts.length; i += 2) {
    const val = parts[i + 1];
    if (val) headers[parts[i]] = val;
  }
  return headers;
}

export function parseRequest(bytes: Uint8Array): Response {
  const { header, bodyStart } = parseHeader(bytes);
  const body = bytes.slice(bodyStart);
  const scgiHeader = parseSCGIHeader(header);
  return new Response(body, { headers: scgiHeader });
}
