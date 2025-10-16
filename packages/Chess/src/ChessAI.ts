import { ChessGame } from './Game.js';
import { MoveEvaluator } from './MoveEvaluator.js';

interface Move {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: string;
  score?: number;
}

export class ChessAI {
  private game: ChessGame;
  public evaluator: MoveEvaluator;

  constructor(game: ChessGame) {
    this.game = game;
    this.evaluator = new MoveEvaluator(game);
  }

  // Choose and play the best move for a given player
  public makeAIMove(player: 'white' | 'black', depth: number = 2, movesMade: number): void {
    const bestMoves = this.evaluator.getBestMoves(player, 1, depth, movesMade);
    if (!bestMoves || bestMoves.length === 0) {
      console.log(`[AI] No legal moves available for ${player}`);
      return;
    }

    const move = bestMoves[0];
    if (move) {
      this.game.makeMove(move.from, move.to, player);

      console.log(
        `[AI] ${player} played ${move.piece} from (${move.from.x},${move.from.y}) to (${move.to.x},${move.to.y}) with score ${move.score?.toFixed(2)}`
      );
    }
  }

  // Get move suggestions without making actual moves
  public getSuggestions(player: 'white' | 'black', topN: number = 5, depth: number = 2, movesMade: number): Move[] {

    console.log(`[AI] Generating top ${topN} move suggestions for ${player}`);
    return this.evaluator.getBestMoves(player, topN, depth, movesMade);
  }
}

// Example usage
if (import.meta.main) {
  const game = new ChessGame('white');
  const ai = new ChessAI(game);

  console.log('Initial Board:', game.state.board);
  ai.makeAIMove('white', 2,10);
  console.log('Board After AI Move:', game.state.board);
}