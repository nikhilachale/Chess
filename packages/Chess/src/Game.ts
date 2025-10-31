// game.ts
import crypto from "crypto";

const blackPieces = ['p', 'r', 'n', 'b', 'q', 'k'];
const whitePieces = ['P', 'R', 'N', 'B', 'Q', 'K'];

export interface Move {
  x: number;
  y: number;
}

export interface LastMove {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: string;
}

export interface GameState {
  roomId: string;
  players: string[];
  board: string[][];
  turn: string;
  kingMoved: { white: boolean; black: boolean };
  rookMoved: { white: { left: boolean; right: boolean }; black: { left: boolean; right: boolean } };
  lastMove?: LastMove;
  moveCount: number; // Track total moves made in the game
}

export class ChessGame {
  state: GameState;

  constructor(playerId: string) {
    this.state = {
      roomId: ChessGame.generateRoomCode(),
      players: [playerId],
      board: ChessGame.createInitialBoard(),
      turn: playerId,
      kingMoved: { white: false, black: false },
      rookMoved: { white: { left: false, right: false }, black: { left: false, right: false } },
      moveCount: 0
    };
  }

  static generateRoomCode(): string {
    return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
  }

  static createInitialBoard(): string[][] {
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ];
  }

  private isWhite(piece: string): boolean {
    return whitePieces.includes(piece);
  }



  // ================== MOVE GENERATORS ==================

  private movesOfRook(x: number, y: number, isWhite: boolean): Move[] {
    const moves: Move[] = [];
    const directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    for (const { dx, dy } of directions) {
      for (let step = 1; step < 8; step++) {
        const nx = x + dx * step, ny = y + dy * step;
        if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
        const piece = this.state.board[nx]?.[ny];
        if (piece === "") {
          moves.push({ x: nx, y: ny });
        } else {
          if (piece && ((isWhite && blackPieces.includes(piece)) || (!isWhite && whitePieces.includes(piece)))) {
            moves.push({ x: nx, y: ny });
          }
          break;
        }
      }
    }
    return moves;
  }

  private movesOfBishop(x: number, y: number, isWhite: boolean): Move[] {
    const moves: Move[] = [];
    const directions = [
      { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];
    for (const { dx, dy } of directions) {
      for (let step = 1; step < 8; step++) {
        const nx = x + dx * step, ny = y + dy * step;
        if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
        const piece = this.state.board[nx]?.[ny];
        if (piece === "") {
          moves.push({ x: nx, y: ny });
        } else {
          if ((isWhite && blackPieces.includes(piece ?? "")) || (!isWhite && whitePieces.includes(piece ?? ""))) {
            moves.push({ x: nx, y: ny });
          }
          break;
        }
      }
    }
    return moves;
  }

  private movesOfKnight(x: number, y: number, isWhite: boolean): Move[] {
    const moves: Move[] = [];
    const jumps = [
      { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, { dx: -2, dy: 1 }, { dx: -2, dy: -1 },
      { dx: 1, dy: 2 }, { dx: 1, dy: -2 }, { dx: -1, dy: 2 }, { dx: -1, dy: -2 }
    ];
    for (const { dx, dy } of jumps) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue;
      const piece = this.state.board[nx]?.[ny];
      if (piece === "" || (isWhite && blackPieces.includes(piece ?? "")) || (!isWhite && whitePieces.includes(piece ?? ""))) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }

  private movesOfQueen(x: number, y: number, isWhite: boolean): Move[] {
    return [
      ...this.movesOfRook(x, y, isWhite),
      ...this.movesOfBishop(x, y, isWhite),
    ];
  }

  private movesOfKing(x: number, y: number, isWhite: boolean): Move[] {
    const moves: Move[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue;
        const piece = this.state.board[nx]?.[ny];
        if (piece === "" || (isWhite && blackPieces.includes(piece ?? "")) || (!isWhite && whitePieces.includes(piece ?? ""))) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    // Castling
    const row = isWhite ? 7 : 0;
    if (!this.state.kingMoved[isWhite ? "white" : "black"]) {
      // king side
      if (!this.state.rookMoved[isWhite ? "white" : "black"].right &&
        this.state.board[row]?.[5] === "" &&
        this.state.board[row]?.[6] === "") {
        moves.push({ x: row, y: 6 });
      }
      // queen side
      if (!this.state.rookMoved[isWhite ? "white" : "black"].left &&
        this.state.board[row]?.[1] === "" &&
        this.state.board[row]?.[2] === "" &&
        this.state.board[row]?.[3] === "") {
        moves.push({ x: row, y: 2 });
      }
    }
    return moves;
  }

  private movesOfPawn(x: number, y: number, isWhite: boolean): Move[] {
    const moves: Move[] = [];
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const enemy = isWhite ? blackPieces : whitePieces;

    // forward
    if (this.state.board[x + dir]?.[y] === "") {
      moves.push({ x: x + dir, y });
      if (x === startRow && this.state.board[x + 2 * dir]?.[y] === "") {
        moves.push({ x: x + 2 * dir, y });
      }
    }
    // captures
    if (y > 0 && enemy.includes(this.state.board[x + dir]?.[y - 1] ?? "")) {
      moves.push({ x: x + dir, y: y - 1 });
    }
    if (y < 7 && enemy.includes(this.state.board[x + dir]?.[y + 1] ?? "")) {
      moves.push({ x: x + dir, y: y + 1 });
    }

    // En passant
    if (this.state.lastMove?.piece.toLowerCase() === "p") {
      const last = this.state.lastMove;
      if (last.to.x === x && Math.abs(last.to.y - y) === 1 && Math.abs(last.from.x - last.to.x) === 2) {
        moves.push({ x: x + dir, y: last.to.y });
      }
    }

    return moves;
  }


  private isKingInCheck(playerId: string): boolean {
    const board = this.state.board;
    const isWhite = playerId === "white";

    // 1. Find king position
    let kingX = -1, kingY = -1;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((board[i]?.[j] ?? "") === (isWhite ? "K" : "k")) {
          kingX = i; kingY = j;
        }
      }
    }
    if (kingX === -1) return false; // no king found (shouldn’t happen)

    // 2. Pawn attacks
    const pawnDir = isWhite ? -1 : 1;
    const enemyPawn = isWhite ? "p" : "P";
    if (board[kingX + pawnDir]?.[kingY - 1] === enemyPawn) return true;
    if (board[kingX + pawnDir]?.[kingY + 1] === enemyPawn) return true;

    // 3. Knight attacks
    const knightMoves = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];
    const enemyKnight = isWhite ? "n" : "N";
    for (const move of knightMoves) {
      // Explicit destructure and check bounds
      if (!Array.isArray(move) || move.length !== 2) continue;
      const [dx, dy] = move;
      if (typeof dx !== "number" || typeof dy !== "number") continue;
      const nx = kingX + dx;
      const ny = kingY + dy;
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx]?.[ny] === enemyKnight) {
        return true;
      }
    }

    // 4. Rook/Queen (straight lines)
    const rookDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const enemyRook = isWhite ? "r" : "R";
    const enemyQueen = isWhite ? "q" : "Q";
    for (const [dx, dy] of rookDirs) {
      let x = kingX, y = kingY;
      while (true) {
        if (typeof dx !== "number" || typeof dy !== "number") continue;
        x += dx; y += dy;
        if (x < 0 || x > 7 || y < 0 || y > 7) break;
        const piece = board[x]?.[y] ?? null;
        if (piece === "") continue;
        if (piece === enemyRook || piece === enemyQueen) return true;
        break; // blocked
      }
    }

    // 5. Bishop/Queen (diagonals)
    const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const enemyBishop = isWhite ? "b" : "B";
    for (const [dx, dy] of bishopDirs) {
      let x = kingX, y = kingY;
      while (true) {
        if (typeof dx !== "number" || typeof dy !== "number") continue;
        x += dx; y += dy;
        if (x < 0 || x > 7 || y < 0 || y > 7) break;
        const piece = board[x]?.[y] ?? null;
        if (piece === "") continue;
        if (piece === enemyBishop || piece === enemyQueen) return true;
        break;
      }
    }

    // 6. Enemy King
    const kingMoves = [-1, 0, 1];
    const enemyKing = isWhite ? "k" : "K";
    for (const dx of kingMoves) {
      for (const dy of kingMoves) {
        if (dx === 0 && dy === 0) continue;
        if (board[kingX + dx]?.[kingY + dy] === enemyKing) return true;
      }
    }

    return false;
  }



  private isCheckmate(playerId: string): boolean {
    if (!this.isKingInCheck(playerId)) return false;

    // Try every move for current player
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.state.board[x]?.[y] ?? "";
        if (!piece) continue;
        const isWhite = this.isWhite(piece);
        if ((playerId === "white" && !isWhite) || (playerId === "black" && isWhite)) continue;

        const moves = this.getMoves(x, y, playerId);
        if (moves.length > 0) return false; // Found a saving move
      }
    }
    return true; // No moves + king is in check
  }

  private isStalemate(playerId: string): boolean {
    if (this.isKingInCheck(playerId)) return false;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.state.board[x]?.[y] ?? "";
        if (!piece) continue;
        const isWhite = this.isWhite(piece);
        if ((playerId === "white" && !isWhite) || (playerId === "black" && isWhite)) continue;

        const moves = this.getMoves(x, y, playerId);
        if (moves.length > 0) return false; // Found a legal move
      }
    }
    return true; // No moves + not in check
  }

  private isInsufficientMaterial(): boolean {
  const pieces: string[] = [];
  for (let row of this.state.board) {
    for (let cell of row) {
      if (cell !== "" && cell.toLowerCase() !== "k") {
        pieces.push(cell);
      }
    }
  }

  if (pieces.length === 0) return true; // King vs King
  if (pieces.length === 1 && pieces[0]) {
    const p = pieces[0].toLowerCase();
    return p === "b" || p === "n"; // King+Bishop or King+Knight
  }
  if (pieces.length === 2) {
    const [p1, p2] = pieces.map(p => p.toLowerCase());
    if (p1 === "b" && p2 === "b") {
      // Need to check bishop colors, but basic case = same color bishops
      return true;
    }
  }

  return false;
}

  // ================== API ==================

  /**
   * Public check method for external consumers (AI/evaluators).
   * Returns true if the given player's king is currently in check.
   */
  public isInCheck(playerId: 'white' | 'black'): boolean {
    return this.isKingInCheck(playerId);
  }

  getMoves(x: number, y: number, playerId: string): Move[] {
    if (x < 0 || x > 7 || y < 0 || y > 7) return [];
    const piece = this.state.board[x]?.[y] ?? "";
    if (!piece) return [];
    const isWhite = this.isWhite(piece);
    if ((playerId === "white" && !isWhite) || (playerId === "black" && isWhite)) return [];
    let pseudo: Move[] = [];
    switch (piece.toLowerCase()) {
      case "p": pseudo = this.movesOfPawn(x, y, isWhite); break;
      case "r": pseudo = this.movesOfRook(x, y, isWhite); break;
      case "n": pseudo = this.movesOfKnight(x, y, isWhite); break;
      case "b": pseudo = this.movesOfBishop(x, y, isWhite); break;
      case "q": pseudo = this.movesOfQueen(x, y, isWhite); break;
      case "k": pseudo = this.movesOfKing(x, y, isWhite); break;
      default: pseudo = [];
    }

    // Filter pseudo-legal moves by simulating each move and checking king safety
    const legal: Move[] = [];
    for (const m of pseudo) {
      // clone board
      const testBoard = this.state.board.map(r => [...r]);
      const tr = testBoard[m.x];
      const fr = testBoard[x];
      if (!tr || !fr) continue;
      // perform pseudo move
      tr[m.y] = piece;
      fr[y] = "";

      // swap board and test isKingInCheck
      const oldBoard = this.state.board;
      this.state.board = testBoard;
      const kingInCheck = this.isKingInCheck(playerId);
      this.state.board = oldBoard;

      if (!kingInCheck) legal.push(m);
    }

    return legal;
  }

  makeMove(from: Move, to: Move, playerId: string) {
    if (from.x < 0 || from.x > 7 || from.y < 0 || from.y > 7) throw new Error("Invalid from coordinates");
    if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7) throw new Error("Invalid to coordinates");

    const piece = this.state.board[from.x]?.[from.y];
    if (!piece) throw new Error("No piece at from position");

    const isWhite = this.isWhite(piece);

    // turn check
    if (this.state.turn !== playerId) throw new Error("Not your turn");

    const legal = this.getMoves(from.x, from.y, playerId);
    if (!legal.some(m => m.x === to.x && m.y === to.y)) {
      throw new Error("Illegal move");
    }



    // 3. Clone board to test the move
    const testBoard = this.state.board.map(row => [...row]);
    const toRow = testBoard[to.x];
    const testFromRow = testBoard[from.x];
    if (!toRow || !testFromRow) {
      throw new Error("Invalid board row for test move");
    }
    toRow[to.y] = piece;
    testFromRow[from.y] = "";

    // 4. Temporarily swap in test board
    const oldBoard = this.state.board;
    this.state.board = testBoard;

    const inCheck = this.isKingInCheck(playerId);
    this.state.board = oldBoard; // restore original

    if (inCheck) {
      throw new Error("Illegal move: king would be in check");
    }





    let capture: string | null = null;
    let promotion = false;
    let promotionPiece = "";
    let enPassantCapture = false;
    let castlingMove = false;

    // Castling
    if (piece.toLowerCase() === "k" && Math.abs(to.y - from.y) === 2) {
      castlingMove = true;
      const row = isWhite ? 7 : 0;
      const boardRow = this.state.board[row];
      if (!boardRow) throw new Error("Invalid castling row");

      if (to.y === 6) { // king side
        boardRow[5] = boardRow[7] ?? "";
        boardRow[7] = "";
      } else if (to.y === 2) { // queen side
        boardRow[3] = boardRow[0] ?? "";
        boardRow[0] = "";
      }
      this.state.kingMoved[isWhite ? "white" : "black"] = true;
    }

    // En Passant
    if (piece.toLowerCase() === "p" && this.state.lastMove?.piece.toLowerCase() === "p") {
      const last = this.state.lastMove;
      if (from.x === last.to.x && Math.abs(from.y - last.to.y) === 1) {
        if (to.y === last.to.y && to.x === from.x + (isWhite ? -1 : 1)) {
          const lastRow = this.state.board[last.to.x];
          if (!lastRow) throw new Error("Invalid en passant row");
          lastRow[last.to.y] = "";
          enPassantCapture = true;
          capture = isWhite ? "p" : "P";
        }
      }
    }
    // Move piece
    const targetRow = this.state.board[to.x];
    if (!targetRow) throw new Error("Invalid move: row does not exist");

    capture = targetRow[to.y] || capture;
    targetRow[to.y] = piece;

    const fromRow = this.state.board[from.x];
    if (!fromRow) throw new Error("Invalid move: from row does not exist");
    fromRow[from.y] = "";

    // Pawn promotion
    if (piece.toLowerCase() === "p") {
      const promotionRow = isWhite ? 0 : 7;
      if (to.x === promotionRow) {
        promotion = true;
        promotionPiece = isWhite ? "Q" : "q";
        targetRow[to.y] = promotionPiece;
      }
    }

    // Update flags
    if (piece.toLowerCase() === "k") this.state.kingMoved[isWhite ? "white" : "black"] = true;
    if (piece.toLowerCase() === "r") {
      if (from.y === 0) this.state.rookMoved[isWhite ? "white" : "black"].left = true;
      if (from.y === 7) this.state.rookMoved[isWhite ? "white" : "black"].right = true;
    }

    this.state.lastMove = { from, to, piece };
    this.state.turn = playerId === "white" ? "black" : "white";
    this.state.moveCount++; // Increment move count after each move
    // Check if opponent king is in check
    // After checking opponentInCheck
    const opponentId = this.state.turn;
    const opponentInCheck = this.isKingInCheck(opponentId);

    let gameOver: "checkmate" | "stalemate" | "insufficient_material" | null = null;
    let winner: "white" | "black" | null = null;

    if (this.isCheckmate(opponentId)) {
      gameOver = "checkmate";
      winner = playerId === "white" ? "white" : "black"; // the one who just moved
    } else if (this.isStalemate(opponentId)) {
      gameOver = "stalemate";
      winner = null; // draw
    }
    else if (this.isInsufficientMaterial()) {
      gameOver = "insufficient_material";
      winner = null; // draw
    }

    return {
      from, to, piece, capture, promotion, promotionPiece, enPassantCapture, castlingMove,
      board: this.state.board,
      turn: this.state.turn,
      check: opponentInCheck ? this.state.turn : null,
      gameOver,
      winner
    };
  }


  
  
}