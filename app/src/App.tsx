import { useState, useCallback, useEffect, useRef } from "react";
import { speak, prefetchToken } from "./speech";

const API = "/.netlify/functions";

// Cole aqui o link da música (URL direta do arquivo de áudio, ex.: .mp3)
const MUSIC_URL = "https://music.wixstatic.com/preview/e585d6_936d907499184b5b8cb49b18deca407d-128.mp3";

type Status = "idle" | "generating" | "speaking" | "error";

export default function App() {
  const [theme, setTheme] = useState("");
  const [passage, setPassage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    // No iOS o play() após async é bloqueado; desbloqueia áudio com play() síncrono no clique.
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.play(); // síncrono = mesmo gesto do usuário
    }
    setError("");
    setStatus("speaking");
    const wasMusicOn = musicOn;
    if (wasMusicOn && audioRef.current) {
      audioRef.current.pause();
    }
    try {
      await speak(passage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reproduzir voz");
      setStatus("error");
    } finally {
      setStatus("idle");
      if (wasMusicOn && audioRef.current) {
        audioRef.current.volume = 0.2;
        audioRef.current.play().catch(() => {});
      } else if (audioRef.current) {
        audioRef.current.pause(); // só tinha dado play para desbloquear
      }
    }
  }, [passage, musicOn]);

  // Pré-busca o token quando há fragmento; assim o primeiro "Ouvir" já tem token e o som sai.
  useEffect(() => {
    if (passage.trim()) prefetchToken();
  }, [passage]);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
    } else {
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
    setMusicOn(!musicOn);
  }, [musicOn]);

  const busy = status === "generating" || status === "speaking";

  return (
    <div className="app">
      <audio ref={audioRef} src={MUSIC_URL || undefined} loop />
      <header className="header">
        <div className="header-top">
          <span className="header-label">Escriba do Deserto</span>
          {MUSIC_URL && (
            <button
              type="button"
              className={`btn-music ${musicOn ? "on" : ""}`}
              onClick={toggleMusic}
              title={musicOn ? "Desligar música" : "Ligar música"}
              aria-label={musicOn ? "Desligar música" : "Ligar música"}
            >
              {musicOn ? "🔊 Música" : "🔇 Música"}
            </button>
          )}
        </div>
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
