import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Lottie from "lottie-react";
import romanticAnimation from "../public/TekValen.json";

const FORMSPREE_URL = "https://formspree.io/f/mdkdwpjyg";

const pleadingLines = [
  "Shefafite, I’ll wait with the softest patience.",
  "Tekta, your yes would light up my quiet nights.",
  "May I try again? I want to be your calm and joy.",
  "Still no? I’ll keep showing up with kindness.",
];

const floatingStars = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  top: `${8 + index * 6}%`,
  left: `${10 + ((index * 7) % 80)}%`,
  size: 6 + (index % 4) * 3,
  delay: `${index * 0.4}s`,
}));

const floatingHearts = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  top: `${12 + index * 9}%`,
  left: `${15 + ((index * 9) % 70)}%`,
  delay: `${index * 0.6}s`,
}));

const App = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [isJet, setIsJet] = useState(false);
  const [answer, setAnswer] = useState("");
  const [yesScale, setYesScale] = useState(1);
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pleaIndex, setPleaIndex] = useState(0);
  const [noLabelIndex, setNoLabelIndex] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [catOffset, setCatOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const noButtonRef = useRef(null);
  const yesButtonRef = useRef(null);
  const threeCanvasRef = useRef(null);

  const pleaMessage = useMemo(() => pleadingLines[pleaIndex], [pleaIndex]);
  const noButtonLabels = useMemo(
    () => [
      "Please, Tekta?",
      "Don’t say no…",
      "Softly, yes?",
      "Give me a chance",
      "Shefafite asks 🥺",
    ],
    [],
  );

  const moveNoButton = () => {
    const container = containerRef.current;
    const button = noButtonRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const buttonWidth = button?.offsetWidth ?? 120;
    const buttonHeight = button?.offsetHeight ?? 48;
    const padding = 24;
    const minX = -width / 2 + buttonWidth / 2 + padding;
    const maxX = width / 2 - buttonWidth / 2 - padding;
    const minY = -height / 2 + buttonHeight / 2 + padding;
    const maxY = height / 2 - buttonHeight / 2 - padding;

    const catAvoid = {
      x: 0,
      y: height / 2 - 90,
      radius: 130,
    };

    let attempts = 0;
    let randomX = 0;
    let randomY = 0;
    do {
      randomX = Math.floor(Math.random() * (maxX - minX) + minX);
      randomY = Math.floor(Math.random() * (maxY - minY) + minY);
      attempts += 1;
    } while (
      attempts < 8 &&
      Math.hypot(randomX - catAvoid.x, randomY - catAvoid.y) < catAvoid.radius
    );
    setNoPosition({ x: randomX, y: randomY });
  };

  const trackCursor = (event) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setCursorPos({
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const catBase = { x: 0, y: rect.height / 2 - 90 };
    const threats = [
      { x: cursorPos.x, y: cursorPos.y },
      { x: noPosition.x, y: noPosition.y },
    ];
    const closestThreat = threats.reduce(
      (closest, threat) => {
        const dx = threat.x - catBase.x;
        const dy = threat.y - catBase.y;
        const distance = Math.hypot(dx, dy);
        if (distance < closest.distance) {
          return { distance, dx, dy };
        }
        return closest;
      },
      { distance: Number.POSITIVE_INFINITY, dx: 0, dy: 0 },
    );
    const avoidRadius = 140;
    const intensity =
      closestThreat.distance < avoidRadius
        ? (avoidRadius - closestThreat.distance) / avoidRadius
        : 0;
    const evadeX = Math.max(-130, Math.min(130, -closestThreat.dx * intensity));
    setCatOffset({
      x: intensity > 0.2 ? evadeX : 0,
      y: intensity > 0.2 ? intensity * 6 : 0,
    });
  }, [cursorPos, noPosition]);

  const handleNoClick = () => {
    setPleaIndex((prev) => (prev + 1) % pleadingLines.length);
    setNoLabelIndex((prev) => (prev + 1) % noButtonLabels.length);
    setYesScale((prev) => Math.min(prev + 0.06, 1.28));
    moveNoButton();
  };

  const handleYes = async () => {
    if (isSending || sent) return;
    setAnswer("yes");
    setYesScale(1.32);
    setIsSending(true);
    setConfettiActive(true);
    setTimeout(() => setIsJet(true), 1300);
    const container = containerRef.current;
    const yesButton = yesButtonRef.current;
    if (container && yesButton) {
      const buttonRect = yesButton.getBoundingClientRect();
      setConfettiOrigin({
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      });
    }
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
      setTimeout(() => setConfettiActive(false), 2800);
    }
  };

  useEffect(() => {
    const canvas = threeCanvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 14;

    const particles = new THREE.BufferGeometry();
    const count = 120;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speeds[i] = 0.002 + Math.random() * 0.004;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xf5c2d6,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const points = new THREE.Points(particles, material);
    scene.add(points);

    let animationFrame = 0;
    const animate = () => {
      const positionsAttr = particles.getAttribute("position");
      for (let i = 0; i < count; i += 1) {
        const y = positionsAttr.getY(i) + speeds[i];
        positionsAttr.setY(i, y > 6 ? -6 : y);
      }
      positionsAttr.needsUpdate = true;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      particles.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-ink text-white relative overflow-hidden"
      onMouseMove={trackCursor}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900 opacity-90" />
      <canvas ref={threeCanvasRef} className="three-canvas absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,214,226,0.12),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(187,166,206,0.12),_transparent_60%)]" />
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
        {floatingHearts.map((heart) => (
          <span
            key={`heart-${heart.id}`}
            className="absolute floating-emoji text-xl"
            style={{
              top: heart.top,
              left: heart.left,
              animationDelay: heart.delay,
            }}
          >
            🤍
          </span>
        ))}
      </div>
      {confettiActive && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {Array.from({ length: 64 }, (_, index) => {
            const colors = [
              "#f9c5d1",
              "#fbd1e5",
              "#f6e2f2",
              "#d4c1f0",
              "#f7d9c4",
              "#f5f5f5",
              "#f2a2b9",
              "#f7b2d9",
            ];
            const spreadX = (Math.random() - 0.5) * 780;
            const spreadY = 220 + Math.random() * 520;
            const rotation = Math.random() * 320;
            const scale = 0.8 + Math.random() * 0.6;
            return (
              <span
                key={`confetti-${index}`}
                className="confetti-piece absolute"
                style={{
                  left: `${confettiOrigin.x}px`,
                  top: `${confettiOrigin.y}px`,
                  backgroundColor: colors[index % colors.length],
                  "--x": `${spreadX}px`,
                  "--y": `${spreadY}px`,
                  "--rot": `${rotation}deg`,
                  "--delay": `${index * 0.01}s`,
                  "--scale": scale,
                }}
              />
            );
          })}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="card-floor h-10 w-[75%] max-w-3xl rounded-[50%]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div
          ref={containerRef}
          className={`glass-panel paper-panel w-full max-w-4xl rounded-[36px] p-10 md:p-14 ${
            isJet ? "paper-jet" : "paper-open"
          }`}
        >
          {!isOpened ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <button
                type="button"
                onClick={() => setIsOpened(true)}
                className="envelope group relative flex h-52 w-80 items-center justify-center rounded-[28px] border border-white/30 bg-white/10 text-white shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition duration-500 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                <div className="absolute inset-0 rounded-[28px] border border-white/20" />
                <div className="absolute top-0 h-1/2 w-full rounded-t-[28px] bg-white/10" />
                <div className="absolute bottom-0 h-1/2 w-full rounded-b-[28px] bg-white/5" />
                <div className="envelope-flap absolute top-0 h-20 w-full rounded-t-[28px]" />
                <div className="relative z-10 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Tap to open
                  </p>
                  <p className="mt-3 text-lg font-semibold">Sealed for Tekta</p>
                </div>
              </button>
            </div>
          ) : (
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
                      For Tekta
                    </p>
                    <h1 className="font-display text-3xl md:text-4xl">
                      Tekta, will you be my Valentine?
                    </h1>
                  </div>
                </div>

                <p className="text-base text-white/70">
                  Shefafite, lowkey I just want us, soft lights, and a night
                  that feels like a playlist on repeat. “እኔና አንቺ ብቻ እንኳን ሰላም
                  ይሁን፤ ልቤ በአንቺ ላይ ይቀመጣል።”
                </p>

                <div className="rounded-[28px] border-none bg-none p-5">
                  <Lottie
                    animationData={romanticAnimation}
                    loop={true}
                    className="h-full w-full"
                  />
                </div>

                <div className="space-y-4 rounded-[28px] border border-white/20 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                    <span>Handwritten note</span>
                    <span className="text-lg">🖊️</span>
                  </div>
                  <div className="paper-letter mt-3 space-y-3 rounded-2xl border border-white/30 bg-white/90 p-4 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                    <p className="text-sm font-semibold">To Tekta,</p>
                    <p className="text-sm leading-relaxed">
                      ፍቅሬ ሆይ፣ በአንቺ የተሞላ ማታ እመኛለሁ፤ የልቤ ዝምታ ለአንቺ ይዘምራል።
                    </p>
                    <p className="text-sm italic">— Shefafite</p>
                  </div>
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
                      ref={yesButtonRef}
                      style={{ transform: `scale(${yesScale})` }}
                      className="yes-ring rounded-full border border-white/40 bg-gradient-to-r from-white via-[#f2e6eb] to-white px-10 py-4 text-base font-semibold text-ink transition duration-300 hover:scale-110 hover:rounded-[999px] focus:outline-none focus:ring-4 focus:ring-white/40"
                    >
                      {isSending ? "Sending..." : "Yes, always"}
                    </button>

                    <button
                      type="button"
                      onMouseEnter={moveNoButton}
                      onFocus={moveNoButton}
                      onClick={handleNoClick}
                      ref={noButtonRef}
                      style={{
                        transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                      }}
                      className="rounded-full border border-white/30 bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition duration-200"
                    >
                      {noButtonLabels[noLabelIndex]}
                    </button>
                  </div>

                  <div className="w-full max-w-xs rounded-2xl border border-white/30 bg-white/10 px-4 py-4 text-sm text-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                    <p className="mt-1 text-base text-white/95">
                      {pleaMessage}
                    </p>
                  </div>
                </div>

                <div className="relative mt-10 flex flex-col items-center">
                  <div
                    className="cat-wrap transition-transform duration-300"
                    style={{
                      transform: `translate(${catOffset.x}px, ${catOffset.y}px)`,
                    }}
                  >
                    <svg
                      className={`h-24 w-28 text-white/80 drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] ${
                        answer === "yes" ? "cat-happy" : ""
                      }`}
                      viewBox="0 0 120 90"
                      fill="none"
                    >
                      <defs>
                        <linearGradient
                          id="catGlow"
                          x1="0"
                          x2="1"
                          y1="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f7f1f4" />
                          <stop offset="100%" stopColor="#d7cbd6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M20 62C20 45 34 34 60 34C86 34 100 45 100 62C100 79 86 88 60 88C34 88 20 79 20 62Z"
                        fill="url(#catGlow)"
                        opacity="0.35"
                      />
                      <path
                        d="M30 35L40 10L60 32L80 10L90 35"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="45" cy="55" r="7" fill="currentColor" />
                      <circle cx="75" cy="55" r="7" fill="currentColor" />
                      <circle
                        cx={45 + Math.max(-3, Math.min(3, cursorPos.x / 60))}
                        cy={55 + Math.max(-2, Math.min(2, cursorPos.y / 80))}
                        r="3"
                        fill="#0d0d0d"
                      />
                      <circle
                        cx={75 + Math.max(-3, Math.min(3, cursorPos.x / 60))}
                        cy={55 + Math.max(-2, Math.min(2, cursorPos.y / 80))}
                        r="3"
                        fill="#0d0d0d"
                      />
                      <path
                        d="M52 68C56 71 64 71 68 68"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M38 60H22M98 60H82"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">
                    {answer === "yes"
                      ? "I love you. Thanks for being my Valentine."
                      : "Her eyes follow the moment"}
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
        {answer === "yes" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm uppercase tracking-[0.3em] text-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
              Thank you, my Valentine.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
