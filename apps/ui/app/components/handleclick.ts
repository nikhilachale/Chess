// useHandleClick.ts

import { useChessStore } from "../store/chessStore";


export const useHandleClick = () => {
  const {
    board, 
    canMove, 
    selectedPiece,
    playerId, 
    currentTurn, 
    socket, 
    roomName,
    setSelectedPiece, 
    setCanMove
  } = useChessStore();

  const handleSquareClick = (row: number, col: number) => {
    if (!playerId || currentTurn !== playerId) return;

    // If a piece is already selected, try to move it
    if (selectedPiece) {
      if (canMove.some(move => move.x === row && move.y === col) && socket) {
        socket.send(JSON.stringify({
          type: "make_move",
          roomName,
          playerId,
          from: selectedPiece,
          to: { x: row, y: col }
        }));
        setSelectedPiece(null);
        setCanMove([]);
        return;
      }
      // If clicked on invalid square, deselect
      setSelectedPiece(null);
      setCanMove([]);
    }

    // If clicking on a piece, select it and get possible moves
    if (board[row] && board[row][col] && socket) {
      socket.send(JSON.stringify({
        type: "can_move",
        roomName,
        playerId,
        index: { row, col }
      }));
      setSelectedPiece({ x: row, y: col });
    }
  };

  return { handleSquareClick };
};