"use client";

import React from "react";
import GameCanvas from "../components/GameCanvas";
import { AvatarSelector } from "../components/AvatarSelector";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (!selectedAvatar) {
      alert("Please select an avatar!");
      return;
    }
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Mini Gather Multiplayer
          </h1>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select Avatar
            </label>
            <AvatarSelector
              onSelect={setSelectedAvatar}
              selected={selectedAvatar}
            />
          </div>

          <button
            onClick={handleStartGame}
            className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 focus:outline-none"
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <GameCanvas username={username || "Anonymous"} avatar={selectedAvatar!} />
    </div>
  );
}
