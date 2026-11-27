// One Emoji, One Dream Vacation — make.fun entry
// Writes exactly one emoji to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Node 22+, standard library only. No network, no randomness, no secrets.
//
// The entry is 🌅 (U+1F305 SUNRISE): the sun coming up over the sea.
// It is the postcard moment itself — dawn on the water, the first morning
// of the trip you have been dreaming about — rather than a generic beach
// icon. A stranger sees the place before reading a word: warm light,
// open water, somewhere far from home. It is specific (one morning, one
// horizon) instead of any holiday, and a fresher pick than the palm tree
// or desert island every other entry reaches for, while still reading
// instantly at any size on any screen.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The entry: 🌅 U+1F305 SUNRISE.
 *
 * Why this one and not a palm tree or an island: the competition asks for
 * one emoji that *is* the dream vacation, and a sunrise over the sea is a
 * moment rather than a place — the first morning of the trip, warm light
 * on open water, somewhere far from home. It is specific (one horizon,
 * one morning) instead of any holiday, and it still reads instantly at
 * any size on any screen. The code point is stored once, by name, so
 * nothing else in the file can drift to a different emoji by accident.
 */
const ENTRY_EMOJI = "🌅";
const ENTRY = ENTRY_EMOJI;

/** Count code points (not UTF-16 units) so astral-plane emoji count as 1. */
function codePointCount(text: string): number {
  return [...text].length;
}

/** Byte length of the entry as UTF-8 — a single emoji is exactly 4 bytes. */
function utf8ByteLength(text: string): number {
  return Buffer.byteLength(text, "utf8");
}

/**
 * Full entry check: exactly one code point, inside the competition's
 * 1–8 character window, a real pictographic emoji, and not whitespace.
 * Throws on the first failing rule so a bad entry can never be written.
 */
function validateEntry(text: string): void {
  const chars = [...text];
  if (chars.length !== 1) {
    throw new Error(`entry must be exactly one emoji, got ${chars.length} characters`);
  }
  if (codePointCount(text) < 1 || codePointCount(text) > 8) {
    throw new Error(`entry must be 1-8 characters, got ${codePointCount(text)}`);
  }
  if (!/\p{Extended_Pictographic}/u.test(chars[0]!)) {
    throw new Error("entry must be an emoji");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}

function validate(text: string): void {
  if (text.length === 0) {
    throw new Error("entry must not be empty");
  }
  // Gate: /output/entry.txt must be UTF-8 text of 1 to 8 characters,
  // not only white space. Count code points, not UTF-16 units, so a
  // single astral-plane emoji counts as one character.
  const chars = [...text];
  if (chars.length < 1 || chars.length > 8) {
    throw new Error(`entry must be 1-8 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (chars.length !== 1) {
    throw new Error("entry must be exactly one emoji");
  }
  if (!/\p{Extended_Pictographic}/u.test(chars[0]!)) {
    throw new Error("entry must be an emoji");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
validate(ENTRY);
validateEntry(ENTRY);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
// Read the file back and re-check it: the program only exits cleanly
// when what is on disk is exactly the validated entry, byte for byte.
const written = readFileSync(outPath, "utf8");
if (written !== ENTRY) {
  throw new Error("entry.txt on disk does not match the validated entry");
}
validate(written);
validateEntry(written);
console.log(
  `entry.txt written: ${written} (${codePointCount(written)} code point, ${utf8ByteLength(written)} bytes)`,
);
