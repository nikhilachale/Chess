"use client";
import { ReactNode } from "react";

interface Props {
  isBlack: boolean;
  isSelected: boolean;
   check: "white" | "black" | null;
  isAvailableMove: boolean;
  isSuggestionFrom?: boolean;
  isSuggestionTo?: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export default function ChessSquare({ 
  isBlack, 
  check, 
  isSelected, 
  isAvailableMove, 
  isSuggestionFrom = false,
  isSuggestionTo = false,
  onClick, 
  children 
}: Props) {
  
  // Determine background color with proper priority
  let bgColor = "";
  let borderStyle = "";
  
  if (isSuggestionFrom) {
    bgColor = "bg-blue-400/80";
    borderStyle = "border-4 border-blue-600 shadow-lg shadow-blue-500/50";
  } else if (isSuggestionTo) {
    bgColor = "bg-purple-400/80";
    borderStyle = "border-4 border-purple-600 shadow-lg shadow-purple-500/50";
  } else if (isSelected) {
    bgColor = isBlack ? "bg-slate-800" : "bg-white";
    borderStyle = "ring-4 ring-yellow-400";
  } else if (isAvailableMove) {
    bgColor = isBlack ? "bg-slate-800" : "bg-white";
    borderStyle = "ring-4 ring-green-400";
  } else if (check && (check === "white" ? !isBlack : isBlack)) {
    bgColor = isBlack ? "bg-slate-800" : "bg-white";
    borderStyle = "ring-4 ring-red-500";
  } else {
    bgColor = isBlack ? "bg-slate-800" : "bg-white";
  }

  return (
    <div
      onClick={onClick}
      className={`
        w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
        flex items-center justify-center cursor-pointer
        transition-all duration-200
        ${bgColor}
        ${borderStyle}
        ${isSuggestionFrom || isSuggestionTo ? 'animate-pulse' : ''}
      `}
    >
      {children}
    </div>
  );
}