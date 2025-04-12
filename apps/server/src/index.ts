import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080
const server = http.createServer()
const wss = new WebSocketServer({server: server})

interface Player {
    id: string;
    x: number;
    y: number;
    username?: string;
    avatar?: string;
}

const players = new Map<WebSocket, Player>();
let playerCount = 0;

wss.on('connection', (ws: WebSocket) => {
  const playerId = `player-${++playerCount}`;
  players.set(ws, { id: playerId, x: 5, y: 5 });

  console.log(`${playerId} connected`);

  ws.send(JSON.stringify({ type: 'init', id: playerId }));

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    const player = players.get(ws);

    if (data.type === 'set-username' && player) {
      player.username = data.username;
      player.avatar = data.avatar;
      broadcast();
    }

    if (data.type === 'move' && player) {
      player.x = data.x;
      player.y = data.y;
      broadcast();
    }

    if (data.type === 'chat' && player) {
      const receiver = Array.from(players.entries()).find(([_, p]) => p.id === data.to);
      if (receiver && receiver[0].readyState === WebSocket.OPEN) {
        receiver[0].send(JSON.stringify({
          type: 'chat',
          from: player.username,
          message: data.message,
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log(`${players.get(ws)?.id} disconnected`);
    players.delete(ws);
    broadcast();
  });

  broadcast();
});

function broadcast() {
  const state = Array.from(players.values());
  const message = JSON.stringify({ type: 'state', players: state });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})