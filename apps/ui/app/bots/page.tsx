"use client";
import React, { useState, useEffect } from "react";
import { ChessGame } from "@repo/chess/Game";
import { ChessAI } from "@repo/chess/ChessAI";
import ChessBoard from "@/app/components/ChessBoard";

export default function BotBoard() {
  const [game] = useState(() => {
    const newGame = new ChessGame("white", true); // skip room ID
    // Ensure the game starts with white's turn
    newGame.state.turn = "white";
    return newGame;
  });
  const [ai] = useState(() => new ChessAI(game));
  const [board, setBoard] = useState(game.state.board);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Array<{ x: number, y: number }>>([]);
  const [moveSuggestions, setMoveSuggestions] = useState<Array<{
    from: { x: number, y: number },
    to: { x: number, y: number },
    piece: string,
    score?: number
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<{ from: { x: number, y: number }, to: { x: number, y: number } } | null>(null);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Keep turn state in sync with game state
  useEffect(() => {
    setTurn(game.state.turn as "white" | "black");
  }, [game.state.turn]);

  const indexToNotation = (x: number, y: number) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[x]}${8 - y}`;
  };

  const handleSquareClick = (row: number, col: number) => {
    console.log("Square clicked:", row, col, "Turn:", turn, "Message:", message);

    if (message || turn !== "white" || isThinking) {
      console.log("Click blocked - game over, not player turn, or AI thinking");
      return; // game over, not player turn, or AI thinking
    }

    const clicked = { x: row, y: col };
    const piece = game.state.board[row]?.[col];
    console.log("Piece at clicked position:", piece);

    // If nothing selected yet -> attempt to select a piece
    if (!selected) {
      if (piece && turn === "white") {
        // Check if it's a white piece (assuming uppercase = white)
        const isWhitePiece = piece === piece.toUpperCase();
        console.log("Is white piece:", isWhitePiece);
        if (isWhitePiece) {
          setSelected(clicked);
          // Get available moves for this piece
          try {
            const moves = game.getMoves(row, col, "white");
            console.log("Available moves:", moves);
            setAvailableMoves(moves);
          } catch (e) {
            console.error("Error getting moves:", e);
            setAvailableMoves([]);
          }
        }
      }
      return;
    }

    // If clicked same square -> deselect
    if (selected.x === clicked.x && selected.y === clicked.y) {
      console.log("Deselecting piece");
      setSelected(null);
      setAvailableMoves([]);
      return;
    }

    // Attempt move from selected -> clicked
    try {
      console.log("Attempting move from", selected, "to", clicked);
      const result = game.makeMove(selected, clicked, "white");

      if ((result as any)?.error === "Illegal move") {
        console.warn("Illegal move detected, ignoring");
        // Keep the selection active so user can try another move
        setMessage("⚠️ Invalid move. Try a legal square.");
        setTimeout(() => setMessage(""), 1000);
        return;
      }

      console.log("Move result:", result);
      setBoard([...result.board]);
      setTurn(result.turn as "white" | "black");
      setSelected(null);
      setAvailableMoves([]);
      setShowSuggestions(false);
      setHighlightedSuggestion(null);

      // Add move to history
      const moveNotation = `${indexToNotation(selected.x, selected.y)}${indexToNotation(clicked.x, clicked.y)}`;
      setGameHistory(prev => [...prev, moveNotation]);

      if (result.gameOver) {
        setMessage(result.winner === "white" ? "🎉 You Win! Congratulations!" : "🤖 Bot Wins! Better luck next time!");
        return;
      }

      // Bot response
      setIsThinking(true);
      setTimeout(() => {
        try {
          const move = ai.getSuggestions("black", 1, 2, game.state.moveCount)[0];
          console.log("Bot move suggestion:", move);

          if (move) {
            const botResult = game.makeMove(move.from, move.to, "black");
            console.log("Bot move result:", botResult);

            setBoard([...botResult.board]);
            setTurn(botResult.turn as "white" | "black");

            // Add bot move to history
            const botMoveNotation = `${indexToNotation(move.from.x, move.from.y)}${indexToNotation(move.to.x, move.to.y)}`;
            setGameHistory(prev => [...prev, botMoveNotation]);

            if (botResult.gameOver) {
              setMessage(botResult.winner === "white" ? "🎉 You Win! Congratulations!" : "🤖 Bot Wins! Better luck next time!");
            }
          } else {
            console.log("No bot move available");
            // If bot has no moves, it might be checkmate or stalemate
            setMessage("🎉 You Win! Bot has no valid moves!");
          }
        } catch (botError: any) {
          console.error("Bot move error:", botError);
          setMessage("🤖 Bot encountered an error. You win!");
        }
        setIsThinking(false);
      }, 500);
    } catch (err: any) {
      console.error("Move error:", err);
      // invalid move -> keep selection so the user can try a different destination
    }
  };

  const handleSuggestMove = () => {
    if (turn !== "white" || message) return;

    try {
      const suggestions = ai.getSuggestions("white", 5, 2, game.state.moveCount);
      setMoveSuggestions(suggestions);
      setShowSuggestions(true);

      // Highlight the best suggestion
      if (suggestions.length > 0) {
        setHighlightedSuggestion({
          from: suggestions[0].from,
          to: suggestions[0].to
        });
      }
    } catch (e) {
      console.error("Error getting suggestions:", e);
    }
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
    setMoveSuggestions([]);
    setHighlightedSuggestion(null);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

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
          Back to Home
        </button>
      </nav>

      <div className="relative z-10 pt-24 pb-16 px-6 md:px-16">
        <div className="max-w-8xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-4">
              🤖 Play vs AI Bot
            </h1>
            <p className="text-stone-200 text-lg">Challenge our intelligent AI opponent and improve your chess skills</p>

            {/* Game Status */}
            <div className="mt-4 inline-flex items-center gap-3 bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border-2 border-amber-600/30 shadow-2xl">
              <div className="text-2xl">
                {turn === "white" ? "⚪" : "⚫"}
              </div>
              <div>
                <span className="text-lg font-bold text-stone-100">
                  {isThinking ? "🤖 Bot is thinking..." :
                    turn === "white" ? "Your Turn" : "Bot's Turn"}
                </span>
              </div>
              <div className="text-2xl">
                {turn === "white" ? "👤" : "🤖"}
              </div>
            </div>

            {message && (
              <div className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-purple-900/60 to-blue-900/60 backdrop-blur-xl border-2 border-purple-500/50 text-purple-200 px-8 py-4 rounded-2xl shadow-2xl">
                <span className="text-2xl">🏆</span>
                <span className="font-bold text-xl">{message}</span>
                <span className="text-2xl">🎉</span>
              </div>
            )}
          </div>

          {/* Main Game Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

            {/* Left Side - Game Controls */}
            <div className="lg:col-span-3 space-y-6">

              {/* AI Suggestions Panel */}
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl border border-amber-600/20 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-semibold tracking-wide text-emerald-300 text-sm uppercase">
                    🤖 AI Assistant
                  </h3>
                  <span className="text-xs text-stone-400 uppercase tracking-wide">Smart Moves</span>
                </div>

                <button
                  onClick={handleSuggestMove}
                  disabled={turn !== "white" || !!message}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 mb-4 ${turn === "white" && !message
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md'
                      : 'bg-stone-800/60 text-stone-500 cursor-not-allowed'
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>Get Move Suggestion</span>
                  </span>
                </button>

                {showSuggestions && (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-100 flex items-center gap-2">
                        <span>🎯</span>
                        <span>Best Moves</span>
                      </span>
                      <button
                        onClick={handleCloseSuggestions}
                        className="text-stone-500 hover:text-amber-100 bg-stone-800/40 px-2 py-1 rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {moveSuggestions.slice(0, 5).map((suggestion, index) => (
                        <div key={index} className={`p-3 rounded-lg text-xs transition-all ${index === 0 ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50' : 'bg-stone-800/30 hover:bg-stone-700/40'
                          }`}>
                          {index === 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-xs text-emerald-300 bg-emerald-600/20 px-2 py-1 rounded font-bold">✨ BEST</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-amber-100 font-semibold">
                              {indexToNotation(suggestion.from.x, suggestion.from.y)} → {indexToNotation(suggestion.to.x, suggestion.to.y)}
                            </span>
                            {suggestion.score && (
                              <span className="text-amber-400 font-bold">
                                ({suggestion.score.toFixed(1)})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Move History */}
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl border border-amber-600/20 shadow-xl p-6">
                <h3 className="flex items-center gap-2 font-semibold tracking-wide text-purple-200 text-sm uppercase mb-4">
                  📜 Move History
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                  {gameHistory.length === 0 ? (
                    <div className="text-center py-6 space-y-1 text-stone-400">
                      <div className="text-2xl opacity-50">⏳</div>
                      <p className="italic">Game in progress...</p>
                      <p className="text-xs text-stone-500">Make your first move!</p>
                    </div>
                  ) : (
                    gameHistory.slice().reverse().map((move, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/30 hover:bg-stone-700/40 transition-all duration-200">
                        <span className="text-stone-400 font-mono text-xs min-w-[2rem] bg-stone-800/40 px-2 py-1 rounded text-center">
                          {gameHistory.length - index}
                        </span>
                        <span className="text-amber-100 font-mono font-semibold">{move}</span>
                        <span className="text-xs text-stone-500">
                          {(gameHistory.length - index) % 2 === 1 ? "👤" : "🤖"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl border border-amber-600/20 shadow-xl p-6">
                <h3 className="flex items-center gap-2 font-semibold tracking-wide text-blue-200 text-sm uppercase mb-4">
                  🎮 Game Controls
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleNewGame}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md"
                  >
                    🔄 New Game
                  </button>
                  <button
                    onClick={() => window.location.href = '/howtoplay'}
                    className="w-full py-3 px-4 bg-stone-700/60 border border-amber-600/30 text-amber-100 font-semibold rounded-xl hover:bg-stone-600/70 transition-colors"
                  >
                    📚 How to Play
                  </button>
                </div>
              </div>

              {/* Debug Panel */}
              <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-red-600/20 shadow-xl p-4">
                <h3 className="flex items-center gap-2 font-semibold tracking-wide text-red-200 text-xs uppercase mb-3">
                  🐛 Debug Info
                </h3>
                <div className="space-y-2 text-xs text-stone-300">
                  <div>Turn: <span className="text-amber-200">{turn}</span></div>
                  <div>Selected: <span className="text-amber-200">{selected ? `${selected.x},${selected.y}` : 'none'}</span></div>
                  <div>Available Moves: <span className="text-amber-200">{availableMoves.length}</span></div>
                  <div>Is Thinking: <span className="text-amber-200">{isThinking ? 'yes' : 'no'}</span></div>
                  <div>Game Message: <span className="text-amber-200">{message || 'none'}</span></div>
                  <div>Move Count: <span className="text-amber-200">{game.state.moveCount}</span></div>
                  <div>Game Turn: <span className="text-amber-200">{game.state.turn}</span></div>
                </div>
              </div>
            </div>

            {/* Right Side - Chess Board */}
            <div className="lg:col-span-7 flex justify-center items-start">
              <div className="relative">
                {/* Royal glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/25 via-yellow-600/15 to-amber-700/25 blur-3xl rounded-3xl transform scale-110 animate-pulse"></div>

                {/* Board container */}
                <div className="relative bg-gradient-to-br from-stone-800/60 to-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl border-2 border-amber-600/30 shadow-2xl">
                  <ChessBoard
                    onSquareClick={handleSquareClick}
                    board={board}
                    selected={selected}
                    highlightedSuggestion={highlightedSuggestion}
                    availableMoves={availableMoves}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}