import { ChessGame } from './Game.js';
import { MoveEvaluator } from './MoveEvaluator.js';

export class ChessAI {
  private game: ChessGame;
  private evaluator: MoveEvaluator;

  constructor(game: ChessGame) {
    this.game = game;
    this.evaluator = new MoveEvaluator(game);
  }

  // Choose and play the best move for a given player
  public makeAIMove(player: 'white' | 'black', depth: number = 2): void {
    const bestMoves = this.evaluator.getBestMoves(player, 1, depth);
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
}

// Example usage
if (import.meta.main) {
  const game = new ChessGame('white');
  const ai = new ChessAI(game);

  console.log('Initial Board:', game.state.board);
  ai.makeAIMove('white', 2);
  console.log('Board After AI Move:', game.state.board);
}