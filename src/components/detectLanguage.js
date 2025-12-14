function softmax(scoresByLang) {
  const entries = Object.entries(scoresByLang);
  if (entries.length === 0) return { probs: {}, best: null };

  const max = Math.max(...entries.map(([, s]) => s));
  const exps = entries.map(([lang, s]) => [lang, Math.exp(s - max)]);
  const sum = exps.reduce((acc, [, v]) => acc + v, 0);
  const probs = Object.fromEntries(exps.map(([lang, v]) => [lang, v / sum]));

  let best = exps[0][0];
  for (const [lang] of exps) {
    if (probs[lang] > probs[best]) best = lang;
  }
  return { probs, best };
}

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-ząćęłńóśźż\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function countMatches(tokens, set) {
  let count = 0;
  for (const t of tokens) if (set.has(t)) count += 1;
  return count;
}

/**
 * Lightweight, offline language detection for UI hints.
 * (The fastText-based detector is implemented as a Node script.)
 */
export default function detectLanguage(text) {
  const tokens = tokenize(text);
  const lower = String(text ?? "").toLowerCase();

  const pl = new Set([
    "i",
    "w",
    "na",
    "do",
    "z",
    "ze",
    "nie",
    "się",
    "sie",
    "to",
    "jest",
    "oraz",
    "dla",
    "proszę",
    "prosze",
    "dziękuję",
    "dziekuje",
    "wiadomość",
    "wiadomosc",
    "kod",
    "zadanie",
    "zadania",
    "adres",
    "wyślij",
    "wyslij",
    "wysłać",
    "wyslac",
  ]);

  const en = new Set([
    "the",
    "and",
    "to",
    "of",
    "in",
    "for",
    "is",
    "are",
    "this",
    "that",
    "please",
    "message",
    "code",
    "task",
    "email",
    "send",
  ]);

  const de = new Set([
    "und",
    "der",
    "die",
    "das",
    "ist",
    "nicht",
    "bitte",
    "nachricht",
    "code",
    "aufgabe",
    "email",
    "senden",
  ]);

  const fr = new Set([
    "le",
    "la",
    "les",
    "et",
    "de",
    "des",
    "est",
    "pas",
    "merci",
    "message",
    "code",
    "tache",
    "email",
    "envoyer",
  ]);

  const es = new Set([
    "el",
    "la",
    "los",
    "y",
    "de",
    "es",
    "no",
    "por",
    "gracias",
    "mensaje",
    "codigo",
    "tarea",
    "correo",
    "enviar",
  ]);

  const diacriticsPL = (lower.match(/[ąćęłńóśźż]/g)?.length ?? 0) * 0.8;
  const plBigrams =
    (lower.match(/rz/g)?.length ?? 0) +
    (lower.match(/sz/g)?.length ?? 0) +
    (lower.match(/cz/g)?.length ?? 0) +
    (lower.match(/prz/g)?.length ?? 0);

  const scores = {
    pl: countMatches(tokens, pl) * 1.2 + diacriticsPL + plBigrams * 0.25,
    en: countMatches(tokens, en) * 1.0,
    de: countMatches(tokens, de) * 1.0,
    fr: countMatches(tokens, fr) * 1.0,
    es: countMatches(tokens, es) * 1.0,
  };

  const { probs, best } = softmax(scores);
  return {
    language: best,
    confidence: best ? probs[best] : 0,
    probs,
    scores,
  };
}

