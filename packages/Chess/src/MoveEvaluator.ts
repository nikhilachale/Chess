import { ChessGame } from './Game.js';
import weights from './weights.json' with { type: 'json' };

interface Move {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: string;
  score?: number;
}

export class MoveEvaluator {
  private game: ChessGame;
  private weights = weights;
  // Branching limit: limit how many child moves to explore at each node (move ordering)
  private branchingLimit = 8;
  // Piece-square tables for evaluation (mirrored for black)
  private pieceSquareTable: Record<string, number[]> = {
    // Pawn
    p: [
      0, 0, 0, 0, 0, 0, 0, 0,
      5, 10, 10, -20, -20, 10, 10, 5,
      5, -5, -10, 0, 0, -10, -5, 5,
      0, 0, 0, 20, 20, 0, 0, 0,
      5, 5, 10, 25, 25, 10, 5, 5,
      10, 10, 20, 30, 30, 20, 10, 10,
      50, 50, 50, 50, 50, 50, 50, 50,
      0, 0, 0, 0, 0, 0, 0, 0
    ],
    // Knight
    n: [
      -50, -40, -30, -30, -30, -30, -40, -50,
      -40, -20, 0, 0, 0, 0, -20, -40,
      -30, 0, 10, 15, 15, 10, 0, -30,
      -30, 5, 15, 20, 20, 15, 5, -30,
      -30, 0, 15, 20, 20, 15, 0, -30,
      -30, 5, 10, 15, 15, 10, 5, -30,
      -40, -20, 0, 5, 5, 0, -20, -40,
      -50, -40, -30, -30, -30, -30, -40, -50
    ],
    // Bishop
    b: [
      -20, -10, -10, -10, -10, -10, -10, -20,
      -10, 0, 0, 0, 0, 0, 0, -10,
      -10, 0, 5, 10, 10, 5, 0, -10,
      -10, 5, 5, 10, 10, 5, 5, -10,
      -10, 0, 10, 10, 10, 10, 0, -10,
      -10, 10, 10, 10, 10, 10, 10, -10,
      -10, 5, 0, 0, 0, 0, 5, -10,
      -20, -10, -10, -10, -10, -10, -10, -20
    ],
    // Rook
    r: [
      0, 0, 0, 0, 0, 0, 0, 0,
      5, 10, 10, 10, 10, 10, 10, 5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      0, 0, 0, 5, 5, 0, 0, 0
    ],
    // Queen
    q: [
      -20, -10, -10, -5, -5, -10, -10, -20,
      -10, 0, 0, 0, 0, 0, 0, -10,
      -10, 0, 5, 5, 5, 5, 0, -10,
      -5, 0, 5, 5, 5, 5, 0, -5,
      0, 0, 5, 5, 5, 5, 0, -5,
      -10, 5, 5, 5, 5, 5, 0, -10,
      -10, 0, 5, 0, 0, 0, 0, -10,
      -20, -10, -10, -5, -5, -10, -10, -20
    ]
    // King not included for now
  };

  constructor(game: ChessGame, branchingLimit = 8) {
    this.game = game;
    this.branchingLimit = branchingLimit;
  }

  // Public API: top N moves with hybrid minimax+heuristic
  public getBestMoves(player: 'white' | 'black', topN: number = 3, maxDepth: number = 2, movesMade: number = 0): Move[] {
    const phase = this.getGamePhase(movesMade);
    const depth = this.getDepthForPhase(phase, maxDepth);
    console.log(`[Evaluator] Phase=${phase} depth=${depth} for player=${player}`);

    const allMoves = this.generateAllMoves(player);
    if (allMoves.length === 0) return [];

    if (phase === 'opening') {
      // Use opening heuristics + some randomness
      return this.getOpeningMoves(allMoves, player, topN);
    }

    // Root-level move ordering: score by immediate heuristic first
    allMoves.forEach(m => m.score = this.getImmediateScore(m, player));
    allMoves.sort((a, b) => (b.score || 0) - (a.score || 0));

    const results: Move[] = [];
    // Evaluate each candidate root move with minimax (alpha-beta)
    for (let i = 0; i < Math.min(allMoves.length, Math.max(this.branchingLimit, topN)); i++) {
      const rootMove = allMoves[i]!;

      // Apply move temporarily
      const saved = this.saveState();
      try {
        this.game.makeMove(rootMove.from, rootMove.to, player);
      } catch (err) {
        this.restoreState(saved);
        rootMove.score = -Infinity;
        continue;
      }

      const opponent = player === 'white' ? 'black' : 'white';
      const score = -this.alphaBeta(opponent, depth - 1, -Infinity, Infinity, player);

      // restore
      this.restoreState(saved);

      rootMove.score = (rootMove.score || 0) + score;
      results.push(rootMove);
    }

    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    return results.slice(0, topN);
  }

