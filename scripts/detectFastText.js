/* eslint-disable no-console */
"use strict";

const fs = require("fs");
const path = require("path");
const FastText = require("fasttext.js");

const DEFAULT_CIPHERTEXT = `epomj ezno yudndve. nuopxuiv diozgdbzixev 
rkgtrv iv ivnuv xjyudzijnx. vwt 
fiiotipjrvx rturvidz, rtngde fjy uvyvidv 
iv: epomj. ezno.yudndve@vyzkxd. do`;

function shiftChar(char, shift) {
  const code = char.charCodeAt(0);
  const a = "a".charCodeAt(0);
  const z = "z".charCodeAt(0);
  const A = "A".charCodeAt(0);
  const Z = "Z".charCodeAt(0);

  if (code >= a && code <= z) {
    return String.fromCharCode((((code - a + shift) % 26) + 26) % 26 + a);
  }
  if (code >= A && code <= Z) {
    return String.fromCharCode((((code - A + shift) % 26) + 26) % 26 + A);
  }
  return char;
}

function caesarShift(text, shift) {
  return [...text].map((c) => shiftChar(c, shift)).join("");
}

function extractEmail(text) {
  const normalized = String(text ?? "")
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\s+/g, " ");

  const match = normalized.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return match ? match[0] : null;
}

function resolveModelPath() {
  const fromEnv = process.env.FASTTEXT_MODEL_PATH;
  if (fromEnv) return fromEnv;

  const cwd = process.cwd();
  const preferred = path.join(cwd, "models", "lid.176.bin");
  const fallback = path.join(cwd, "models", "lid.176.ftz");
  if (fs.existsSync(preferred)) return preferred;
  if (fs.existsSync(fallback)) return fallback;

  const vendored = path.join(
    cwd,
    "node_modules",
    "fasttext.js",
    "examples",
    "models",
    "lid.176.ftz"
  );
  if (fs.existsSync(vendored)) return vendored;

  return preferred;
}

function parseArgs(argv) {
  const args = { text: null, file: null, verbose: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--text") args.text = argv[++i] ?? "";
    else if (a === "--file") args.file = argv[++i] ?? "";
    else if (a === "--verbose") args.verbose = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  const modelPath = resolveModelPath();
  if (!fs.existsSync(modelPath)) {
    console.error(
      [
        `Brak modelu fastText: ${modelPath}`,
        `Pobierz model Meta fastText LID i zapisz jako: models/lid.176.bin`,
        `Albo ustaw zmienną: FASTTEXT_MODEL_PATH=...`,
      ].join("\n")
    );
    process.exitCode = 1;
    return;
  }

  const inputText = args.file
    ? fs.readFileSync(args.file, "utf8")
    : args.text ?? DEFAULT_CIPHERTEXT;

  const ft = new FastText({
    loadModel: modelPath,
    predict: {
      mostlikely: 6,
      verbosity: 0,
      normalize: true,
      wasm: true,
    },
  });

  await ft.load();

  const results = [];
  for (let shift = 0; shift < 26; shift += 1) {
    const decrypted = caesarShift(inputText, shift);
    const probs = await ft.predict(decrypted);
    const pl = probs.find((p) => p.label === "PL");
    const plScore = pl ? Number(pl.score) : 0;
    results.push({
      shift,
      plScore,
      email: extractEmail(decrypted),
      decrypted,
      top: probs.slice(0, 3),
    });
  }

  results.sort((a, b) => {
    const aHasEmail = a.email ? 1 : 0;
    const bHasEmail = b.email ? 1 : 0;
    if (aHasEmail !== bHasEmail) return bHasEmail - aHasEmail;
    if (a.plScore !== b.plScore) return b.plScore - a.plScore;
    return 0;
  });

  const best = results[0];
  if (!best) {
    console.error("Brak wyników.");
    process.exitCode = 1;
    return;
  }

  console.log(`MODEL: ${modelPath}`);
  console.log(
    `BEST: shift=${best.shift}, PL=${best.plScore.toFixed(4)}, email=${best.email ?? "—"}`
  );
  console.log(best.decrypted);

  if (args.verbose) {
    console.log("\n--- All shifts (top 5) ---");
    for (const r of results.slice(0, 5)) {
      console.log(
        `shift=${r.shift} PL=${r.plScore.toFixed(4)} email=${r.email ?? "—"} top=${JSON.stringify(
          r.top
        )}`
      );
    }
  }

  await ft.unload();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

