import { useState } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const THEMES = ["🎲 Random Chaos", "💼 Career", "🍕 Food", "💸 Money", "😬 Social Life", "🏕️ Survival"];

const REACTION_EMOJIS = ["😂", "💀", "🤡", "😈", "🫠", "👀", "🧠", "💅"];

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [question, setQuestion] = useState(null);
  const [choiceMade, setChoiceMade] = useState(null);
  const [reaction, setReaction] = useState("");
  const [loading, setLoading] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [round, setRound] = useState(0);
  const [reactionEmoji, setReactionEmoji] = useState("😈");
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  async function generateQuestion(theme) {
    setLoading(true);
    setQuestion(null);
    setChoiceMade(null);
    setReaction("");
    setCopied(false);

    try {
      const result = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `Generate a "Would You Rather" question for the theme: ${theme}.
Make it extremely funny, absurd, and uncomfortable. Both options should be genuinely horrible or weird in different ways.
Be creative, dark humoured, and unexpected. Think gross, socially devastating, or existentially horrifying.
Keep each option under 20 words.

Respond ONLY in this exact JSON format, nothing else:
{
  "optionA": "option A text here",
  "optionB": "option B text here"
}`,
          },
        ],
        max_tokens: 150,
      });

      const raw = result.choices[0].message.content;
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found");
      const parsed = JSON.parse(match[0]);
      setQuestion(parsed);
      setRound((r) => r + 1);
      setReactionEmoji(REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)]);
    } catch (err) {
      setQuestion({ optionA: "Error loading question", optionB: "Try again!" });
    }

    setLoading(false);
  }

  async function handleChoice(choice) {
    setChoiceMade(choice);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    setReacting(true);

    const chosen = choice === "A" ? question.optionA : question.optionB;

    try {
      const result = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `The user was asked: "Would you rather... ${question.optionA} OR ${question.optionB}"
They chose: "${chosen}"

React to their choice in 2 sentences max. Be funny, roast them hard, and tell them what this says about their personality. Keep it savage but light.`,
          },
        ],
        max_tokens: 120,
      });

      setReaction(result.choices[0].message.content);
    } catch (err) {
      setReaction("Bold choice. We'll leave it at that.");
    }

    setReacting(false);
  }

  function handleNext() {
    generateQuestion(selectedTheme);
  }

  function handleReset() {
    setSelectedTheme(null);
    setQuestion(null);
    setChoiceMade(null);
    setReaction("");
    setRound(0);
    setCopied(false);
  }

  function handleThemeSelect(theme) {
    setSelectedTheme(theme);
    generateQuestion(theme);
  }

  function handleShare() {
    const chosen = choiceMade === "A" ? question.optionA : question.optionB;
    const text = `Would You Rather?\n\nA: ${question.optionA}\nOR\nB: ${question.optionB}\n\nI chose: "${chosen}"\n\nPlay at: https://ai-would-you-rather.vercel.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .theme-btn:hover {
          background: #1e1e1e !important;
          border-color: #7c6ef5 !important;
          transform: translateY(-2px);
          transition: all 0.2s;
        }
        .next-btn:hover {
          background: #6a5de0 !important;
          transform: translateY(-1px);
          transition: all 0.2s;
        }
        .option-btn:hover {
          border-color: #7c6ef5 !important;
          background: #161616 !important;
          transition: all 0.15s;
        }
      `}</style>

      {/* HUD */}
      <div style={s.hud}>
        <div style={s.hudLeft}>
          <span style={s.gameTitle}>😈 WYR</span>
        </div>
        <div style={s.hudRight}>
          {round > 0 && (
            <div style={s.roundBadge}>Round {round}</div>
          )}
          {selectedTheme && (
            <button onClick={handleReset} style={s.resetBtn}>↩ Reset</button>
          )}
        </div>
      </div>

      <div style={s.container}>
        {!selectedTheme ? (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={s.heroSection}>
              <h1 style={s.title}>Would You Rather?</h1>
              <p style={s.subtitle}>AI-generated dilemmas.<br />There are no good options.</p>
            </div>
            <p style={s.chooseLabel}>Choose a theme to begin</p>
            <div style={s.themeGrid}>
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  style={s.themeBtn}
                  className="theme-btn"
                >
                  <span style={s.themeEmoji}>{theme.split(" ")[0]}</span>
                  <span style={s.themeText}>{theme.split(" ").slice(1).join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div style={s.loadingScreen}>
            <div style={s.loadingEmoji}>🔥</div>
            <p style={s.loadingText}>Cooking up something awful...</p>
          </div>
        ) : question && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* VS Layout */}
            <div style={s.vsLayout}>
              {/* Option A */}
              <button
                onClick={() => !choiceMade && handleChoice("A")}
                style={{
                  ...s.optionBtn,
                  ...(choiceMade === "A" ? s.chosenBtn : {}),
                  ...(choiceMade === "B" ? s.rejectedBtn : {}),
                  cursor: choiceMade ? "default" : "pointer",
                  animation: choiceMade === "A" && animating ? "shake 0.4s ease" : "none",
                }}
                className={!choiceMade ? "option-btn" : ""}
              >
                <div style={s.optionLetter}>A</div>
                <div style={s.optionText}>{question.optionA}</div>
                {choiceMade === "A" && <div style={s.chosenBadge}>✓ Your pick</div>}
              </button>

              {/* OR divider */}
              <div style={s.orDivider}>
                <div style={s.orLine} />
                <div style={s.orCircle}>OR</div>
                <div style={s.orLine} />
              </div>

              {/* Option B */}
              <button
                onClick={() => !choiceMade && handleChoice("B")}
                style={{
                  ...s.optionBtn,
                  ...(choiceMade === "B" ? s.chosenBtn : {}),
                  ...(choiceMade === "A" ? s.rejectedBtn : {}),
                  cursor: choiceMade ? "default" : "pointer",
                  animation: choiceMade === "B" && animating ? "shake 0.4s ease" : "none",
                }}
                className={!choiceMade ? "option-btn" : ""}
              >
                <div style={s.optionLetter}>B</div>
                <div style={s.optionText}>{question.optionB}</div>
                {choiceMade === "B" && <div style={s.chosenBadge}>✓ Your pick</div>}
              </button>
            </div>

            {/* Reaction */}
            {reacting && (
              <div style={s.reactionCard}>
                <div style={s.reactionEmoji}>🤔</div>
                <p style={s.reactionLoading}>Judging you...</p>
              </div>
            )}

            {reaction && !reacting && (
              <div style={{ ...s.reactionCard, animation: "fadeIn 0.4s ease" }}>
                <div style={s.reactionEmoji}>{reactionEmoji}</div>
                <p style={s.reactionText}>{reaction}</p>
                <div style={s.actionRow}>
                  <button onClick={handleNext} style={s.nextBtn} className="next-btn">
                    Next Dilemma →
                  </button>
                  <button onClick={handleShare} style={s.shareBtn}>
                    {copied ? "✓ Copied!" : "Share 🔗"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a" },
  hud: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", borderBottom: "1px solid #1a1a1a",
    position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10,
  },
  hudLeft: { display: "flex", alignItems: "center", gap: 12 },
  hudRight: { display: "flex", alignItems: "center", gap: 10 },
  gameTitle: { fontSize: 18, fontWeight: 700, letterSpacing: -0.5 },
  roundBadge: {
    background: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#888",
  },
  resetBtn: {
    background: "transparent", border: "1px solid #2a2a2a",
    borderRadius: 8, color: "#666", padding: "5px 12px",
    cursor: "pointer", fontSize: 13,
  },
  container: { maxWidth: 640, margin: "0 auto", padding: "48px 20px" },
  heroSection: { textAlign: "center", marginBottom: 48 },
  title: { fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: -1 },
  subtitle: { color: "#555", fontSize: 18, lineHeight: 1.6 },
  chooseLabel: { fontSize: 13, color: "#444", marginBottom: 16, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  themeGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  themeBtn: {
    padding: "20px 16px", borderRadius: 14, border: "1px solid #1e1e1e",
    background: "#111", color: "#e0e0e0", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 12,
  },
  themeEmoji: { fontSize: 24 },
  themeText: { fontSize: 16, fontWeight: 500 },
  loadingScreen: { textAlign: "center", padding: "80px 0" },
  loadingEmoji: { fontSize: 48, marginBottom: 16, animation: "pulse 1s infinite" },
  loadingText: { color: "#555", fontSize: 16 },
  vsLayout: { display: "flex", flexDirection: "column", gap: 0, marginBottom: 24 },
  optionBtn: {
    width: "100%", padding: "32px 28px", borderRadius: 16,
    border: "1px solid #1e1e1e", background: "#111",
    color: "#f0f0f0", textAlign: "left", display: "flex",
    flexDirection: "column", gap: 12, position: "relative",
    marginBottom: 0,
  },
  chosenBtn: { border: "2px solid #7c6ef5", background: "#1a1730" },
  rejectedBtn: { opacity: 0.25, filter: "grayscale(1)" },
  optionLetter: {
    width: 40, height: 40, borderRadius: "50%",
    background: "#1e1e1e", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#7c6ef5",
  },
  optionText: { fontSize: 17, lineHeight: 1.5, fontWeight: 400 },
  chosenBadge: {
    fontSize: 12, color: "#7c6ef5", fontWeight: 600,
  },
  orDivider: {
    display: "flex", alignItems: "center",
    justifyContent: "center", padding: "12px 0", gap: 12,
  },
  orLine: { flex: 1, height: 1, background: "#1e1e1e" },
  orCircle: {
    width: 44, height: 44, borderRadius: "50%",
    border: "1px solid #2a2a2a", background: "#0a0a0a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, color: "#444", letterSpacing: 1,
  },
  reactionCard: {
    background: "#111", borderRadius: 16, padding: "28px 24px",
    border: "1px solid #1e1e1e", textAlign: "center",
  },
  reactionEmoji: { fontSize: 40, marginBottom: 12 },
  reactionLoading: { color: "#555", fontSize: 15 },
  reactionText: { fontSize: 15, lineHeight: 1.7, color: "#ccc", marginBottom: 24 },
  actionRow: { display: "flex", gap: 10 },
  nextBtn: {
    flex: 1, background: "#7c6ef5", border: "none", borderRadius: 10,
    color: "#fff", padding: "13px 20px", fontSize: 15,
    fontWeight: 600, cursor: "pointer",
  },
  shareBtn: {
    padding: "13px 20px", background: "transparent",
    border: "1px solid #2a2a2a", borderRadius: 10,
    color: "#888", fontSize: 15, cursor: "pointer", minWidth: 110,
  },
};