  // ----------------- Core: alpha-beta minimax -----------------
  // Returns score from perspective of originalPlayer
  private alphaBeta(currentPlayer: 'white' | 'black', depth: number, alpha: number, beta: number, originalPlayer: 'white' | 'black'): number {
    // Terminal depth
    if (depth <= 0) {
      // Evaluate heuristically the current player's perspective but return from originalPlayer's view
      return this.evaluateBoardFor(originalPlayer) - this.evaluateBoardFor(this.opponent(originalPlayer));
    }

    const moves = this.generateAllMoves(currentPlayer);
    if (moves.length === 0) {
      // No moves: checkmate or stalemate
      if (this.game.isInCheck(currentPlayer)) {
        // currentPlayer is checkmated => very good for opponent
        return currentPlayer === originalPlayer ? -10000 : 10000;
      }
      // stalemate = draw
      return 0;
    }

    // Order moves by immediate heuristic to improve pruning
    moves.forEach(m => m.score = this.getImmediateScore(m, currentPlayer));
    moves.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Limit branching factor
    const limit = Math.min(moves.length, this.branchingLimit);

    if (currentPlayer === originalPlayer) {
      let value = -Infinity;
      for (let i = 0; i < limit; i++) {
        const mv = moves[i]!;
        const saved = this.saveState();
        try {
          this.game.makeMove(mv.from, mv.to, currentPlayer);
        } catch (err) {
          this.restoreState(saved);
          continue;
        }

        const score = this.alphaBeta(this.opponent(currentPlayer), depth - 1, alpha, beta, originalPlayer);
        this.restoreState(saved);

        value = Math.max(value, score);
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break; // beta cutoff
      }
      return value;
    } else {
      let value = Infinity;
      for (let i = 0; i < limit; i++) {
        const mv = moves[i]!;
        const saved = this.saveState();
        try {
          this.game.makeMove(mv.from, mv.to, currentPlayer);
        } catch (err) {
          this.restoreState(saved);
          continue;
        }

        const score = this.alphaBeta(this.opponent(currentPlayer), depth - 1, alpha, beta, originalPlayer);
        this.restoreState(saved);

        value = Math.min(value, score);
        beta = Math.min(beta, value);
        if (alpha >= beta) break; // alpha cutoff
      }
      return value;
    }
  }

  // ----------------- Helpers -----------------
  private opponent(player: 'white' | 'black') {
    return player === 'white' ? 'black' : 'white';
  }

  private getGamePhase(movesMade: number): 'opening' | 'midgame' | 'endgame' {
    if (movesMade < 12) return 'opening';
    if (movesMade < 40) return 'midgame';
    return 'endgame';
  }

  private getDepthForPhase(phase: 'opening' | 'midgame' | 'endgame', requestedDepth: number): number {
    switch (phase) {
      case 'opening': return Math.min(1, requestedDepth);
      case 'midgame': return Math.min(2, requestedDepth);
      case 'endgame': return Math.max(3, requestedDepth);
    }
  }

