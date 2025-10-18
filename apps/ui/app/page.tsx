"use client";
import { useState, useRef, useEffect } from "react";
import { useChessStore } from "./store/chessStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ChessApp() {
  const [showPlayPopup, setShowPlayPopup] = useState(false);
  const { username, setUsername, setPlayer } = useChessStore();
  const boardRef = useRef<HTMLDivElement>(null);

  const handlePlay = () => setShowPlayPopup(true);
  const handleConfirmPlay = () => {
    if (!username.trim()) return;
    setShowPlayPopup(false);
    setPlayer({ username: username.trim(), color: "white" });
    window.location.href = `/room/${username}`;
  };

  useEffect(() => {
    if (boardRef.current) {
      gsap.fromTo(
        boardRef.current,
        { y: 150, scale: 0.7, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: boardRef.current,
            start: "top 85%",
            end: "top 60%",
            scrub: 1.5,
          },
        }
      );
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden font-inter text-amber-100">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-yellow-800/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,179,140,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,69,19,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating pieces */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["♛", "♜", "♞", "♝", "♚", "♟", "♔"].map((p, i) => (
          <div
            key={i}
            className="absolute text-amber-200 opacity-10 animate-float"
            style={{
              top: `${10 + i * 10}%`,
              left: `${10 + i * 15}%`,
              fontSize: `${4 + i}rem`,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Glows */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-700/15 to-orange-800/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center text-amber-200 font-semibold">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-wide">♔ ROYAL CHESS</div>
        <button
          onClick={handlePlay}
          className="px-5 py-2 bg-amber-600 rounded-lg shadow hover:scale-105 transition-transform"
        >
          Play Now
        </button>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center mt-32 px-6 md:px-16 space-y-32">
        
        {/* HERO */}
        <section className="text-center max-w-3xl space-y-6">
          <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            Master the Board
          </h1>
          <p className="text-stone-200 text-lg md:text-xl leading-relaxed">
            Step into the timeless game of intellect and patience.  
            Play online, against AI, or with your friends — all in one elegant experience.
          </p>
          <div className="mt-6">
            <button
              onClick={handlePlay}
              className="px-12 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-zinc-900 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              ♔ Start Playing
            </button>
          </div>
        </section>

        {/* CHESSBOARD PREVIEW */}
        <section className="flex justify-center" ref={boardRef}>
          <div className="relative bg-gradient-to-br from-stone-800/40 to-zinc-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-600/30 shadow-2xl">
            <div className="w-96 h-96 grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden border-4 border-amber-700/50 shadow-lg">
              {Array.from({ length: 64 }, (_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const isLight = (row + col) % 2 === 0;
                const blackPieces = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"];
                const whitePieces = ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"];
                const pawn = row === 1 ? "♟" : row === 6 ? "♙" : "";
                const piece =
                  row === 0 ? blackPieces[col] : row === 7 ? whitePieces[col] : pawn;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-3xl font-bold ${
                      isLight
                        ? "bg-amber-50 text-zinc-800"
                        : "bg-amber-900 text-amber-100"
                    }`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl">
          {[
            { icon: "🤖", title: "Smart AI", desc: "Challenge adaptive AI that learns your playstyle." },
            { icon: "🌍", title: "Global Play", desc: "Compete instantly with players worldwide." },
            { icon: "📈", title: "Game Insights", desc: "Track your progress and improve each match." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-stone-800/40 border border-amber-600/30 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-amber-100">{f.title}</h3>
              <p className="text-stone-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-amber-200">Your next move decides everything.</h2>
          <p className="text-stone-300">
            Whether you&apos;re a beginner or a grandmaster — your journey begins here.
          </p>
          <button
            onClick={handlePlay}
            className="px-12 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-zinc-900 font-bold rounded-2xl shadow hover:scale-105 transition-transform"
          >
            ⚔️ Enter the Arena
          </button>
        </section>
      </main>

      {/* MODAL */}
      {showPlayPopup && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-stone-900/90 to-zinc-900/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-amber-600/30 text-center space-y-4">
            <div className="text-6xl animate-pulse">♔</div>
            <h2 className="text-2xl font-bold text-amber-100">Enter Your Name</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleConfirmPlay()}
              placeholder="Your name..."
              className="w-full p-4 rounded-2xl bg-stone-800/50 border-2 border-amber-700/40 text-amber-100 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all duration-300"
            />
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setShowPlayPopup(false)}
                className="flex-1 py-3 bg-stone-700/60 rounded-2xl text-stone-200 hover:bg-stone-600/70 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlay}
                disabled={!username.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-zinc-900 rounded-2xl font-bold hover:scale-105 transition-transform disabled:from-stone-600 disabled:to-stone-700 disabled:text-stone-400"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}