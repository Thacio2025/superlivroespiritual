import { useState, useCallback } from "react";
import { speak } from "./speech";

const API = "/.netlify/functions";

type Status = "idle" | "generating" | "speaking" | "error";

export default function App() {
  const [theme, setTheme] = useState("");
  const [passage, setPassage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setError("");
    setStatus("generating");
    setPassage("");
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

  const handleSpeak = useCallback(async () => {
    if (!passage.trim()) return;
    setError("");
    setStatus("speaking");
    try {
      await speak(passage);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reproduzir voz");
      setStatus("error");
    }
  }, [passage]);

  const busy = status === "generating" || status === "speaking";

  return (
    <div className="app">
      <header className="header">
        <span className="header-label">Escriba do Deserto</span>
        <h1>Super Livro</h1>
        <p>Fragmentos de sabedoria para a Lectio Divina</p>
      </header>

      <div className="controls">
        <input
          type="text"
          className="theme-input"
          placeholder="Tema opcional (ex.: hesychia, cela, silêncio)"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <div className="actions">
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={busy}
          >
            {status === "generating" ? "Gerando…" : "Gerar fragmento"}
          </button>
          <button
            className="btn-secondary"
            onClick={handleSpeak}
            disabled={busy || !passage.trim()}
          >
            {status === "speaking" ? "…" : "Ouvir"}
          </button>
        </div>
      </div>

      {status === "generating" && (
        <div className="status-line">
          <span className="status-dot" />
          Gerando fragmento…
        </div>
      )}
      {status === "speaking" && (
        <div className="status-line">
          <span className="status-dot" />
          Reproduzindo…
        </div>
      )}
      {error && <p className="error">{error}</p>}

      {!passage && status === "idle" && (
        <p className="muted-intro">
          Escolha um tema, se quiser, e clique em <strong>Gerar fragmento</strong>.
        </p>
      )}
      {passage && (
        <article className="passage">
          {passage}
        </article>
      )}
    </div>
  );
}
