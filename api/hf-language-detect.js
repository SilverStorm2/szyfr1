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

function json(res, status, payload) {
  res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    json(res, 405, { error: "Method Not Allowed" });
    return;
  }

  const token = getToken();
  if (!token) {
    json(res, 501, {
      error:
        "Missing HuggingFace token. Set HUGGINGFACE_API_TOKEN (or API_SZYFR / HUGGINGFACE_API_SZYFR) in environment variables.",
    });
    return;
  }

  const text = String(req.body?.text ?? "");
  if (!text.trim()) {
    json(res, 400, { error: "Missing 'text'." });
    return;
  }

  const model = String(req.body?.model ?? DEFAULT_MODEL);
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(model)) {
    json(res, 400, { error: "Invalid 'model'." });
    return;
  }

  const baseUrl = process.env.HF_INFERENCE_BASE_URL || DEFAULT_HF_BASE_URL;
  const url = `${String(baseUrl).replace(/\/+$/, "")}/models/${model}`;

  try {
    const hf = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    });

    const raw = await hf.text();
    const parsed = raw ? JSON.parse(raw) : null;

    if (!hf.ok) {
      json(res, hf.status, {
        error: parsed?.error ?? `HuggingFace error (HTTP ${hf.status}).`,
        details: parsed ?? raw,
      });
      return;
    }

    const candidates = flattenCandidates(parsed);
    if (!candidates || candidates.length === 0) {
      json(res, 502, {
        error: "Unexpected HuggingFace response format.",
        details: parsed ?? raw,
      });
      return;
    }

    const best = candidates.reduce((acc, c) =>
      (c?.score ?? 0) > (acc?.score ?? 0) ? c : acc
    );
    const language = normalizeLabel(best?.label);
    const confidence = Number(best?.score ?? 0);

    json(res, 200, {
      model,
      language,
      confidence: Number.isFinite(confidence) ? confidence : 0,
      candidates: candidates.map((c) => ({
        label: normalizeLabel(c?.label),
        score: Number(c?.score ?? 0),
      })),
    });
  } catch (err) {
    json(res, 502, { error: err?.message ?? String(err) });
  }
};

