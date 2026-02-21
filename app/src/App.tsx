import { useState, useCallback } from "react";
import { speak } from "./speech";

const API = "/.netlify/functions";

type Status = "idle" | "generating" | "reflecting" | "speaking" | "error";

export default function App() {
  const [theme, setTheme] = useState("");
  const [passage, setPassage] = useState("");
  const [reflection, setReflection] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setError("");
    setStatus("generating");
    setPassage("");
    setReflection("");
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme ? { theme } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar");
      setPassage(data.content ?? "");
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar");
      setStatus("error");
    }
  }, [theme]);

  const handleReflect = useCallback(async () => {
    if (!passage.trim()) return;
    setError("");
    setStatus("reflecting");
    setReflection("");
    try {
      const res = await fetch(`${API}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: passage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao refletir");
      setReflection(data.reflection ?? "");
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao refletir");
      setStatus("error");
    }
  }, [passage]);

  const handleSpeak = useCallback(async () => {
    const text = [passage, reflection].filter(Boolean).join("\n\n");
    if (!text.trim()) return;
    setError("");
    setStatus("speaking");
    try {
      await speak(text);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reproduzir voz");
      setStatus("error");
    }
  }, [passage, reflection]);

  const busy = status === "generating" || status === "reflecting" || status === "speaking";

  return (
    <div className="app">
      <header className="header">
        <h1>Super Livro</h1>
        <p>Meditações infinitas a partir dos Padres do Deserto e da tradição mística</p>
      </header>

      <input
        type="text"
        className="theme-input"
        placeholder="Tema opcional (ex.: silêncio no deserto)"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />

      <div className="actions">
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={busy}
        >
          {status === "generating" ? "Gerando…" : "Gerar novo trecho"}
        </button>
        <button
          className="btn-secondary"
          onClick={handleReflect}
          disabled={busy || !passage.trim()}
        >
          {status === "reflecting" ? "Refletindo…" : "Refletir (IA)"}
        </button>
        <button
          className="btn-secondary"
          onClick={handleSpeak}
          disabled={busy || !passage.trim()}
        >
          {status === "speaking" ? "Reproduzindo…" : "Ouvir (voz)"}
        </button>
      </div>

      <p className="status">
        {status === "generating" && "Gerando trecho…"}
        {status === "reflecting" && "Gerando reflexão…"}
        {status === "speaking" && "Reproduzindo com voz (pt-BR)…"}
      </p>
      {error && <p className="error">{error}</p>}

      {!passage && !reflection && status === "idle" && (
        <p className="muted-intro">Clique em <strong>Gerar novo trecho</strong> para começar.</p>
      )}
      {passage && (
        <section className="passage">
          {passage}
        </section>
      )}
      {reflection && (
        <section className="reflection-box">
          <h3>Reflexão</h3>
          {reflection}
        </section>
      )}
    </div>
  );
}
