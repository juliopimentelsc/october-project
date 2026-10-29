import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  Copy,
  Headphones,
  Info,
  Music2,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import { harmony, keys, noteName, pitch, type Mode } from "@/lib/harmony";
export const Route = createFileRoute("/")({ component: Index });
function Index() {
  const [key, setKey] = useState("C");
  const [mode, setMode] = useState<Mode>("major");
  const [seventh, setSeventh] = useState(false);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef(0);
  const { scale, chords } = harmony(key, mode, seventh);
  const current = chords[selected]!;
  const progressions =
    mode === "major"
      ? [
          [0, 4, 5, 3],
          [1, 4, 0],
          [0, 5, 3, 4],
        ]
      : [
          [0, 5, 2, 6],
          [0, 3, 6, 2],
          [0, 6, 5, 6],
        ];
  async function play(indices: number[], id: string) {
    try {
      if (!audio.current) audio.current = new AudioContext();
      await audio.current.resume();
      const ctx = audio.current;
      const run = ++timer.current;
      setPlaying(id);
      indices.forEach((index, n) => {
        let previous = -1;
        chords[index]!.notes.forEach((note, j) => {
          let midi = 48 + pitch(note);
          while (midi <= previous) midi += 12;
          previous = midi;
          const start = ctx.currentTime + n * 1.15 + j * 0.025;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 1.05);
        });
      });
      window.setTimeout(() => {
        if (timer.current === run) setPlaying(null);
      }, indices.length * 1150);
    } catch {
      setMessage("Não foi possível iniciar o áudio neste navegador.");
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${noteName(key)} ${mode === "major" ? "maior" : "menor natural"}: ${chords.map((c) => c.name).join(" · ")}`,
      );
      setMessage("Campo harmônico copiado!");
    } catch {
      setMessage("Não foi possível copiar. Selecione as cifras para copiá-las.");
    }
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <AudioLines size={23} />
          </span>{" "}
          harmonia<span className="brand-dot">.</span>
        </a>
        <span className="header-tag">Seu próximo acorde começa aqui</span>
        <a className="learn-link" href="#como-funciona">
          Como funciona <ChevronRight size={15} />
        </a>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            <span /> TEORIA NA PRÁTICA
          </div>
          <h1>
            Encontre o tom.
            <br />
            Descubra as <em>possibilidades.</em>
          </h1>
          <p>
            Explore o campo harmônico de qualquer tom e encontre
            <br className="desktop-break" /> os acordes que combinam com a sua música.
          </p>
        </section>
        <section className="selector-panel" aria-label="Escolha o tom">
          <div className="selector-heading">
            <span className="step">01</span>
            <div>
              <h2>Qual é o tom da sua música?</h2>
              <p>Escolha a nota e o modo para começar a explorar.</p>
            </div>
            <Music2 className="selector-music" size={25} />
          </div>
          <div className="controls">
            <label className="key-field">
              NOTA FUNDAMENTAL
              <select
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setSelected(0);
                }}
              >
                {keys.map((k) => (
                  <option key={k} value={k}>
                    {k.replaceAll("#", "♯").replaceAll("b", "♭")} — {noteName(k)}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>MODO</legend>
              <div className="segmented">
                <button
                  aria-pressed={mode === "major"}
                  className={mode === "major" ? "active" : ""}
                  onClick={() => {
                    setMode("major");
                    setSelected(0);
                  }}
                >
                  Maior <span>alegre e aberto</span>
                </button>
                <button
                  aria-pressed={mode === "minor"}
                  className={mode === "minor" ? "active" : ""}
                  onClick={() => {
                    setMode("minor");
                    setSelected(0);
                  }}
                >
                  Menor <span>intenso e expressivo</span>
                </button>
              </div>
            </fieldset>
            <div className="key-summary">
              <span className="tiny-label">VOCÊ ESTÁ EXPLORANDO</span>
              <strong>
                {key.replaceAll("#", "♯").replaceAll("b", "♭")}
                <small>{mode === "major" ? "maior" : "menor"}</small>
              </strong>
            </div>
          </div>
        </section>
        <section className="results" aria-live="polite">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">SEU MAPA MUSICAL</div>
              <h2>
                Campo harmônico de {noteName(key)} {mode === "major" ? "maior" : "menor"}
              </h2>
              <p>Sete acordes. Infinitas formas de criar.</p>
            </div>
            <button className="icon-button copy" onClick={copy}>
              <Copy size={15} /> Copiar campo
            </button>
          </div>
          <div className="scale-row">
            <span>Notas da escala</span>
            <div>
              {scale.map((note, i) => (
                <span className={i === 0 ? "scale-note tonic" : "scale-note"} key={note}>
                  {note.replaceAll("#", "♯").replaceAll("b", "♭")}
                </span>
              ))}
            </div>
            <span className="scale-type">
              {mode === "major" ? "Escala maior" : "Menor natural"}
            </span>
          </div>
          <div className="chord-toolbar">
            <span>
              <span className="green-dot" /> Toque em um acorde para explorar
            </span>
            <div className="small-toggle">
              <button
                className={!seventh ? "active" : ""}
                aria-pressed={!seventh}
                onClick={() => setSeventh(false)}
              >
                Tríades
              </button>
              <button
                className={seventh ? "active" : ""}
                aria-pressed={seventh}
                onClick={() => setSeventh(true)}
              >
                Com 7ª
              </button>
            </div>
          </div>
          <div className="chords">
            {chords.map((chord, i) => (
              <button
                key={i}
                className={`chord-card ${selected === i ? "selected" : ""}`}
                aria-pressed={selected === i}
                onClick={() => {
                  setSelected(i);
                  void play([i], `chord-${i}`);
                }}
              >
                <span className="degree">
                  {chord.degree}
                  <span>{i + 1}º grau</span>
                </span>
                <strong>{chord.name}</strong>
                <span className="chord-quality">{chord.quality}</span>
                <span className="chord-bottom">
                  {chord.notes.join(" · ")}
                  <Volume2 size={13} />
                </span>
              </button>
            ))}
          </div>
          <div className="chord-detail">
            <span className="detail-icon">
              <Headphones size={21} />
            </span>
            <div>
              <strong>
                {current.name} <span>por dentro</span>
              </strong>
              <p>
                {current.notes.map(noteName).join(" + ")}{" "}
                <span>
                  · {seventh ? "Tétrade" : "Tríade"} {current.quality.toLowerCase()}
                </span>
              </p>
            </div>
            <button className="listen" onClick={() => void play([selected], "detail")}>
              <Volume2 size={15} />
              {playing === "detail" ? "Tocando…" : "Ouvir acorde"}
            </button>
          </div>
        </section>
        <section className="progressions">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">DA TEORIA À SUA MÚSICA</div>
              <h2>Acordes que caminham juntos</h2>
              <p>Experimente estas progressões no tom que você escolheu.</p>
            </div>
            <Sparkles size={24} className="sparkle" />
          </div>
          <div className="progression-grid">
            {progressions.map((progression, i) => (
              <article className="progression-card" key={i}>
                <div className="progression-top">
                  <span>
                    {["A favorita do pop", "Um clássico que resolve", "Para começar a compor"][i]}
                  </span>
                  <button
                    aria-label={`Ouvir progressão ${i + 1}`}
                    onClick={() => void play(progression, `progression-${i}`)}
                  >
                    <Play
                      size={14}
                      fill={playing === `progression-${i}` ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="progression-chords">
                  {progression.map((n, j) => (
                    <span key={j}>
                      <strong>{chords[n]!.name}</strong>
                      {j < progression.length - 1 && <ArrowRight size={14} />}
                    </span>
                  ))}
                </div>
                <div className="progression-degrees">
                  {progression.map((n) => chords[n]!.degree).join(" — ")}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="explanation" id="como-funciona">
          <div className="info-title">
            <Info size={20} />
            <h3>Um ponto de partida para o seu ouvido.</h3>
          </div>
          <p>
            O campo harmônico reúne os acordes construídos com as notas de uma escala. Eles são uma
            ótima base para compor, acompanhar e tirar músicas de ouvido. Toque nos acordes,
            experimente as progressões e deixe a criatividade guiar.
          </p>
          <details>
            <summary>
              Esses são todos os acordes possíveis? <ArrowDown size={14} />
            </summary>
            <p>
              São os sete acordes diatônicos do modo escolhido. Uma música também pode usar
              empréstimos modais, dominantes secundárias e mudanças de tom. No modo menor, mostramos
              a escala menor natural; o acorde V maior ou V7, muito usado, vem da menor harmônica.
            </p>
          </details>
        </section>
        {message && (
          <div className="toast" role="status">
            <Check size={16} />
            {message}
            <button onClick={() => setMessage("")} aria-label="Fechar mensagem">
              ×
            </button>
          </div>
        )}
      </main>
      <footer>
        <a href="/" className="brand">
          <AudioLines size={19} /> harmonia.
        </a>
        <span>Menos dúvida. Mais música.</span>
        <span>Feito para quem ama tocar.</span>
      </footer>
    </div>
  );
}
