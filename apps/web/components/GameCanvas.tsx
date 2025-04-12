import React, { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import Notification from "./Notification";
import { imageLinks } from "../config";

interface GameCanvasProps {
  username: string;
  avatar: string;
}
interface Player {
  id: string;
  x: number;
  y: number;
  username?: string;
  avatar?: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type:
    | "border"
    | "wall"
    | "wall_1"
    | "wall_2"
    | "wall_3"
    | "chair"
    | "table"
    | "Ftable"
    | "kiratTable";
}

export const OBSTACLES: Obstacle[] = [
  { x: 0, y: 0, width: 75, height: 1, type: "border" }, // Top wall
  { x: 0, y: 34, width: 75, height: 1, type: "border" }, // Bottom wall
  { x: 0, y: 0, width: 1, height: 35, type: "border" }, // Left wall
  { x: 74, y: 0, width: 1, height: 35, type: "border" }, // Right wall
  { x: 52, y: 1, width: 4, height: 20, type: "border" },
  { x: 62, y: 19, width: 12, height: 2, type: "border" },

  { x: 1, y: 1, width: 51, height: 5, type: "wall" }, // blue_Wall
  { x: 52, y: 21, width: 4, height: 5, type: "wall_1" }, // Wall
  { x: 62, y: 21, width: 12, height: 5, type: "wall_3" }, // Wall
  { x: 56, y: 1, width: 18, height: 5, type: "wall_2" }, // puple_Wall

  { x: 9, y: 18, width: 6, height: 4, type: "table" }, // Table
  { x: 11, y: 16, width: 2, height: 2, type: "chair" }, // Chair

  { x: 15, y: 18, width: 6, height: 4, type: "table" }, // Table
  { x: 17, y: 16, width: 2, height: 2, type: "chair" }, // Chair

  { x: 21, y: 18, width: 6, height: 4, type: "table" }, // Table
  { x: 23, y: 16, width: 2, height: 2, type: "chair" }, // Chair

  { x: 9, y: 22, width: 6, height: 4, type: "Ftable" }, // Table
  { x: 11, y: 26, width: 2, height: 2, type: "chair" }, // Chair

  { x: 15, y: 22, width: 6, height: 4, type: "Ftable" }, // Table
  { x: 17, y: 26, width: 2, height: 2, type: "chair" }, // Chair

  { x: 21, y: 22, width: 6, height: 4, type: "Ftable" }, // Table
  { x: 23, y: 26, width: 2, height: 2, type: "chair" }, // Chair

  { x: 62, y: 9, width: 6, height: 5, type: "kiratTable" },
  { x: 64, y: 7, width: 2, height: 2, type: "chair" }, // Chair
  { x: 63, y: 14, width: 2, height: 2, type: "chair" }, // Chair
  { x: 66, y: 14, width: 2, height: 2, type: "chair" }, // Chair
];
const GameCanvas: React.FC<GameCanvasProps> = ({ username, avatar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chattingWith, setChattingWith] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; isMine: boolean }[]>(
    []
  );

  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const loadImage = (name: string, src: string) => {
      const img = new Image();
      img.src = src;
      imageRefs.current[name] = img;
    };

    loadImage("chair", imageLinks.chair);
    loadImage("table", imageLinks.table);
    loadImage("Ftable", imageLinks.Ftable);
    loadImage("wall", imageLinks.wall);
    loadImage("wall_1", imageLinks.wall_1);
    loadImage("wall_2", imageLinks.wall_2);
    loadImage("wall_3", imageLinks.wall_3);
    loadImage("kiratTable", imageLinks.kiratTable);
  }, []);

  useEffect(() => {
    const wsConnection = new WebSocket("ws://localhost:8080");

    wsConnection.onopen = () => {
      console.log("Connected to server");
      wsConnection.send(
        JSON.stringify({ type: "set-username", username, avatar })
      );
    };

    wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        setPlayerId(data.id);
      }

      if (data.type === "state") {
        setPlayers(data.players);
      }

      if (data.type === "chat") {
        addMessage(`${data.from}: ${data.message}`, false);
      }
    };

    wsConnection.onclose = () => {
      console.log("Disconnected from server");
    };

    setSocket(wsConnection);

    return () => {
      wsConnection.close();
    };
  }, [username, avatar]);

  const isColliding = (x: number, y: number): boolean => {
    return OBSTACLES.some((obs) => {
      return (
        x >= obs.x &&
        x < obs.x + obs.width &&
        y >= obs.y &&
        y < obs.y + obs.height
      );
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!socket || !playerId) return;

      const me = players.find((p) => p.id === playerId);
      if (!me) return;

      let newX = me.x;
      let newY = me.y;

      if (e.key === "ArrowUp") newY -= 1;
      if (e.key === "ArrowDown") newY += 1;
      if (e.key === "ArrowLeft") newX -= 1;
      if (e.key === "ArrowRight") newX += 1;

      if (!isColliding(newX, newY)) {
        socket.send(JSON.stringify({ type: "move", x: newX, y: newY }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [socket, playerId, players]);

  useEffect(() => {
    if (!playerId || players.length === 0) return;

    const me = players.find((p) => p.id === playerId);
    if (!me) return;

    const nearbyPlayers = players.filter((p) => {
      const dx = Math.abs(me.x - p.x);
      const dy = Math.abs(me.y - p.y);
      return dx + dy === 1 && p.id !== playerId;
    });

    if (nearbyPlayers.length > 0) {
      const nearest = nearbyPlayers[0];
      if (nearest && (!chattingWith || chattingWith.id !== nearest?.id)) {
        startChat(nearest);
      }
    } else if (chattingWith) {
      closeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, playerId, chattingWith]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = 20;

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //   for (let i = 0; i < canvas.width; i += tileSize) {
      //     for (let j = 0; j < canvas.height; j += tileSize) {
      //       ctx.strokeStyle = "#ccc";
      //       ctx.strokeRect(i, j, tileSize, tileSize);
      //     }
      //   }

      OBSTACLES.forEach((obs) => {
        const img = imageRefs.current[obs.type];
        if (obs.type === "border") {
          ctx.fillStyle = "#181625";
          ctx.fillRect(
            obs.x * tileSize,
            obs.y * tileSize,
            obs.width * tileSize,
            obs.height * tileSize
          );
        } else if (img) {
          ctx.drawImage(
            img,
            obs.x * tileSize,
            obs.y * tileSize,
            obs.width * tileSize,
            obs.height * tileSize
          );
        }
      });

      players.forEach((player) => {
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          player.avatar || "👤",
          player.x * tileSize + tileSize / 2,
          player.y * tileSize + tileSize / 2
        );

        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(
          player.username || player.id,
          player.x * tileSize + tileSize / 2,
          player.y * tileSize + 40
        );
      });

      requestAnimationFrame(drawGame);
    };

    drawGame();
  }, [players]);

  const startChat = (targetPlayer: Player) => {
    if (!targetPlayer.username) return;

    setChattingWith({ id: targetPlayer.id, username: targetPlayer.username });
    setMessages([]);
    showNotification(`💬 You are now chatting with ${targetPlayer.username}`);
  };

  const closeChat = () => {
    setChattingWith(null);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const addMessage = (text: string, isMine: boolean) => {
    setMessages((prev) => [...prev, { text, isMine }]);
  };

  const sendMessage = (message: string) => {
    if (!socket || !chattingWith) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        to: chattingWith.id,
        message,
      })
    );

    addMessage(`You: ${message}`, true);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={1500}
        height={700}
        className="border-2 border-black bg-gray-100"
      />

      {chattingWith && (
        <ChatBox
          receiver={chattingWith.username}
          messages={messages}
          onSendMessage={sendMessage}
        />
      )}

      {notification && <Notification message={notification} />}
    </div>
  );
};

export default GameCanvas;
