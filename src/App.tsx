import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Lottie from "lottie-react";
import romanticAnimation from "../public/TekValen.json";
import { DotLottiePlayer } from "@dotlottie/react-player";

const FORMSPREE_URL = "https://formspree.io/f/mdskdpjyg";

const pleadingLines = [
  "Shefafite, I'll wait with the softest patience.",
  "Tekta, your yes would light up my quiet nights.",
  "May I try again? I want to be your calm and joy.",
  "Still no? I'll keep showing up with kindness.",
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

type Stage = "closed" | "opening" | "open" | "reading" | "accepted";
type Vector2 = { x: number; y: number };

const App = () => {
  const [stage, setStage] = useState<Stage>("closed"); // closed → opening → open → reading → accepted
  const [answer, setAnswer] = useState("");
  const [yesScale, setYesScale] = useState(1);
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pleaIndex, setPleaIndex] = useState(0);
  const [noLabelIndex, setNoLabelIndex] = useState(0);
  const [noPosition, setNoPosition] = useState<Vector2>({ x: 0, y: 0 });
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState<Vector2>({
    x: 0,
    y: 0,
  });
  const [cursorPos, setCursorPos] = useState<Vector2>({ x: 0, y: 0 });
  const [catOffset, setCatOffset] = useState<Vector2>({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const letterRef = useRef<HTMLDivElement | null>(null);
  const postaRef = useRef<HTMLDivElement | null>(null);
  const letterContentRef = useRef<HTMLDivElement | null>(null);

  const pleaMessage = useMemo(() => pleadingLines[pleaIndex], [pleaIndex]);
  const noButtonLabels = useMemo(
    () => [
      "Please, Tekta?",
      "Don't say no…",
      "Softly, yes?",
      "Give me a chance",
      "Shefafite asks 🥺",
    ],
    [],
  );

  const moveNoButton = () => {
    const container = containerRef.current;
    const button = noButtonRef.current;
    if (!container || !button) return;
    const { width, height } = container.getBoundingClientRect();
    const buttonWidth = button.offsetWidth || 120;
    const buttonHeight = button.offsetHeight || 48;
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

  const trackCursor = (event: React.MouseEvent<HTMLDivElement>) => {
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
      setStage("accepted");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
      setTimeout(() => setConfettiActive(false), 2800);
    }
  };

  const handleOpen = () => {
    if (stage === "closed" && !sent) {
      setStage("opening");
      setTimeout(() => {
        setStage("open");
      }, 800);
    } else if (sent && stage !== "accepted") {
      setStage("accepted");
    }
  };
  const handleLetterScroll = (content: HTMLDivElement) => {
    const scrollTop = content.scrollTop;
    const maxScroll = content.scrollHeight - content.clientHeight;
    const scrollPercent = (scrollTop / maxScroll) * 100;

    setIsScrolling(scrollTop > 10);

    // Transition to "reading" stage when user starts scrolling
    if (scrollTop > 10 && stage === "open") {
      setStage("reading");
    }
  };

  useEffect(() => {
    const letterContent = letterContentRef.current;
    if (!letterContent) return;
    const handleScroll = (event: Event) => {
      if (stage === "reading") {
        const target = event.target as HTMLDivElement | null;
        if (target) {
          handleLetterScroll(target);
        }
      }
    };
    letterContent.addEventListener("scroll", handleScroll);

    return () => {
      letterContent.removeEventListener("scroll", handleScroll);
    };
  }, [stage]);

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

      <main className="relative z-10 flex min-h-screen items-end justify-center px-4 pb-4 md:px-6 md:pb-6">
        {/* === POSTA / ENVELOPE (Wide at bottom) === */}
        <div
          ref={postaRef}
          className={`
            fixed bottom-0 left-0 right-0 w-full
            flex items-end justify-center
            transition-all duration-1000 ease-out z-30
            ${stage === "closed" ? "opacity-100" : "opacity-90"}
          `}
        >
          <div
            className={`
              relative w-full max-w-5xl xl:max-w-6xl
              cursor-pointer transition-all duration-700
              ${stage === "closed" ? "translate-y-0" : "translate-y-4"}
            `}
            onClick={
              stage === "closed" || (sent && stage !== "accepted")
                ? handleOpen
                : undefined
            }
          >
            {/* Envelope body - Very wide */}
            <div
              className={`
                relative w-full aspect-[5/1.8] md:aspect-[5/1.5] xl:aspect-[5/1.3]
                bg-gradient-to-br from-rose-800/90 via-red-800/90 to-purple-900/90
                rounded-t-3xl md:rounded-t-4xl
                shadow-2xl shadow-black/60
                border-t-2 border-x-2 border-rose-400/40
                overflow-hidden
              `}
            >
              {/* Bottom part of envelope (pocket) */}
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-red-900/90 to-pink-800/90" />

              {/* Flap - opens upward */}
              <div
                className={`
                  absolute top-0 left-0 right-0 h-[55%] origin-top
                  bg-gradient-to-b from-rose-700 via-red-700 to-pink-600
                  transition-transform duration-1000 ease-out
                  shadow-lg z-20
                  ${stage !== "closed" ? "rotate-x-[-180deg]" : "rotate-x-0"}
                `}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Inner flap color when opened */}
                <div
                  className="absolute inset-0 bg-rose-950/70 rotate-180"
                  style={{ backfaceVisibility: "hidden" }}
                />
              </div>

              {/* Sealed stamp when accepted */}
              {stage === "accepted" && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="sealed-stamp px-10 py-5 md:px-14 md:py-7 rounded-2xl bg-gradient-to-r from-rose-900/90 to-pink-900/90 backdrop-blur-xl border-4 border-rose-400/60 shadow-2xl">
                    <span className="text-xl md:text-3xl font-bold text-white tracking-wider">
                      SEALED WITH LOVE ❤️
                    </span>
                  </div>
                </div>
              )}

              {/* Hint to open */}
              {stage === "closed" && (
                <div className="absolute top-4 md:top-6 left-0 right-0 text-center">
                  <p className="text-white/60 text-sm md:text-base tracking-wider animate-pulse">
                    Tap the envelope to open
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === LETTER - Scrolls out from posta === */}
        <div
          ref={letterRef}
          className={`
    fixed bottom-0 left-1/2 -translate-x-1/2 z-20
    transition-all duration-1000 ease-out
    ${stage === "closed" ? "letter-closed" : ""}
    ${stage === "open" || stage === "reading" ? "letter-open" : ""}
    ${isScrolling ? "letter-scrolling" : ""}
  `}
        >
          <div
            className={`
      glass-letter curvy-letter letter-container
      w-[95vw] max-w-4xl md:max-w-5xl xl:max-w-6xl
      ${stage === "reading" ? "h-[85vh] max-h-[720px]" : "h-[70vh] max-h-[620px]"}
      ${stage === "open" || stage === "reading" ? "opacity-100" : "opacity-0"}
    `}
          >
            {/* Letter scroll indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
              <div className="scroll-indicator flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
                <svg
                  className="w-5 h-5 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span className="text-xs font-medium text-white/80">
                  {isScrolling ? "Scrolling..." : "Scroll to read"}
                </span>
              </div>
            </div>

            {/* Letter content - scrollable */}
            <div
              ref={letterContentRef}
              className="letter-content h-full overflow-y-auto"
              onScroll={(event) => handleLetterScroll(event.currentTarget)}
            >
              {stage !== "accepted" ? (
                <div
                  ref={containerRef}
                  className="p-6 md:p-10 lg:p-12 min-h-full flex flex-col"
                >
                  {/* Letter top part (peeking out initially) */}
                  <div
                    className={`
                    letter-top transition-opacity duration-500
                    ${isScrolling ? "opacity-0" : "opacity-100"}
                  `}
                  >
                    <div className="text-center mb-10">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300 bg-clip-text text-transparent">
                        To My Tekta ❤️
                      </h1>
                      <p className="text-white/60 mt-4 text-lg">
                        A Valentine's Day Letter
                      </p>
                    </div>
                  </div>

                  {/* Main letter content */}
                  <div className="space-y-8 flex-1">
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
                          <h2 className="font-display text-2xl md:text-3xl">
                            Will you be my Valentine?
                          </h2>
                        </div>
                      </div>

                      <p className="text-lg text-white/80 leading-relaxed">
                        Shefafite, lowkey I just want us, soft lights, and a
                        night that feels like a playlist on repeat. "እኔና አንቺ ብቻ
                        እንኳን ሰላም ይሁን፤ ልቤ በአንቺ ላይ ይቀመጣል።"
                      </p>

                      <div className="rounded-[28px] border-none bg-none p-1">
                        <Lottie
                          animationData={romanticAnimation}
                          loop={true}
                          className="h-48 w-full"
                        />
                      </div>
                    </section>

                    {/* Spacer to push content up as you scroll */}
                    <div className="h-16" />

                    <section className="space-y-6">
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

                    {/* Spacer to push content up as you scroll */}
                    <div className="h-16" />

                    {/* Response section (appears as you scroll up) */}
                    <section className="relative pt-10">
                      <div className="flex flex-col items-center gap-6 text-center">
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            {answer === "yes"
                              ? "She said yes. 🤍"
                              : "Your answer awaits..."}
                          </p>
                          <p className="text-sm text-white/60">
                            {sent
                              ? "Her response just arrived in your inbox."
                              : "The 'Not' button is shy, but the 'Yes' button is bold."}
                          </p>
                        </div>

                        <div className="relative flex w-full items-center justify-center gap-6">
                          <button
                            type="button"
                            onClick={handleYes}
                            ref={yesButtonRef}
                            style={{ transform: `scale(${yesScale})` }}
                            className="yes-ring rounded-full border border-white/40 bg-gradient-to-r from-white via-[#f2e6eb] to-white px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-semibold text-ink transition duration-300 hover:scale-110 hover:rounded-[999px] focus:outline-none focus:ring-4 focus:ring-white/40"
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
                            className="rounded-full border border-white/30 bg-white/5 px-6 py-2 md:px-8 md:py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition duration-200"
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
                          <div className="h-36 w-44 md:h-48 md:w-56 transform scale-110 md:scale-125 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                            <DotLottiePlayer
                              src="/cat.lottie"
                              autoplay
                              loop
                              style={{ width: "100%", height: "100%" }}
                            />
                          </div>
                        </div>

                        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/50 text-center">
                          {answer === "yes"
                            ? "I love you. Thanks for being my Valentine."
                            : "Watching every move..."}
                        </p>
                      </div>
                    </section>

                    {/* Bottom spacer */}
                    <div className="h-20" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 md:p-16 h-full text-center">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300 bg-clip-text text-transparent mb-6 md:mb-10 animate-pulse">
                    You already said yes darling 🤍
                  </h2>
                  <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12">
                    I love you forever.
                  </p>
                  <div className="w-full max-w-md lg:max-w-xl">
                    <Lottie
                      animationData={romanticAnimation}
                      loop
                      className="w-full h-64 md:h-80 lg:h-96"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Already answered message */}
        {sent && stage === "accepted" && (
          <div className="fixed top-8 md:top-12 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
            <div className="inline-block bg-black/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-rose-400/30 shadow-2xl">
              <p className="text-white text-lg md:text-xl font-medium">
                You already said yes darling, I love you! 🤍
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
