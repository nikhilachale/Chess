"use client";

import ChessBoard from "@/app/components/ChessBoard";
import { useHandleClick } from "@/app/components/handleclick";
import RoomOptions from "@/app/components/RoomOptions";
import { useChessStore } from "@/app/store/chessStore";
import { useEffect, useState } from "react";


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
  const indexToNotation = (x: number, y: number) => {
    const files = ['a','b','c','d','e','f','g','h'];
    return `${files[x]}${8 - y}`; // y=0 → row 8, y=7 → row 1
  };


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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium">Loading room...</p>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-700 via-slate-100 to-slate-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Show chess board once game has started
  return (
 <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-100 to-slate-700 p-4 md:p-8">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Room: <span className="text-slate-900">{roomName}</span>
      </h1>
      {check && (
        <div className="bg-red-600 text-white px-6 py-2 rounded-2xl inline-block animate-pulse">
          <span className="font-bold text-lg">⚠️ {check.toUpperCase()} IS IN CHECK!</span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

    {/* Left Sidebar */}
<div className="lg:col-span-1 space-y-4">
  {/* Player Info */}
  <div className="bg-slate-700/30 w-80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/40 shadow-lg">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
      <span className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></span>
      Player Info
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-300">Username:</span>
        <span className="text-amber-400 font-semibold">{player?.username}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-300">Playing as:</span>
        <span className={`font-bold px-3 py-1 rounded-full text-sm ${
          playerId === 'white' ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 text-white'
        }`}>{playerId?.toUpperCase() || 'WAITING...'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-300">Current Turn:</span>
        <span className={`font-bold px-3 py-1 rounded-full text-sm ${
          currentTurn === 'white' ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 text-white'
        }`}>{currentTurn?.toUpperCase()}</span>
      </div>
    </div>
  </div>

  {/* AI Suggestions */}
  <div className="bg-slate-700/20 w-80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/40 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-slate-800 flex items-center">
        <span className="text-2xl mr-2">🤖</span> AI Assistant
      </h3>
    </div>
    
    <button
      onClick={handleSuggestMove}
      disabled={currentTurn !== playerId || !socket}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
        currentTurn === playerId && socket
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
      }`}
    >
      💡 Suggest Move
    </button>

    {showSuggestions && (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Suggestions:</span>
          <button
            onClick={handleCloseSuggestions}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            ✕ Close
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {moveSuggestions.slice(0, 5).map((suggestion, index) => (
            <div key={index} className={`text-xs p-2 rounded text-gray-200 ${
              index === 0 ? 'bg-blue-600/50 border border-blue-400' : 'bg-slate-600/30'
            }`}>
              {index === 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-blue-300">✨ BEST</span>
                </div>
              )}
              <span className="font-mono">
                {indexToNotation(suggestion.from.x, suggestion.from.y)} → {indexToNotation(suggestion.to.x, suggestion.to.y)}
              </span>
              {suggestion.score && (
                <span className="ml-2 text-amber-400">
                  ({suggestion.score.toFixed(1)})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Move History */}
<div className="bg-slate-700/20 w-80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/40 shadow-lg">
  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
    <span className="text-2xl mr-2">📜</span> Move History
  </h3>
  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 flex flex-col-reverse">
    {moveHistory.map((move, index) => (
      <div key={index} className="text-gray-200 text-sm">
        <span className="text-slate-800">{moveHistory.length - index}.</span> {move}
      </div>
    ))}
  </div>
</div>
</div>

      {/* Chess Board */}
      <div className="lg:col-span-4 flex justify-center">
        <div className="bg-amber-100/10 backdrop-blur-md p-6 rounded-3xl border-4 shadow-xl">
          <ChessBoard 
            onSquareClick={handleSquareClick} 
            highlightedSuggestion={highlightedSuggestion}
          />
        </div>
      </div>

      
    </div>
  </div>
</div>
  );
}