  // Opening selection: heuristic + weighted randomness
private getOpeningMoves(allMoves: Move[], player: 'white' | 'black', topN: number): Move[] {
  const safeMoves: Move[] = [];
  const riskyMoves: Move[] = [];

  // Evaluate all moves for both tactical opportunity and defensive safety
  for (const move of allMoves) {
    move.score = this.getOpeningScore(move, player);

    const target = this.game.state.board[move.to.x]?.[move.to.y];
    if (target && target !== '') {
      // Capture bonus (prefer higher value targets)
      const captureValue = this.pieceValue(target.toLowerCase());
      const ownValue = this.pieceValue(move.piece.toLowerCase());
      move.score! += (captureValue - ownValue * 0.4) * 2;
    }

    // --- Safety Analysis (one-ply lookahead) ---
    const saved = this.saveState();
    try {
      this.game.makeMove(move.from, move.to, player);
      const opponent = this.opponent(player);
      const opponentMoves = this.generateAllMoves(opponent);

      // If opponent can immediately attack our destination square → risk penalty
      const underThreat = opponentMoves.some(
        m => m.to.x === move.to.x && m.to.y === move.to.y
      );

      if (underThreat) {
        const val = this.pieceValue(move.piece.toLowerCase());
        move.score! -= val * 2.5; // heavy penalty for risky move
        riskyMoves.push(move);
      } else {
        safeMoves.push(move);
      }

    } catch {
      move.score! -= 5; // illegal or unsafe
    } finally {
      this.restoreState(saved);
    }
  }

  // --- Prioritization ---
  let candidates: Move[];
  const safeCaptures = safeMoves.filter(m => {
    const tgt = this.game.state.board[m.to.x]?.[m.to.y];
    return tgt && tgt !== '';
  });

  if (safeCaptures.length > 0) {
    candidates = safeCaptures;
  } else if (safeMoves.length > 0) {
    candidates = safeMoves;
  } else {
    candidates = riskyMoves; // fallback: risky moves if no alternative
  }

  // --- Sorting and controlled randomness ---
  candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
  const topPool = candidates.slice(0, Math.min(candidates.length, 12));
  const selected: Move[] = [];

  for (let i = 0; i < topN; i++) {
    if (topPool.length === 0) break;
    if (Math.random() < 0.25) {
      const idx = Math.floor(Math.random() * topPool.length);
      selected.push(topPool.splice(idx, 1)[0]!);
    } else {
      selected.push(topPool.shift()!);
    }
  }

  return selected;
}

