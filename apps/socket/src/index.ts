import { WebSocketServer } from 'ws';
import { ChessGame } from "@repo/chess/Game";

// Store all games by roomId, each is a ChessGame instance
const games: Record<string, ChessGame> = {};

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server is running on port 8080');

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');
  ws.on('error', console.error);
  ws.on('message', function message(parsedData) {
    const data = JSON.parse(parsedData.toString());
    console.log('received: %s', data);

    if (data.type === "create_room") {
      const playerId = data.playerId || "white";
      const newGame = new ChessGame(playerId);
      games[newGame.state.roomId] = newGame;
      ws.send(JSON.stringify({
        type: "room_created",
        roomName: newGame.state.roomId,
        game: newGame.state,
        turn: newGame.state.turn
      }));
      return;
    }

   if (data.type === "join_room") {
  const roomId = data.roomName;
  const playerId = data.playerId; // preserve the original color/id
  const game = games[roomId];
  if (!game) {
    ws.send(JSON.stringify({
      type: "error",
      message: "Room does not exist",
    }));
    return;
  }

  if (!playerId) {
    ws.send(JSON.stringify({
      type: "error",
      message: "Missing playerId",
    }));
    return;
  }

  // Add player if not already in list
  if (!game.state.players.includes(playerId)) {
    game.state.players.push(playerId);
  }

  ws.send(JSON.stringify({
    type: "room_joined",
    game: game.state,
    id: playerId,
    roomName: roomId,
  }));
  return;
}

    if (data.type === 'can_move') {
      const roomId = data.roomName;
      const playerId = data.playerId;
      const game = games[roomId];
      const { row, col } = data.index;
      console.log("Checking moves for piece at:", row, col);
      if (game && game.state.board?.[row]?.[col] !== undefined) {
        console.log("Piece found:", game.state.board?.[row]?.[col]);
        const moves = game.getMoves(row, col, playerId);
        console.log("Available moves:", moves);
        ws.send(JSON.stringify({ type: 'available_moves', moves }));
      }
      return;
    }

    if (data.type === 'make_move') {
      const roomId = data.roomName;
      const game = games[roomId];
      const from = data.from;
      const to = data.to;
      const playerId = data.playerId;
      if (!game) {
        ws.send(JSON.stringify({ type: "error", message: "Game not found" }));
        return;
      }
      if (!playerId) {
        ws.send(JSON.stringify({ type: "error", message: "Missing playerId" }));
        return;
      }
      // validate coordinates
      if (
        !from || !to ||
        from.x < 0 || from.x > 7 || from.y < 0 || from.y > 7 ||
        to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7
      ) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid move coordinates" }));
        return;
      }
      try {
        const result = game.makeMove(from, to, playerId);
        // broadcast updated state to all connected clients
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
      return;
    }
  });
});