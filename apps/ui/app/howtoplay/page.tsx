"use client";

import Footer from "../components/Footer";

export default function HowToPlayPage() {
  const pieceMovements = [
    {
      piece: "♔",
      name: "King",
      description: "Moves one square in any direction",
      moves: "The most important piece. Protect it at all costs!"
    },
    {
      piece: "♕",
      name: "Queen",
      description: "Moves any number of squares in any direction",
      moves: "The most powerful piece on the board"
    },
    {
      piece: "♖",
      name: "Rook",
      description: "Moves any number of squares horizontally or vertically",
      moves: "Essential for castling and endgame strategy"
    },
    {
      piece: "♗",
      name: "Bishop",
      description: "Moves any number of squares diagonally",
      moves: "Each player starts with one light-squared and one dark-squared bishop"
    },
    {
      piece: "♘",
      name: "Knight",
      description: "Moves in an L-shape: 2 squares in one direction, then 1 perpendicular",
      moves: "The only piece that can jump over other pieces"
    },
    {
      piece: "♙",
      name: "Pawn",
      description: "Moves forward one square, captures diagonally",
      moves: "Can move two squares on its first move. Can promote when reaching the end"
    }
  ];

  const gameRules = [
    {
      title: "Getting Started",
      icon: "🚀",
      content: [
        "Click 'Play Now' from the home page",
        "Enter your username",
        "Create a new room or join an existing one",
        "Wait for an opponent to join"
      ]
    },
    {
      title: "Making Moves",
      icon: "🎯",
      content: [
        "Click on your piece to select it",
        "Valid moves will be highlighted in green",
        "Click on a highlighted square to move",
        "White always moves first"
      ]
    },
    {
      title: "Special Moves",
      icon: "✨",
      content: [
        "Castling: Move king 2 squares toward rook, rook jumps over",
        "En Passant: Special pawn capture move",
        "Promotion: Pawn reaching the end becomes any piece",
        "Check: When the king is under attack"
      ]
    },
    {
      title: "AI Assistance",
      icon: "🤖",
      content: [
        "Click 'Suggest Move' for AI recommendations",
        "Best moves are highlighted with scores",
        "Use suggestions to learn and improve",
        "AI considers multiple moves ahead"
      ]
    }
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Chess-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-yellow-800/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,179,140,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,69,19,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating chess pieces background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-8 animate-float text-amber-200">♛</div>
        <div className="absolute top-40 right-20 text-5xl opacity-6 animate-float-delay text-stone-300">♜</div>
        <div className="absolute bottom-32 left-1/4 text-7xl opacity-10 animate-float-slow text-amber-300">♞</div>
        <div className="absolute bottom-20 right-1/3 text-8xl opacity-4 animate-float text-stone-200">♝</div>
        <div className="absolute top-1/3 left-1/2 text-4xl opacity-8 animate-float-delay text-yellow-200">♚</div>
      </div>

      {/* Golden orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-amber-500/15 to-yellow-600/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-700/10 to-orange-800/8 rounded-full blur-3xl animate-pulse"></div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center text-amber-200 font-semibold">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-wide">♔ ROYAL CHESS</div>
        <button
          onClick={() => window.location.href = '/'}
          className="px-5 py-2 bg-amber-600 rounded-lg shadow hover:scale-105 transition-transform"
        >
          Back to Game
        </button>
      </nav>

      <div className="relative z-10 pt-24 pb-16 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-6">
              How to Play Chess
            </h1>
            <p className="text-stone-200 text-xl leading-relaxed max-w-3xl mx-auto">
              Master the royal game with our comprehensive guide. Learn piece movements, 
              special rules, and strategic concepts to become a formidable player.
            </p>
          </div>

          {/* Chess Pieces Guide */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-200 mb-4">♞ Chess Pieces & Movements</h2>
              <p className="text-stone-300 text-lg">Each piece has unique movement patterns and strategic value</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pieceMovements.map((piece, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl border border-amber-600/20 shadow-xl p-6 hover:scale-105 transition-transform"
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl text-amber-50 mb-3">{piece.piece}</div>
                    <h3 className="text-xl font-bold text-amber-100">{piece.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {piece.description}
                    </p>
                    <div className="bg-stone-800/40 rounded-lg p-3">
                      <p className="text-amber-200 text-xs font-semibold uppercase tracking-wide mb-1">Strategy Tip</p>
                      <p className="text-stone-400 text-xs">{piece.moves}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Game Rules & Features */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-200 mb-4">🎮 Game Rules & Features</h2>
              <p className="text-stone-300 text-lg">Everything you need to know to start playing online</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gameRules.map((rule, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl border border-amber-600/20 shadow-xl p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">{rule.icon}</div>
                    <h3 className="text-2xl font-bold text-amber-100">{rule.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {rule.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 text-stone-300">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Winning Conditions */}
          <section className="mb-20">
            <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-3xl border border-amber-600/20 shadow-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-amber-200 mb-4">🏆 How to Win</h2>
                <p className="text-stone-300 text-lg">Master these victory conditions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="text-5xl mb-3">⚔️</div>
                  <h3 className="text-xl font-bold text-amber-100">Checkmate</h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Trap the opponents king so it cannot escape capture. The ultimate victory!
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-5xl mb-3">🏳️</div>
                  <h3 className="text-xl font-bold text-amber-100">Resignation</h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Your opponent surrenders when their position becomes hopeless.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-5xl mb-3">⏰</div>
                  <h3 className="text-xl font-bold text-amber-100">Time Out</h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    In timed games, win when your opponent runs out of time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips for Success */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-200 mb-4">💡 Pro Tips</h2>
              <p className="text-stone-300 text-lg">Elevate your game with these strategic insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🛡️", tip: "Control the Center", desc: "Dominate the middle squares for better piece mobility" },
                { icon: "🏰", tip: "Castle Early", desc: "Get your king to safety while developing your rook" },
                { icon: "⚡", tip: "Develop Pieces", desc: "Bring knights and bishops into active positions quickly" },
                { icon: "👁️", tip: "Think Ahead", desc: "Always look for opponent threats and plan your response" }
              ].map((tip, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-stone-900/40 to-zinc-900/40 backdrop-blur-xl rounded-xl border border-amber-600/15 shadow-lg p-6 text-center hover:scale-105 transition-transform"
                >
                  <div className="text-4xl mb-3">{tip.icon}</div>
                  <h3 className="text-lg font-bold text-amber-100 mb-2">{tip.tip}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-3xl border-2 border-amber-600/30 shadow-2xl p-12">
              <div className="text-7xl mb-6">♔</div>
              <h2 className="text-4xl font-bold text-amber-200 mb-4">Ready to Play?</h2>
              <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
                Now that you know the rules, its time to put your skills to the test. 
                Challenge opponents worldwide or practice against our intelligent AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-zinc-900 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                  ⚔️ Start Playing Now
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-stone-700/60 border border-amber-600/30 text-amber-100 font-bold rounded-2xl hover:bg-stone-600/70 transition-colors"
                >
                  🏠 Back to Home
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
      <Footer/>
    </div>
  );
}
