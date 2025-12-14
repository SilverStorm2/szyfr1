import extractEmail from "./extractEmail";
import detectLanguage from "./detectLanguage";

export default function scorePolishCandidate(text, detectedLang) {
  const lang = detectedLang ?? detectLanguage(text);
  const lower = String(text ?? "").toLowerCase();
  const tokens = lower
    .replace(/[^a-ząćęłńóśźż\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);

  const commonWords = new Map([
    ["i", 1.5],
    ["w", 1.3],
    ["na", 1.2],
    ["do", 1.2],
    ["z", 1.2],
    ["ze", 1.2],
    ["nie", 1.5],
    ["sie", 1.3],
    ["to", 1.1],
    ["jest", 1.6],
    ["oraz", 1.3],
    ["dla", 1.3],
    ["prosze", 1.6],
    ["dziekuje", 1.6],
    ["wiadomosc", 2.0],
    ["kod", 2.5],
    ["zadanie", 2.0],
    ["zadania", 2.0],
    ["adres", 1.8],
    ["email", 2.2],
    ["mail", 1.6],
    ["wyslij", 2.0],
    ["wyslac", 2.0],
  ]);

  let score = 0;
  for (const token of tokens) {
    const w = commonWords.get(token);
    if (w) score += w;
  }

  const letters = lower.match(/[a-ząćęłńóśźż]/gi) ?? [];
  const vowels = new Set(["a", "e", "i", "o", "u", "y", "ą", "ę", "ó"]);
  const vowelCount = letters.reduce((acc, c) => acc + (vowels.has(c) ? 1 : 0), 0);
  const vowelRatio = letters.length ? vowelCount / letters.length : 0;

  let maxConsonantRun = 0;
  let consonantRun = 0;
  for (const c of letters) {
    if (vowels.has(c)) {
      consonantRun = 0;
    } else {
      consonantRun += 1;
      if (consonantRun > maxConsonantRun) maxConsonantRun = consonantRun;
    }
  }

  // Polish plaintext tends to have a healthy vowel ratio and avoids very long consonant runs.
  if (vowelRatio >= 0.25 && vowelRatio <= 0.55) {
    const target = 0.38;
    const spread = 0.18;
    const closeness = Math.max(0, 1 - Math.abs(vowelRatio - target) / spread);
    score += closeness * 6.0;
  } else {
    score -= 6.0;
  }
  if (maxConsonantRun > 6) score -= (maxConsonantRun - 6) * 1.5;
  if (maxConsonantRun > 12) score -= 10.0;

  const bigrams = [
    /rz/g,
    /sz/g,
    /cz/g,
    /ch/g,
    /prz/g,
    /dzi/g,
    /dzw/g,
    /nie/g,
    /wie/g,
    /owy/g,
  ];
  for (const re of bigrams) {
    score += (lower.match(re)?.length ?? 0) * 0.4;
  }

  const rareLetters = lower.match(/[qvx]/g)?.length ?? 0;
  score -= rareLetters * 0.15;

  if (lang.language === "pl") score += 3.0 * (0.6 + 0.4 * lang.confidence);
  if (extractEmail(text)) score += 3.5;
  if (lower.includes(" ") && tokens.length >= 6) score += 0.5;

  return score;
}

// funkcja scorePolishCandidate(text) ocenia, 
// jak bardzo dany tekst wygląda na poprawną wiadomość po polsku: 
// zlicza wystąpienia typowych polskich słów i zlepków liter (np. rz, sz, cz), 
// lekko karze rzadkie litery q/v/x, a znalezienie e-maila premiuje; 
// zwraca wynik liczbowy (im wyższy, tym bardziej „polski”).
