"use client";
import { useState, useEffect } from "react";

function RoomPageContent() {
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [playerCount, setPlayerCount] = useState(42);
  const [openRooms, setOpenRooms] = useState(8);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setOpenRooms(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    // Simulate room creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newRoomCode = `ROYAL${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    window.location.href = `/room/${newRoomCode}`;
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    setIsJoining(true);
    // Simulate joining room
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.href = `/room/${roomCode.trim()}`;
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Enhanced chess-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/25 via-yellow-800/20 to-amber-900/25"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,179,140,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,69,19,0.15),transparent_50%)]"></div>
      </div>

      {/* Chess board pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-conic-gradient(#8b5a2b 0% 25%, transparent 0% 50%) 50% / 60px 60px`
        }}></div>
      </div>

      {/* Enhanced floating chess pieces with more variety */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-12 animate-float text-amber-200 hover:opacity-20 transition-opacity duration-500">♛</div>
        <div className="absolute top-60 right-20 text-5xl opacity-8 animate-float-delay text-stone-300 hover:opacity-16 transition-opacity duration-500">♜</div>
        <div className="absolute bottom-32 left-1/4 text-7xl opacity-10 animate-float-slow text-amber-300 hover:opacity-18 transition-opacity duration-500">♞</div>
        <div className="absolute bottom-20 right-1/3 text-8xl opacity-6 animate-float text-stone-200 hover:opacity-14 transition-opacity duration-500">♝</div>
        <div className="absolute top-1/3 left-1/2 text-4xl opacity-8 animate-float-delay text-yellow-200 hover:opacity-16 transition-opacity duration-500">♚</div>
        <div className="absolute top-80 left-1/4 text-5xl opacity-7 animate-float-slow text-amber-400 hover:opacity-15 transition-opacity duration-500">♟</div>
        <div className="absolute bottom-60 right-10 text-6xl opacity-9 animate-float text-stone-300 hover:opacity-17 transition-opacity duration-500">♔</div>
      </div>

      {/* Enhanced golden orbs with sparkle effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-amber-500/25 to-yellow-600/15 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-700/20 to-orange-800/15 rounded-full blur-3xl animate-pulse-slower"></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-yellow-500/15 to-amber-600/15 rounded-full blur-2xl animate-float-orb"></div>
      
      {/* Twinkling stars */}
      <div className="absolute top-40 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-twinkle shadow-lg shadow-amber-400/50"></div>
      <div className="absolute bottom-60 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-twinkle-delay shadow-lg shadow-yellow-300/50"></div>
      <div className="absolute top-2/3 left-3/4 w-2 h-2 bg-amber-300 rounded-full animate-twinkle-slow shadow-lg shadow-amber-300/50"></div>

      {/* Royal navbar with enhanced styling */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center text-amber-200 font-semibold">
        <div className="flex items-center gap-4 text-2xl font-bold tracking-wide">
          <span className="text-3xl animate-float-gentle">♔</span>
          ROYAL CHESS
          <span className="text-sm bg-amber-600/20 px-3 py-1 rounded-full border border-amber-600/40">LOBBY</span>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="group px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 text-zinc-900 font-bold"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg group-hover:animate-bounce-subtle">🏰</span>
            Return to Court
          </span>
        </button>
      </nav>

      {/* Enhanced main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="text-center space-y-12 max-w-4xl animate-fade-in-up">
          
          {/* Enhanced royal header */}
          <div className="space-y-6">
            <div className="relative">
              <div className="text-8xl mb-8 animate-float-gentle">♔</div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-2xl"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-stone-100 leading-tight">
              Welcome to the <br/>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent animate-gradient">
                Royal Chess Chambers
              </span>
            </h2>
            <p className="text-stone-300 text-xl leading-relaxed max-w-2xl mx-auto">
              Enter the sacred halls where chess masters gather. Create your own Game Room or join an existing battle of minds.
            </p>
          </div>

          {/* Enhanced room actions with loading states */}
          <div className="bg-gradient-to-br from-stone-900/70 to-zinc-900/70 backdrop-blur-xl rounded-3xl p-10 border-2 border-amber-600/40 shadow-2xl">
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-100 mb-3 flex items-center justify-center gap-3">
                  <span className="text-4xl">🏰</span>
                  Choose Your Path
                  <span className="text-4xl">⚔️</span>
                </h3>
                <p className="text-stone-400 text-lg">Begin your chess journey in the royal courts</p>
              </div>
              
              {/* Room code input with enhanced styling */}
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter sacred chamber code..."
                    className="w-full px-8 py-5 bg-stone-800/60 backdrop-blur-xl border-2 border-amber-700/50 rounded-2xl text-amber-100 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all duration-300 text-xl font-semibold text-center tracking-wide"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    disabled={isCreating || isJoining}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Character counter */}
                  <div className="absolute -bottom-6 right-4 text-stone-500 text-sm">
                    {roomCode.length}/8
                  </div>
                </div>

                {/* Enhanced action buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={handleCreateRoom}
                    disabled={isCreating || isJoining}
                    className="group relative px-8 py-6 bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 backdrop-blur-xl text-stone-100 rounded-2xl font-bold transition-all duration-300 border-2 border-stone-600/50 hover:border-stone-500/60 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center justify-center gap-3 text-lg">
                      {isCreating ? (
                        <>
                          <div className="animate-spin w-6 h-6 border-2 border-stone-300 border-t-transparent rounded-full"></div>
                          Creating Chamber...
                        </>
                      ) : (
                        <>
                          <span className="text-2xl group-hover:animate-bounce-subtle">🏰</span>
                          Create New Chamber
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <button 
                    onClick={handleJoinRoom}
                    disabled={!roomCode.trim() || isCreating || isJoining}
                    className="group relative px-8 py-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-600 text-zinc-900 rounded-2xl font-bold disabled:from-stone-600 disabled:to-stone-700 disabled:text-stone-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 border-2 border-amber-400/50 hover:border-amber-300/60 disabled:transform-none disabled:shadow-none"
                  >
                    <span className="flex items-center justify-center gap-3 text-lg">
                      {isJoining ? (
                        <>
                          <div className="animate-spin w-6 h-6 border-2 border-zinc-800 border-t-transparent rounded-full"></div>
                          Joining Battle...
                        </>
                      ) : (
                        <>
                          <span className="text-2xl group-hover:animate-bounce-subtle">⚔️</span>
                          Join Sacred Battle
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>

              {/* Quick join options */}
              <div className="border-t border-amber-700/30 pt-6">
                <p className="text-stone-400 text-sm mb-4 text-center">Quick join options:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['ROYAL001', 'MASTER1', 'KNIGHT7', 'QUEEN3'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setRoomCode(code)}
                      className="px-4 py-2 bg-stone-800/40 hover:bg-amber-600/20 text-stone-300 hover:text-amber-200 rounded-lg text-sm font-mono transition-colors duration-300 border border-stone-600/30 hover:border-amber-600/40"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-stone-800/40 backdrop-blur-xl rounded-2xl p-6 border border-amber-600/30 shadow-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-amber-400 font-bold text-lg">{playerCount}</div>
              <div className="text-stone-400 text-sm">Active Players</div>
            </div>
            <div className="bg-stone-800/40 backdrop-blur-xl rounded-2xl p-6 border border-amber-600/30 shadow-lg text-center">
              <div className="text-3xl mb-2">🏰</div>
              <div className="text-amber-400 font-bold text-lg">{openRooms}</div>
              <div className="text-stone-400 text-sm">Open Chambers</div>
            </div>
            <div className="bg-stone-800/40 backdrop-blur-xl rounded-2xl p-6 border border-amber-600/30 shadow-lg text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-amber-400 font-bold text-lg">Ready</div>
              <div className="text-stone-400 text-sm">Server Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (

      <RoomPageContent />

  );
}
