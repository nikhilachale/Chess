"use client";

import ChessBoard from "@/app/components/ChessBoard";
import { useHandleClick } from "@/app/components/handleclick";
import RoomOptions from "@/app/components/RoomOptions";
import { useChessStore } from "@/app/store/chessStore";
import { useEffect, useState, useCallback } from "react";


interface Props {
  params: Promise<{ roomid: string }>;
}

export default function RoomPage({ params }: Props) {
  const {
    socket,
    setSocket,
    roomName,
    setRoomName,
    setUsername,
    player,
    setPlayer,
    playerId,
    setPlayerId,
    currentTurn,
    setCurrentTurn,
    board,
    setBoard,
    setCanMove,
    check,
    setCheck
  } = useChessStore();

  const { handleSquareClick } = useHandleClick();
  
  // Local state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomChoice, setRoomChoice] = useState<'create' | 'join' | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState("");

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [moveSuggestions, setMoveSuggestions] = useState<Array<{
    from: {x: number, y: number},
    to: {x: number, y: number},
    piece: string,
    score?: number
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<{from: {x: number, y: number}, to: {x: number, y: number}} | null>(null);

  // Helper functions defined before useEffect to avoid exhaustive-deps warning
  const indexToNotation = useCallback((x: number, y: number) => {
    const files = ['a','b','c','d','e','f','g','h'];
    return `${files[x]}${8 - y}`; // y=0 → row 8, y=7 → row 1
  }, []);


  // Await params on component mount
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRoomId(resolvedParams.roomid);
      
      // Auto-set player with room ID as username
      const defaultUsername = `Player_${resolvedParams.roomid}`;
      setUsername(defaultUsername);
      setPlayer({ username: defaultUsername, color: "white" });
    };
    getParams();
  }, [params, setUsername, setPlayer]);

  // Initialize WebSocket connection if not exists
  useEffect(() => {
    // Helper function to convert move coordinates to chess notation
    const moveToNotation = (from: {x:number, y:number}, to: {x:number, y:number}) => {
      return `${indexToNotation(from.x, from.y)}${indexToNotation(to.x, to.y)}`;
    };

    if (!socket) {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080" );

      ws.onopen = () => {
        console.log("WebSocket connected");
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        switch (data.type) {
          case "room_created":
            setRoomName(data.roomName);
            setPlayerId(data.id || "white");
            setCurrentTurn(data.turn || "white");
            setBoard(data.board || board);
            setGameStarted(true);
            break;
          case "room_joined":
            setRoomName(data.roomName);
            setPlayerId(data.id || "black");
            setCurrentTurn(data.turn || "white");
            setBoard(data.board || board);
            setGameStarted(true);
            break;
          case "error":
            alert(data.message || "An error occurred");
            setGameStarted(false);
            setShowJoinPopup(false);
            setRoomChoice(null);
            break;
          case "available_moves":
            setCanMove(data.moves || []);
            break;
          case "move_made":
            setBoard(data.board);
            setCanMove([]);
            setCurrentTurn(data.turn);
            setCheck(data.check);
            // Clear suggestion highlights when a move is made
            setHighlightedSuggestion(null);
            setShowSuggestions(false);
            setMoveSuggestions([]);
// Example: data.from, data.to
  if (data.from && data.to) {
    const moveNotation = moveToNotation(data.from, data.to);
    setMoveHistory(prev => [...prev, moveNotation]);
  }
            break;
          case "user_joined":
            console.log("Another user joined the room");
            break;
          case "user_left":
            console.log("A user left the room");
            break;
          case "move_suggestions":
            setMoveSuggestions(data.suggestions || []);
            setShowSuggestions(true);
            // Highlight the best suggestion (first one)
            if (data.suggestions && data.suggestions.length > 0) {
              setHighlightedSuggestion({
                from: data.suggestions[0].from,
                to: data.suggestions[0].to
              });
            }
            break;
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  }, [socket, setSocket, setRoomName, setPlayerId, setCurrentTurn, setBoard, setCanMove, setCheck, board, setGameStarted, setShowJoinPopup, setRoomChoice, setMoveSuggestions, setShowSuggestions, setHighlightedSuggestion, setMoveHistory, indexToNotation]);

  // Handle create room
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateRoom = () => {
    if (!socket || !player?.username) return;
    
    setRoomChoice('create');
    socket.send(JSON.stringify({
      type: "create_room",
      playerId: "white",  // First player is always white
      username: player.username
    }));
  };

  // Handle join room button click (show popup)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleJoinRoomClick = () => {
    setShowJoinPopup(true);
  };

  // Handle actual join room with entered room name
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConfirmJoinRoom = () => {
    if (!socket || !player?.username || !joinRoomName.trim()) return;
    
    setRoomChoice('join');
    setShowJoinPopup(false);
    socket.send(JSON.stringify({
      type: "join_room",
      roomName: joinRoomName.trim(),
      playerId: "black", // always join as black
    }));
  };

  // Handle cancel join room
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancelJoinRoom = () => {
    setShowJoinPopup(false);
    setJoinRoomName("");
  };

  // Handle suggest move
  const handleSuggestMove = () => {
    if (!socket || !roomName || !playerId) return;
    
    // Clear previous suggestions and highlights
    setMoveSuggestions([]);
    setShowSuggestions(false);
    setHighlightedSuggestion(null);
    
    socket.send(JSON.stringify({
      type: "suggest_move",
      roomName: roomName,
      playerId: playerId
    }));
  };

  // Handle closing suggestions
  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
    setMoveSuggestions([]);
    setHighlightedSuggestion(null);
  };

  // Show loading if roomId is not yet resolved
  if (!roomId) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Chess-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-yellow-800/15 to-amber-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,179,140,0.15),transparent_50%)]"></div>
        </div>
        
        {/* Floating pieces */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-8xl opacity-10 animate-float text-amber-200">♛</div>
          <div className="absolute bottom-20 right-20 text-6xl opacity-8 animate-float-delay text-stone-300">♜</div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-3xl p-12 border-2 border-amber-600/30 shadow-2xl">
            <div className="text-7xl mb-6 animate-pulse">♔</div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-6"></div>
            <p className="text-amber-100 text-xl font-semibold">Preparing the Game Room...</p>
            <p className="text-stone-400 text-sm mt-2">Setting up the chess battlefield</p>
          </div>
        </div>
      </div>
    );
  }

  // Show create/join room options if game hasn't started
  if (!gameStarted) {
    return (
      <RoomOptions socket={socket} player={player} />
    );
  }

  // Show loading if no room name yet
  if (!roomName) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Chess-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-yellow-800/15 to-amber-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,179,140,0.15),transparent_50%)]"></div>
        </div>
        
        {/* Floating pieces */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-6xl opacity-8 animate-float text-amber-300">♞</div>
          <div className="absolute bottom-1/4 right-1/4 text-7xl opacity-10 animate-float-delay text-stone-200">♝</div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-3xl p-12 border-2 border-amber-600/30 shadow-2xl">
            <div className="text-7xl mb-6 animate-pulse">🏰</div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-6"></div>
            <p className="text-amber-100 text-xl font-semibold">Connecting to Game Room...</p>
            <p className="text-stone-400 text-sm mt-2">Establishing secure connection</p>
          </div>
        </div>
      </div>
    );
  }

  // Show chess board once game has started
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Chess-themed background matching landing page */}
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

      {/* Royal navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center text-amber-200 font-semibold">
        <div className="flex items-center gap-3 text-xl font-bold tracking-wide">♔ ROYAL CHESS</div>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-amber-600 rounded-lg shadow hover:scale-105 transition-transform text-sm"
        >
          Leave Room
        </button>
      </nav>

      <div className="relative z-10 p-4 md:p-6 pt-16">
        <div className="max-w-8xl mx-auto">
          {/* Compact Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border-2 border-amber-600/30 shadow-2xl">
              <div className="text-2xl">🏰</div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-stone-100">
                  Game Room: <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">{roomName}</span>
                </h1>
              </div>
              <div className="text-2xl">👑</div>
            </div>
            
            {check && (
              <div className="mt-3 inline-flex items-center gap-3 bg-red-900/40 backdrop-blur-xl border-2 border-red-600/50 text-red-200 px-6 py-2 rounded-2xl animate-pulse shadow-2xl shadow-red-500/25">
                <div className="text-2xl animate-bounce">⚠️</div>
                <span className="font-bold text-lg">
                  {check.toUpperCase()} KING IN MORTAL PERIL!
                </span>
                <div className="text-2xl animate-bounce">⚠️</div>
              </div>
            )}
          </div>

          {/* Main Game Layout - 30/70 Split */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full">

            {/* Left Side - All UI Components (30%) */}
            <div className="lg:col-span-3 space-y-4 h-full overflow-y-auto">
              
              {/* Player Info */}
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-600/30 shadow-2xl">
                <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Player Status</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-stone-800/40">
                    <div className="text-lg mb-1">👨‍💻</div>
                    <div className="text-xs text-stone-300 mb-1">Username</div>
                    <div className="text-amber-300 font-semibold text-sm truncate" title={player?.username}>
                      {player?.username}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-stone-800/40">
                    <div className="text-lg mb-1">🎭</div>
                    <div className="text-xs text-stone-300 mb-1">Playing as</div>
                    <div className={`font-bold text-sm px-2 py-1 rounded-full ${
                      playerId === 'white' 
                        ? 'bg-gradient-to-r from-stone-100 to-amber-50 text-zinc-800' 
                        : 'bg-gradient-to-r from-stone-800 to-zinc-900 text-amber-100'
                    }`}>
                      {playerId?.toUpperCase() || 'WAITING...'}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-stone-800/40">
                    <div className="text-lg mb-1">⏰</div>
                    <div className="text-xs text-stone-300 mb-1">Current Turn</div>
                    <div className={`font-bold text-sm px-2 py-1 rounded-full animate-pulse ${
                      currentTurn === 'white' 
                        ? 'bg-gradient-to-r from-stone-100 to-amber-50 text-zinc-800' 
                        : 'bg-gradient-to-r from-stone-800 to-zinc-900 text-amber-100'
                    }`}>
                      {currentTurn?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-600/30 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-amber-100 flex items-center">
                    <span className="text-2xl mr-2">🤖</span>
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI</span>
                  </h3>
                </div>
                
                <button
                  onClick={handleSuggestMove}
                  disabled={currentTurn !== playerId || !socket}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    currentTurn === playerId && socket
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25'
                      : 'bg-stone-700/50 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">💡</span>
                    <span className="text-sm">Suggest Move</span>
                  </span>
                </button>

                {showSuggestions && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-100 flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span className="text-xs">Divine Guidance</span>
                      </span>
                      <button
                        onClick={handleCloseSuggestions}
                        className="text-stone-400 hover:text-amber-100 text-xs bg-stone-800/40 px-2 py-1 rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {moveSuggestions.slice(0, 4).map((suggestion, index) => (
                        <div key={index} className={`p-2 rounded-lg text-xs transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50' : 'bg-stone-800/30 hover:bg-stone-700/40'
                        }`}>
                          {index === 0 && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-emerald-300 bg-emerald-600/20 px-1 py-0.5 rounded font-bold">✨ BEST</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-amber-100 font-bold text-xs">
                              {indexToNotation(suggestion.from.x, suggestion.from.y)} → {indexToNotation(suggestion.to.x, suggestion.to.y)}
                            </span>
                            {suggestion.score && (
                              <span className="text-amber-400 font-bold text-xs">
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
              <div className="bg-gradient-to-br from-stone-900/60 to-zinc-900/60 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-600/30 shadow-2xl flex-1">
                <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📜</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Move History</span>
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {moveHistory.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2 opacity-50">⏳</div>
                      <p className="text-stone-400 italic text-sm">The battle begins...</p>
                      <p className="text-stone-500 text-xs mt-1">Make the first strike!</p>
                    </div>
                  ) : (
                    moveHistory.slice().reverse().map((move, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/30 hover:bg-stone-700/40 transition-all duration-200">
                        <span className="text-stone-400 font-mono text-xs min-w-[1.5rem] bg-stone-800/40 px-1 py-0.5 rounded text-center">
                          {moveHistory.length - index}
                        </span>
                        <span className="text-amber-100 font-mono font-bold text-sm">{move}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Chess Board (70%) */}
            <div className="lg:col-span-7 flex justify-center items-start">
              <div className="relative">
                {/* Royal glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/25 via-yellow-600/15 to-amber-700/25 blur-3xl rounded-3xl transform scale-110 animate-pulse"></div>
                
                {/* Board container */}
                <div className="relative bg-gradient-to-br from-stone-800/60 to-zinc-900/60 backdrop-blur-xl p-4 md:p-6 rounded-3xl border-2 border-amber-600/30 shadow-2xl">
                  <ChessBoard 
                    onSquareClick={handleSquareClick} 
                    highlightedSuggestion={highlightedSuggestion}
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