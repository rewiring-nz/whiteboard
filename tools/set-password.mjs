#!/usr/bin/env node
// Sets (or changes) the Whiteboard password.
//
// It asks for a GitHub fine-grained access key that can read and write the private data repo,
// and for the team password, then writes config.enc.json: the key encrypted with the password
// (PBKDF2-SHA256, 600,000 rounds, AES-256-GCM). Only someone with the password can unlock it.
// Nothing secret is printed or stored in plain text.
//
// Usage:  node tools/set-password.mjs
// Then commit and push config.enc.json. Changing the password or key never touches board data.

import { webcrypto as crypto } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OWNER = "rewiring-nz", REPO = "whiteboard-data", BRANCH = "main";
const ITER = 600000;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "config.enc.json");

function ask(q, hidden) {
  return new Promise(resolve => {
    process.stdout.write(q);
    const stdin = process.stdin;
    let s = "";
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume(); stdin.setEncoding("utf8");
    const on = chunk => {
      for (const c of chunk) {
        if (c === "\r" || c === "\n") {
          if (stdin.isTTY) stdin.setRawMode(false);
          stdin.pause(); stdin.off("data", on); process.stdout.write("\n"); resolve(s.trim()); return;
        }
        if (c === "\u0003") { process.stdout.write("\n"); process.exit(1); }
        if (c === "\u007f" || c === "\b") { if (s) { s = s.slice(0, -1); if (!hidden) process.stdout.write("\b \b"); } continue; }
        s += c; process.stdout.write(hidden ? "•" : c);
      }
    };
    stdin.on("data", on);
  });
}
const b64 = u => Buffer.from(u).toString("base64");

console.log("\nWhiteboard: set the password\n");
const token = process.env.FB_TOKEN || await ask("Paste the GitHub access key (hidden): ", true);
if (!token) { console.error("No access key given."); process.exit(1); }

process.stdout.write("Checking the key can reach the data repo… ");
const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
if (!r.ok && !process.env.FB_SKIP_CHECK) {
  console.log("no.");
  console.error(r.status === 401 ? "GitHub doesn't recognise that key." : `GitHub said ${r.status}. Check the key has access to ${OWNER}/${REPO}.`);
  process.exit(1);
}
const perms = r.ok ? (await r.json()).permissions : null;
if (perms && !perms.push && !process.env.FB_SKIP_CHECK) { console.log("no."); console.error("The key can read the repo but not write to it. Give it Contents: Read and write."); process.exit(1); }
console.log("yes.");

let pass = process.env.FB_PASSWORD;
if (!pass) {
  for (;;) {
    pass = await ask("Choose the team password (hidden, 12+ characters): ", true);
    if (pass.length < 12) { console.log("Too short. Use at least 12 characters; a few words together works well."); continue; }
    const again = await ask("Type it again: ", true);
    if (again !== pass) { console.log("Those didn't match. Try again."); continue; }
    break;
  }
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const plain = new TextEncoder().encode(JSON.stringify({ token, owner: OWNER, repo: REPO, branch: BRANCH }));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));

writeFileSync(out, JSON.stringify({ v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }, null, 2) + "\n");
console.log("\nDone. Wrote config.enc.json. It's safe to commit: without the password it can't be read.\n");
