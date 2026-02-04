import React, { useMemo, useRef, useState } from "react";

const FORMSPREE_URL = "https://formspree.io/f/mdkdpjyg";

const pleadingLines = [
  "Not yet? I promise to keep making you smile.",
  "Okay, okay… just one tiny chance?",
  "I’ll wait here, holding this moment for you.",
  "Your yes would mean the universe to me.",
];

const floatingStars = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  top: `${8 + index * 6}%`,
  left: `${10 + (index * 7) % 80}%`,
  size: 6 + (index % 4) * 3,
  delay: `${index * 0.4}s`,
}));

const App = () => {
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pleaIndex, setPleaIndex] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const pleaMessage = useMemo(() => pleadingLines[pleaIndex], [pleaIndex]);

  const moveNoButton = () => {
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const maxX = width / 2 - 90;
    const maxY = height / 2 - 60;
    const randomX = Math.floor(Math.random() * maxX * 2 - maxX);
    const randomY = Math.floor(Math.random() * maxY * 2 - maxY);
    setNoPosition({ x: randomX, y: randomY });
  };

  const handleNoClick = () => {
    setPleaIndex((prev) => (prev + 1) % pleadingLines.length);
    moveNoButton();
  };

  const handleYes = async () => {
    if (isSending || sent) return;
    setAnswer("yes");
    setIsSending(true);
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          response: "Yes",
          note,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Formspree submission failed.");
      }
      setSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900 opacity-90" />
      <div className="absolute inset-0 pointer-events-none">
        {floatingStars.map((star) => (
          <span
            key={star.id}
            className="absolute sparkle rounded-full bg-white/40"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div
          ref={containerRef}
          className="glass-panel w-full max-w-4xl rounded-[36px] p-10 md:p-14"
        >
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-white/30 bg-white/10 p-3">
                  <svg
                    className="h-full w-full text-white"
                    viewBox="0 0 64 64"
                    fill="none"
                  >
                    <path
                      d="M32 51C32 51 14 39.8 14 27C14 20.6 19.4 15 26 15C29.7 15 33 16.8 35.2 19.8C37.3 16.8 40.6 15 44.4 15C51 15 56.4 20.6 56.4 27C56.4 39.8 38.2 51 38.2 51H32Z"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <circle cx="22" cy="30" r="2" fill="currentColor" />
                    <circle cx="43" cy="30" r="2" fill="currentColor" />
                    <path
                      d="M26 38C28.5 40.5 35.5 40.5 38 38"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    A little moment
                  </p>
                  <h1 className="font-display text-3xl md:text-4xl">
                    Will you be my Valentine?
                  </h1>
                </div>
              </div>

              <p className="text-base text-white/70">
                A clean, minimalist promise: just us, a quiet night, and a
                hundred reasons to smile. Say yes and I’ll make every moment
                feel like this one.
              </p>

              <div className="space-y-4">
                <label className="text-sm uppercase tracking-[0.2em] text-white/60">
                  Leave her a note
                </label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Write something sweet..."
                  className="w-full rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
            </section>

            <section className="relative">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {answer === "yes"
                      ? "She said yes. 🤍"
                      : "Tap a button to answer."}
                  </p>
                  <p className="text-sm text-white/60">
                    {sent
                      ? "Her response just arrived in your inbox."
                      : "The “Not” button is shy, but the “Yes” button is bold."}
                  </p>
                </div>

                <div className="relative flex w-full items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={handleYes}
                    className="yes-ring rounded-full border border-white/40 bg-white/90 px-10 py-4 text-base font-semibold text-ink transition duration-300 hover:scale-110 hover:rounded-[999px] focus:outline-none focus:ring-4 focus:ring-white/40"
                  >
                    {isSending ? "Sending..." : "Yes, always"}
                  </button>

                  <button
                    type="button"
                    onMouseEnter={moveNoButton}
                    onFocus={moveNoButton}
                    onClick={handleNoClick}
                    style={{
                      transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                    }}
                    className="rounded-full border border-white/30 bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition duration-200"
                  >
                    Not
                  </button>
                </div>

                <div className="min-h-[48px] text-sm text-white/70">
                  {pleaMessage}
                </div>
              </div>

              <div className="mt-10 rounded-[28px] border border-white/15 bg-white/5 p-6 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Curated Details
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li>• Black, white, and grey — timeless and elegant.</li>
                  <li>• Glassmorphism polish, soft blur, and luminous edges.</li>
                  <li>• The “Not” button always runs, but it still cares.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
