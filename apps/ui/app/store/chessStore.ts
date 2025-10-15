"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Player {
  username: string;
  color: "white" | "black" | undefined;
}

interface Move {
  fromPlayer: string;
  piece: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  captured?: string;
}

interface ChessState {
  socket: WebSocket | null;
  roomName: string;
  player: Player | null;
  playerId: "white" | "black" | null;
  currentTurn: "white" | "black" | null;
  username: string;
  board: string[][];
  canMove: { x: number; y: number }[];
  selectedPiece: { x: number; y: number } | null;
  lastMove: Move[];
  check: "white" | "black" | null;

  setSocket: (socket: WebSocket | null) => void;
  setRoomName: (roomName: string) => void;
  setPlayer: (player: Player) => void;
  setPlayerId: (id: "white" | "black") => void;
  setCurrentTurn: (turn: "white" | "black") => void;
  setUsername: (name: string) => void;
  setBoard: (board: string[][]) => void;
  setCanMove: (moves: { x: number; y: number }[]) => void;
  setSelectedPiece: (piece: { x: number; y: number } | null) => void;
  addLastMove: (move: Move) => void;
  setCheck: (check: "white" | "black" | null) => void;

//   connectSocket: () => void;
}

const initialBoard = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"]
];

export const useChessStore = create<ChessState>()(
  persist(
    (set) => ({
      socket: null,
      roomName: "",
      player: null,
      playerId: null,
      currentTurn: "white",
      username: "",
      board: initialBoard,
      canMove: [],
      selectedPiece: null,
      lastMove: [],
      check: null,

      setSocket: (socket) => set({ socket }),
      setRoomName: (roomName) => set({ roomName }),
      setPlayer: (player) => set({ player }),
      setPlayerId: (playerId) => set({ playerId }),
      setCurrentTurn: (turn) => set({ currentTurn: turn }),
      setUsername: (username) => set({ username }),
      setBoard: (board) => set({ board }),
      setCanMove: (moves) => set({ canMove: moves }),
      setSelectedPiece: (piece) => set({ selectedPiece: piece }),
      addLastMove: (move) =>
        set((state) => ({ lastMove: [...state.lastMove, move].slice(-10) })),
      setCheck: (check) => set({ check }),

    //   connectSocket: () => {
    //     if (get().socket) return; // already connected

    //     const ws = new WebSocket("ws://localhost:8080");
    //     set({ socket: ws });

    //     ws.onopen = () => {
    //       console.log("WebSocket connected");
    //       const roomName = get().roomName;
    //       const username = get().player?.username || get().username;
    //       const playerId = get().playerId || "white";

    //       if (roomName && username) {
    //         ws.send(JSON.stringify({ type: "join_room", roomName, playerId }));
    //       }
    //     };

    //     ws.onmessage = (event) => {
    //       const data = JSON.parse(event.data);
    //         console.log("Received CRFV :", data);
    //       switch (data.type) {
    //         case "room_created":
    //         case "room_joined":
    //           set({ roomName: data.roomName, playerId: data.id || "white", currentTurn: data.turn || "white" });
    //           set((state) => ({
    //             player: { ...state.player!, username: data.id, color: data.id || "white" },
    //           }));
    //           break;
    //         case "available_moves":
    //           set({ canMove: data.moves });
    //           break;
    //         case "move_made":
    //           set({ board: data.board, canMove: [], selectedPiece: null, currentTurn: data.turn, check: data.check });
    //           get().addLastMove({
    //             fromPlayer: data.fromPlayer,
    //             piece: data.piece,
    //             from: data.from,
    //             to: data.to,
    //             captured: data.captured,
    //           });
    //           if (data.check) alert(`${data.turn === "white" ? "Black" : "White"} is in check!`);
    //           break;
    //       }
    //     };

    //     ws.onclose = () => {
    //       console.log("WebSocket disconnected. Attempting reconnect in 2s...");
    //       set({ socket: null });
    //       setTimeout(() => get().connectSocket(), 2000);
    //     };
    //   }
    }),
    {
      name: "chess-storage",
      partialize: (state) => ({
        roomName: state.roomName,
        player: state.player,
        playerId: state.playerId,
        currentTurn: state.currentTurn,
        username: state.username,
      }),
    }
  )
);