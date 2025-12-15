/* eslint-disable no-console */
"use strict";

const https = require("https");

const DEFAULT_MODEL = "papluca/xlm-roberta-base-language-detection";
const DEFAULT_HF_BASE_URL = "https://router.huggingface.co/hf-inference";

function getToken() {
  return (
    process.env.HUGGINGFACE_API_TOKEN ||
    process.env.HUGGINGFACE_API_SZYFR ||
    process.env.API_SZYFR ||
    null
  );
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function normalizeLabel(label) {
  const s = String(label ?? "").trim();
  if (!s) return null;
  if (s.startsWith("__label__")) return s.slice("__label__".length).toLowerCase();
  return s.toLowerCase();
}

function flattenCandidates(json) {
  if (Array.isArray(json)) {
    if (json.length > 0 && Array.isArray(json[0])) return json[0];
    return json;
  }
  if (json && typeof json === "object" && Array.isArray(json[0])) return json[0];
  return null;
}

function postJson(url, headers, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => {
          raw += c;
        });
        res.on("end", () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode ?? 0, raw, json });
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = function setupProxy(app) {
  app.post("/api/hf-language-detect", async (req, res) => {
    const token = getToken();
    if (!token) {
      res.status(501).json({
        error:
          "Missing HuggingFace token. Set HUGGINGFACE_API_TOKEN (or API_SZYFR / HUGGINGFACE_API_SZYFR) in .env.local.",
      });
      return;
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const text = String(body?.text ?? "");
    if (!text.trim()) {
      res.status(400).json({ error: "Missing 'text'." });
      return;
    }

    const model = String(body?.model ?? DEFAULT_MODEL);
    if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(model)) {
      res.status(400).json({ error: "Invalid 'model'." });
      return;
    }

    try {
      const baseUrl = process.env.HF_INFERENCE_BASE_URL || DEFAULT_HF_BASE_URL;
      const url = `${String(baseUrl).replace(/\/+$/, "")}/models/${model}`;
      const hf = await postJson(
        url,
        {
          Authorization: `Bearer ${token}`,
        },
        {
          inputs: text,
          options: { wait_for_model: true },
        }
      );

      if (hf.status >= 400) {
        res.status(hf.status).json({
          error: hf.json?.error ?? `HuggingFace error (HTTP ${hf.status}).`,
          details: hf.json ?? hf.raw,
        });
        return;
      }

      const candidates = flattenCandidates(hf.json);
      if (!candidates || candidates.length === 0) {
        res.status(502).json({
          error: "Unexpected HuggingFace response format.",
          details: hf.json ?? hf.raw,
        });
        return;
      }

      const best = candidates.reduce((acc, c) =>
        (c?.score ?? 0) > (acc?.score ?? 0) ? c : acc
      );
      const language = normalizeLabel(best?.label);
      const confidence = Number(best?.score ?? 0);

      res.json({
        model,
        language,
        confidence: Number.isFinite(confidence) ? confidence : 0,
        candidates: candidates.map((c) => ({
          label: normalizeLabel(c?.label),
          score: Number(c?.score ?? 0),
        })),
      });
    } catch (err) {
      res.status(502).json({ error: err.message ?? String(err) });
    }
  });
};