  private generateAllMoves(player: 'white' | 'black'): Move[] {
    const moves: Move[] = [];
    const originalBoard = JSON.parse(JSON.stringify(this.game.state.board));

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = originalBoard[x]?.[y];
        if (!piece) continue;
        const isWhitePiece = piece === piece.toUpperCase();
        if ((player === 'white' && !isWhitePiece) || (player === 'black' && isWhitePiece)) continue;

        // Create isolated copy of the game for safe move generation
        const clone = new ChessGame(player, true);
        clone.state.board = JSON.parse(JSON.stringify(originalBoard));
        clone.state.turn = player;

        const pieceMoves = clone.getMoves(x, y, player);
        for (const to of pieceMoves) {
          moves.push({ from: { x, y }, to, piece });
        }
      }
    }

    return moves;
  }

  // Immediate heuristic used for ordering moves
  private getImmediateScore(move: Move, player: 'white' | 'black'): number {
    // Reuse existing heuristics: material + center + development + check bonus
    const board = this.game.state.board;
    const target = board[move.to.x]?.[move.to.y];
    let score = 0.1;

    if (target && target !== '') {
      switch (target.toLowerCase()) {
        case 'p': score += 1 * this.weights.material; break;
        case 'n':
        case 'b': score += 3 * this.weights.material; break;
        case 'r': score += 5 * this.weights.material; break;
        case 'q': score += 9 * this.weights.material; break;
      }
    }

    // center control
    const cx = move.to.x, cy = move.to.y;
    const center = (cx === 3 || cx === 4) && (cy === 3 || cy === 4);
    if (center) score += this.weights.centerControl;

    // small promotion bonus
    if (move.piece.toLowerCase() === 'p' && (move.to.x === 0 || move.to.x === 7)) score += this.weights.promotion;

    // check bonus
    if (typeof (this.game as any).isCheckAfterMove === 'function') {
      if ((this.game as any).isCheckAfterMove(move.from, move.to, player)) score += this.weights.checkBonus;
    }

    return score;
  }

  private evaluateBoardFor(player: 'white' | 'black'): number {
    // Material + positional (piece-square) + mobility + threat bonuses
    const board = this.game.state.board;
    let score = 0;
    let myMobility = 0;
    let oppMobility = 0;
    let threatScore = 0;
    const opponent = this.opponent(player);
    // Precompute all moves for threat/mobility
    const myMoves = this.generateAllMoves(player);
    const oppMoves = this.generateAllMoves(opponent);
    // Build a map of opponent piece locations for fast threat lookup
    const oppPieceMap = new Map<string, { x: number, y: number, piece: string }>();
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const p = board[x]?.[y];
        if (!p) continue;
        const isOpp = (p === p.toUpperCase()) !== (player === 'white');
        if (isOpp) oppPieceMap.set(`${x},${y}`, { x, y, piece: p });
      }
    }
    // Material + positional
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const p = board[x]?.[y];
        if (!p) continue;
        const lower = p.toLowerCase();
        const sign = (p === p.toUpperCase()) === (player === 'white') ? 1 : -1;
        // Material
        score += this.pieceValue(lower) * sign;
        // Piece-square bonus
        if (this.pieceSquareTable[lower]) {
          // For white, use normal index; for black, mirror vertically
          const idx = (player === 'white') === (p === p.toUpperCase())
            ? x * 8 + y
            : (7 - x) * 8 + y;
          const pst = this.pieceSquareTable[lower][idx] || 0;
          score += (pst / 100) * sign;
        }
      }
    }
    // Mobility bonus: number of legal moves
    myMobility = myMoves.length;
    oppMobility = oppMoves.length;
    // Add mobility bonus (scaled)
    score += (myMobility - oppMobility) * 0.05;
    // Threat bonus: for each move that attacks an opponent piece, add bonus
    for (const move of myMoves) {
      const tkey = `${move.to.x},${move.to.y}`;
      if (oppPieceMap.has(tkey)) {
        // Threatening an opponent piece
        const target = oppPieceMap.get(tkey)!;
        const v = this.pieceValue(target.piece.toLowerCase());
        threatScore += v * 0.15;
      }
    }
    score += threatScore;
    return score;
  }

  private pieceValue(p: string) {
    switch (p) {
      case 'p': return 1;
      case 'n':
      case 'b': return 3;
      case 'r': return 5;
      case 'q': return 9;
      case 'k': return 0;
      default: return 0;
    }
  }

  private getOpeningScore(move: Move, player: 'white' | 'black'): number {
    // keep a lightweight opening heuristic (same as before)
    let s = 0.1;
    const piece = move.piece.toLowerCase();
    const isWhite = player === 'white';
    if (piece === 'p') {
      const advancement = isWhite ? (6 - move.from.x) : (move.from.x - 1);
      if (advancement >= 1) s += 0.5;
      if (move.to.x === 3 || move.to.x === 4) s += 0.4;
    }
    if (piece === 'n') s += 0.6;
    if (piece === 'b') s += 0.5;
    if (piece === 'k' && Math.abs(move.to.x - move.from.x) === 2) s += 1.5;
    // center
    if ((move.to.x === 3 || move.to.x === 4) && (move.to.y === 3 || move.to.y === 4)) s += 0.7;
    return s;
  }

  // ----------------- Save & Restore state helpers -----------------
  // Save minimal pieces of state required to fully restore after makeMove
  private saveState() {
    return {
      board: this.game.state.board.map(row => [...row]),
      turn: this.game.state.turn,
      lastMove: this.game.state.lastMove ? { ...this.game.state.lastMove } : undefined,
      kingMoved: JSON.parse(JSON.stringify(this.game.state.kingMoved)),
      rookMoved: JSON.parse(JSON.stringify(this.game.state.rookMoved)),
      moveCount: (this.game.state as any).moveCount ?? 0,
    };
  }

  private restoreState(saved: any) {
    this.game.state.board = saved.board;
    this.game.state.turn = saved.turn;
    this.game.state.lastMove = saved.lastMove;
    this.game.state.kingMoved = saved.kingMoved;
    this.game.state.rookMoved = saved.rookMoved;
    if (typeof saved.moveCount === 'number') {
      (this.game.state as any).moveCount = saved.moveCount;
    }
  }

  // Reinforcement learning updateWeights kept as-is
  public updateWeights(result: 'win' | 'loss' | 'draw', movesPlayed: Move[]) {
    const learningRate = 0.05;
    const adjustment = result === 'win' ? 1 : result === 'loss' ? -1 : 0;

    for (const move of movesPlayed) {
      const immediateScore = this.getImmediateScore(move, 'white');
      if (result === 'draw') continue;
      this.weights.material += adjustment * learningRate * (immediateScore / 10);
      this.weights.promotion += adjustment * learningRate * (move.piece.toLowerCase() === 'p' ? 0.2 : 0);
      this.weights.checkBonus += adjustment * learningRate * 0.1;
      this.weights.centerControl += adjustment * learningRate * 0.05;
    }

    for (const key of Object.keys(this.weights)) {
      const k = key as keyof typeof this.weights;
      this.weights[k] = Math.max(0.1, Math.min(this.weights[k], 10));
    }

    try {
      const fs = require('fs');
      fs.writeFileSync('./weights.json', JSON.stringify(this.weights, null, 2));
    } catch (err) {
      console.warn('⚠️ Could not save weights:', err);
    }
  }
}