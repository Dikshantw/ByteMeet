import React, { useState, useRef, useEffect } from "react";

interface ChatBoxProps {
  receiver: string;
  messages: { text: string; isMine: boolean }[];
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  receiver,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="absolute right-4 top-4 w-72 rounded-lg border-2 border-gray-300 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <h3 className="font-medium text-gray-700">Chatting with {receiver}</h3>
      </div>

      <div className="chat-messages h-40 overflow-y-auto p-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 max-w-[80%] rounded-lg p-2 ${
              msg.isMine ? "ml-auto bg-blue-100 text-right" : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        />
      </form>
    </div>
  );
};

export default ChatBox;
