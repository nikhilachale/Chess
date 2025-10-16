"use client";

import { useChessStore } from "../store/chessStore";
import ChessSquare from "./ChessSquare";
import PieceIcon from "./PieceIcon";


export default function ChessBoard({ 
  onSquareClick, 
  highlightedSuggestion 
}: { 
  onSquareClick: (row: number, col: number) => void;
  highlightedSuggestion?: {from: {x: number, y: number}, to: {x: number, y: number}} | null;
}) {
   const { board, check, canMove, selectedPiece } = useChessStore();
  
  return (
   <div className="grid grid-cols-8 border-4 border-gray-900  overflow-hidden shadow-lg">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isBlack = (rowIndex + colIndex) % 2 === 1;
          const isSelected = selectedPiece?.x === rowIndex && selectedPiece?.y === colIndex;
          const isAvailableMove = canMove.some(move => move.x === rowIndex && move.y === colIndex);
          const isSuggestionFrom = highlightedSuggestion?.from.x === rowIndex && highlightedSuggestion?.from.y === colIndex;
          const isSuggestionTo = highlightedSuggestion?.to.x === rowIndex && highlightedSuggestion?.to.y === colIndex;

          return (
            <ChessSquare
              key={`${rowIndex}-${colIndex}`}
              isBlack={isBlack}
              isSelected={isSelected}
              isAvailableMove={isAvailableMove}
              isSuggestionFrom={isSuggestionFrom}
              isSuggestionTo={isSuggestionTo}
              check={check}
              onClick={() => onSquareClick(rowIndex, colIndex)}
            >
              {piece && <PieceIcon piece={piece} />}
            </ChessSquare>
          );
        })
      )}
    </div>
  );
}