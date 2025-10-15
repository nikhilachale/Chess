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
    username,
    setUsername,
    player,
    setPlayer,
    playerId,
    setPlayerId,
    currentTurn,
    setCurrentTurn,
    board,
    setBoard,
    canMove,
    setCanMove,
    check,
    setCheck
  } = useChessStore();

  const { handleSquareClick } = useHandleClick();
  
  // Local state
  const [roomChoice, setRoomChoice] = useState<'create' | 'join' | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState("");
  const [moved, setMoved] = useState<{ x: number; y: number } | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

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
  }, [socket, setSocket, setRoomName, setPlayerId, setCurrentTurn, setBoard, setCanMove, setCheck, board]);

  // Handle create room
  const handleCreateRoom = () => {
    if (!socket || !player?.username) return;
    
    setRoomChoice('create');
    socket.send(JSON.stringify({
      type: "create_room",
      username: player.username
    }));
  };
function indexToNotation(x: number, y: number) {
  const files = ['a','b','c','d','e','f','g','h'];
  return `${files[x]}${8 - y}`; // y=0 → row 8, y=7 → row 1
}
  function moveToNotation(from: {x:number, y:number}, to: {x:number, y:number}) {
  return `${indexToNotation(from.x, from.y)}${indexToNotation(to.x, to.y)}`;
}
  // Handle join room button click (show popup)
  const handleJoinRoomClick = () => {
    setShowJoinPopup(true);
  };

  // Handle actual join room with entered room name
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
  const handleCancelJoinRoom = () => {
    setShowJoinPopup(false);
    setJoinRoomName("");
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
          <ChessBoard onSquareClick={handleSquareClick} />
        </div>
      </div>

      
    </div>
  </div>
</div>
  );
}