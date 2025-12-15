import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import caesarShift from "./components/caesarShift";
import extractEmail from "./components/extractEmail";
import scorePolishCandidate from "./components/scorePolishCandidate";
import detectLanguage from "./components/detectLanguage";
import detectLanguageHuggingFace from "./components/detectLanguageHuggingFace";
import UniversityHeader from "./components/UniversityHeader";

const DEFAULT_CIPHERTEXT = `epomj ezno yudndve. nuopxuiv diozgdbzixev
rkgtrv iv ivnuv xjyudzijnx. vwt
fiiotipjrvx rturvidz, rtngde fjy uvyvidv 
iv: epomj. ezno.yudndve@vyzkxd. do`;

function App() {
  const [cipherText, setCipherText] = useState(DEFAULT_CIPHERTEXT);
  const [selectedShift, setSelectedShift] = useState("auto");
  const [useHuggingFace, setUseHuggingFace] = useState(false);
  const [hfLang, setHfLang] = useState(null);
  const [hfError, setHfError] = useState(null);
  const [hfLoading, setHfLoading] = useState(false);

  const candidates = useMemo(() => {
    return Array.from({ length: 26 }, (_, shift) => {
      const decrypted = caesarShift(cipherText, shift);
      const lang = detectLanguage(decrypted);
      const score = scorePolishCandidate(decrypted, lang);
      return { shift, decrypted, score, lang };
    }).sort((a, b) => b.score - a.score);
  }, [cipherText]);

  const best = candidates[0] ?? { shift: 0, decrypted: cipherText, score: 0 };

  const activeShift =
    selectedShift === "auto" ? best.shift : Number.parseInt(selectedShift, 10);
  const activeText = useMemo(
    () => caesarShift(cipherText, activeShift),
    [cipherText, activeShift]
  );
  const activeEmail = useMemo(() => extractEmail(activeText), [activeText]);
  const activeLang = useMemo(() => detectLanguage(activeText), [activeText]);

  useEffect(() => {
    if (!useHuggingFace) {
      setHfLang(null);
      setHfError(null);
      setHfLoading(false);
      return;
    }

    const controller = new AbortController();
    setHfLoading(true);
    setHfError(null);
    detectLanguageHuggingFace(activeText, { signal: controller.signal })
      .then((result) => {
        setHfLang(result);
        setHfLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setHfLang(null);
        setHfLoading(false);
        setHfError(err?.message ?? String(err));
      });

    return () => controller.abort();
  }, [activeText, useHuggingFace]);

  const byShift = useMemo(() => {
    const map = new Map();
    for (const c of candidates) map.set(c.shift, c);
    return map;
  }, [candidates]);

  const sortedByShift = useMemo(
    () =>
      Array.from({ length: 26 }, (_, shift) => {
        const c = byShift.get(shift);
        return c ?? { shift, decrypted: caesarShift(cipherText, shift), score: 0 };
      }),
    [byShift, cipherText]
  );

  return (
    <div className="app">
      <UniversityHeader />
      <main className="container">
        <p className="lead">
          Widać wiadomość zaszyfrowaną, wszystkie wersje po przesunięciach oraz
          automatycznie wykrytą najbardziej prawdopodobną polską wiadomość.
        </p>

        <div className="grid">
          <section className="card">
            <h2>Wiadomość zaszyfrowana</h2>
            <textarea
              className="textarea"
              value={cipherText}
              onChange={(e) => setCipherText(e.target.value)}
              rows={6}
            />
          </section>

          <section className="card">
            <h2>Odszyfrowana wiadomość (wybrana)</h2>
            <div className="row">
              <label>
                Przesunięcie:
                <select
                  className="select"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="auto">auto (najlepsze: {best.shift})</option>
                  {Array.from({ length: 26 }, (_, shift) => (
                    <option key={shift} value={String(shift)}>
                      {shift}
                    </option>
                  ))}
                </select>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={useHuggingFace}
                  onChange={(e) => setUseHuggingFace(e.target.checked)}
                />
                HuggingFace (API)
              </label>
            </div>

            <pre className="pre">{activeText}</pre>

            <div className="badgeRow">
              <span className="pill">
                e-mail:{" "}
                <span className="mono" style={{ marginLeft: 6 }}>
                  {activeEmail ?? "—"}
                </span>
              </span>
              <span className="pill">
                język:{" "}
                <span className="mono" style={{ marginLeft: 6 }}>
                  {activeLang.language ?? "—"} (
                  {(activeLang.confidence * 100).toFixed(0)}%)
                </span>
              </span>
              {useHuggingFace ? (
                <span className="pill">
                  HF język:{" "}
                  <span className="mono" style={{ marginLeft: 6 }}>
                    {hfLoading
                      ? "…"
                      : hfLang
                        ? `${hfLang.language ?? "—"} (${Math.round(
                            (Number(hfLang.confidence ?? 0) || 0) * 100
                          )}%)`
                        : `błąd: ${hfError ?? "—"}`}
                  </span>
                </span>
              ) : null}
            </div>
          </section>

          <section className="card">
            <h2>Wszystkie przesunięcia (0–25)</h2>
            <details className="details">
              <summary>Rozwiń listę 26 wersji</summary>
              <div className="list">
                {sortedByShift.map((c) => (
                  <div
                    key={c.shift}
                    className={`candidate ${c.shift === best.shift ? "candidate--best" : ""}`}
                  >
                    <div className="candidate__meta">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setSelectedShift(String(c.shift))}
                      >
                        wybierz
                      </button>
                      <strong>Przesunięcie: {c.shift}</strong>
                      <span className="mono">score: {c.score.toFixed(2)}</span>
                      <span className="mono">
                        lang: {c.lang?.language ?? "—"} (
                        {((c.lang?.confidence ?? 0) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <pre className="pre mono">{c.decrypted}</pre>
                  </div>
                ))}
              </div>
            </details>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
