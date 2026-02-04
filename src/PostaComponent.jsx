import React, { useState } from "react";
import Lottie from "lottie-react";
import romanticAnimation from "../public/TekValen.json"; // adjust path as needed

const FORMSPREE_URL = "https://formspree.io/f/mdskdpjyg";

const PostaComponent = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  const moveNoButton = () => {
    const randomX = (Math.random() - 0.5) * 220;
    const randomY = (Math.random() - 0.5) * 140 - 40;
    setNoPosition({ x: randomX, y: randomY });
  };

  const handleYes = async () => {
    if (isSending || sent) return;

    setIsSending(true);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: "Yes",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setSent(true);
    } catch (err) {
      console.error("Form submission error:", err);
      // Optionally show error message to user
    } finally {
      setIsSending(false);
    }
  };

  const handleEnvelopeClick = () => {
    if (sent) return; // prevent re-open after sealed
    setIsOpened(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-black to-indigo-950 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background subtle effects - optional */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,182,193,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(216,180,254,0.06),transparent_50%)]" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] md:aspect-[5/3] flex items-center justify-center">
        {/* Envelope container */}
        <div
          className={`
            relative w-full max-w-[min(90vw,520px)] h-[520px] md:h-[620px] cursor-pointer group
            perspective-[1800px]
          `}
          onClick={handleEnvelopeClick}
        >
          {/* Envelope body */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-br from-rose-800 to-red-950 
              rounded-[16px] md:rounded-[24px] shadow-2xl shadow-black/60
              border border-rose-400/30 overflow-hidden
              transition-transform duration-1000
              ${sent ? "scale-[0.94] rotate-[2deg]" : ""}
            `}
          >
            {/* Flap - opens upwards */}
            <div
              className={`
                absolute top-0 left-0 right-0 h-[42%] origin-top
                bg-gradient-to-b from-rose-700 to-rose-900
                transition-transform duration-1000 ease-out
                shadow-xl z-20
                ${isOpened ? "rotate-x-[-180deg]" : "rotate-x-0"}
              `}
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Inner flap color when opened */}
              <div
                className="absolute inset-0 bg-rose-950/80 rotate-180"
                style={{ backfaceVisibility: "hidden" }}
              />
            </div>

            {/* Letter - slides up when opened */}
            <div
              className={`
                absolute bottom-0 left-6 right-6 bg-[#fffaf5] text-rose-950 
                rounded-t-xl shadow-xl border-t-4 border-pink-400/70
                transition-all duration-1000 ease-out
                p-6 md:p-8 font-serif
                ${
                  isOpened && !sent
                    ? "translate-y-[-60%] md:translate-y-[-65%] opacity-100 scale-100"
                    : "translate-y-[80%] opacity-0 scale-95 pointer-events-none"
                }
              `}
            >
              <div className="text-center space-y-5">
                <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-rose-900">
                  Tekta, will you be my Valentine?
                </h2>

                <div className="h-44 md:h-56 mx-auto">
                  <Lottie animationData={romanticAnimation} loop autoplay />
                </div>

                <p className="text-sm md:text-base italic text-rose-800/90 leading-relaxed">
                  ልቤ በአንቺ ላይ ይቀመጣል።
                  <br />
                  Soft lights, quiet nights, just us and good music...
                </p>

                {sent ? (
                  <div className="py-6">
                    <p className="text-xl font-bold text-rose-700 animate-pulse">
                      Thank you, my Valentine 🤍
                    </p>
                    <p className="text-sm mt-2 text-rose-800/80">
                      Sealed forever with love.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleYes();
                      }}
                      disabled={isSending}
                      className={`
                        px-10 py-4 rounded-full font-bold text-white 
                        bg-gradient-to-r from-rose-600 to-pink-600
                        hover:from-rose-500 hover:to-pink-500
                        shadow-lg hover:shadow-xl transition-all
                        disabled:opacity-60
                      `}
                    >
                      {isSending ? "Sending..." : "Yes, always"}
                    </button>

                    <button
                      onMouseEnter={moveNoButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveNoButton();
                      }}
                      style={{
                        transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                      }}
                      className={`
                        px-8 py-3 rounded-full text-sm font-medium
                        bg-white/10 text-white/80 backdrop-blur-sm
                        border border-white/20 hover:border-white/40
                        transition-all duration-300
                      `}
                    >
                      Not today...
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seal overlay when sent */}
            {sent && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-rose-900/80 backdrop-blur-md px-10 py-5 rounded-2xl border-4 border-rose-400/40 shadow-2xl transform rotate-6">
                  <span className="text-3xl font-bold text-white tracking-wider">
                    SEALED WITH LOVE ❤️
                  </span>
                </div>
              </div>
            )}

            {/* Already answered message when trying to reopen */}
            {sent && isOpened && (
              <div className="absolute -top-20 left-0 right-0 text-center z-40 pointer-events-none">
                <div className="inline-block bg-black/60 backdrop-blur-lg px-6 py-3 rounded-xl border border-rose-400/30">
                  <p className="text-white text-lg font-medium">
                    You already said yes darling, I love you! 🤍
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostaComponent;
