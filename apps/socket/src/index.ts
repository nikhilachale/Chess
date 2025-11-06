import { WebSocketServer } from 'ws';
import { ChessGame } from "@repo/chess/Game";
import { ChessAI } from "@repo/chess/ChessAI";

const games: Record<string, ChessGame> = {};

const wss = new WebSocketServer({
  port: 8080,
  verifyClient: (info, done) => {
    console.log("Incoming WebSocket Origin:", info.origin);
    const allowedOrigins = [
      "https://chesss.thecabbro.com",
      "http://localhost:3000",
      undefined,
    ];
    if (!info.origin || allowedOrigins.includes(info.origin)) done(true);
    else {
      console.warn("Rejected WS connection from origin:", info.origin);
      done(false, 403, "Forbidden");
    }
  },
});

console.log("WebSocket server is running on port 8080");

wss.on("connection", ws => {
  console.log("A new client connected!");
  ws.on("error", console.error);

  ws.on("message", raw => {
    let data: any;

    try {
      const str = raw.toString().trim();
      if (!str) return; // ignore empty messages
      data = JSON.parse(str);
    } catch (err) {
      console.warn("Invalid WebSocket message received:", raw.toString());
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON payload" }));
      return;
    }

    switch (data.type) {
      case "create_room": {
        const playerId = data.playerId || "white";
        const newGame = new ChessGame(playerId);
        games[newGame.state.roomId] = newGame;
        ws.send(JSON.stringify({
          type: "room_created",
          roomName: newGame.state.roomId,
          game: newGame.state,
          turn: newGame.state.turn,
          id: playerId
        }));
        break;
      }

      case "join_room": {
        const { roomName, playerId } = data;
        const game = games[roomName];
        if (!game)
          return ws.send(JSON.stringify({ type: "error", message: "Room does not exist" }));
        if (!playerId)
          return ws.send(JSON.stringify({ type: "error", message: "Missing playerId" }));

        if (!game.state.players.includes(playerId))
          game.state.players.push(playerId);

        ws.send(JSON.stringify({
          type: "room_joined",
          game: game.state,
          id: playerId,
          roomName,
        }));
        break;
      }

      case "can_move": {
        const { roomName, playerId, index } = data;
        const game = games[roomName];
        const { row, col } = index || {};
        if (game && game.state.board?.[row]?.[col] !== undefined) {
          const moves = game.getMoves(row, col, playerId);
          ws.send(JSON.stringify({ type: "available_moves", moves }));
        }
        break;
      }

      case "make_move": {
        const { roomName, playerId, from, to } = data;
        const game = games[roomName];
        if (!game)
          return ws.send(JSON.stringify({ type: "error", message: "Game not found" }));
        if (!playerId)
          return ws.send(JSON.stringify({ type: "error", message: "Missing playerId" }));
        if (!from || !to ||
            from.x < 0 || from.x > 7 || from.y < 0 || from.y > 7 ||
            to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7)
          return ws.send(JSON.stringify({ type: "error", message: "Invalid move coordinates" }));

        try {
          const result = game.makeMove(from, to, playerId);
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: "move_made",
                ...result,
                fromPlayer: playerId,
              }));
            }
          });
        } catch (e: any) {
          ws.send(JSON.stringify({ type: "error", message: e.message || "Move failed" }));
        }
        break;
      }

      case "suggest_move": {
        const { roomName, playerId } = data;
        const game = games[roomName];
        if (!game)
          return ws.send(JSON.stringify({ type: "error", message: "Game not found" }));

        try {
          const ai = new ChessAI(game);
          const movesMade = game.state.moveCount;
          const suggestions = ai.getSuggestions(playerId as 'white' | 'black', 5, 2, movesMade);
          ws.send(JSON.stringify({
            type: "move_suggestions",
            suggestions,
            gamePhase: movesMade < 12 ? 'opening' : movesMade < 40 ? 'midgame' : 'endgame',
            moveCount: movesMade,
          }));
        } catch (e: any) {
          ws.send(JSON.stringify({
            type: "error",
            message: `AI suggestion failed: ${e.message}`,
          }));
        }
        break;
      }

      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
    }
  });
});