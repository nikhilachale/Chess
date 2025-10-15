import { ChessGame } from './Game.js';

interface Move {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: string;
  score?: number;
}

export class MoveEvaluator {
  private game: ChessGame;

  constructor(game: ChessGame) {
    this.game = game;
  }

  // Get top N move suggestions for a player
  public getBestMoves(player: 'white' | 'black', topN: number = 3, depth: number = 2): Move[] {
    const allMoves: Move[] = this.generateAllMoves(player);
    allMoves.forEach(move => {
      move.score = this.evaluateMove(move, player, depth);
    });
    allMoves.sort((a, b) => (b.score || 0) - (a.score || 0));
    return allMoves.slice(0, topN);
  }

  private generateAllMoves(player: 'white' | 'black'): Move[] {
    const moves: Move[] = [];
    const board = this.game.state.board;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y]?.[x];
        if (!piece) continue;

        const isWhitePiece = piece === piece.toUpperCase();
        if ((player === 'white' && !isWhitePiece) || (player === 'black' && isWhitePiece)) continue;

        const pieceMoves = this.game.getMoves(x, y, player);
        pieceMoves.forEach((to: { x: number; y: number }) => {
          moves.push({ from: { x, y }, to, piece });
        });
      }
    }
    return moves;
  }

  private evaluateMove(move: Move, player: 'white' | 'black', depth: number): number {
    let score = this.getImmediateScore(move, player);

    if (depth > 1) {
      const originalBoard = JSON.parse(JSON.stringify(this.game.state.board));

      this.game.makeMove(move.from, move.to, player);

      const opponent = player === 'white' ? 'black' : 'white';
      const opponentMoves = this.generateAllMoves(opponent);

      if (opponentMoves.length) {
        const opponentBest = Math.max(...opponentMoves.map(m => this.getImmediateScore(m, opponent)));
        score -= opponentBest * 0.9;
      }

      if (depth === 3) {
        const nextMoves = this.generateAllMoves(player);
        if (nextMoves.length) {
          const bestNext = Math.max(...nextMoves.map(m => this.getImmediateScore(m, player)));
          score += bestNext * 0.5;
        }
      }

      this.game.state.board = originalBoard;
    }

    return score;
  }

  private getImmediateScore(move: Move, player: 'white' | 'black'): number {
    const board = this.game.state.board;
    const targetPiece = board[move.to.y]?.[move.to.x];
    let score = 0;

    // Material gain
    if (targetPiece && targetPiece !== '') {
      switch (targetPiece.toLowerCase()) {
        case 'p': score += 1; break;
        case 'n':
        case 'b': score += 3; break;
        case 'r': score += 5; break;
        case 'q': score += 9; break;
      }
    }

    // Promotion bonus
    if (move.piece.toLowerCase() === 'p' && (move.to.y === 0 || move.to.y === 7)) {
      score += 8;
    }

    // Check bonus (if implemented in ChessGame)
    if (typeof (this.game as any).isCheckAfterMove === 'function') {
      if ((this.game as any).isCheckAfterMove(move.from, move.to, player)) {
        score += 1.5;
      }
    }

    // Center control bonus
    const centerSquares = [
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 4 }
    ];
    if (centerSquares.some(c => c.x === move.to.x && c.y === move.to.y)) {
      score += 0.5;
    }

    return score;
  }
}