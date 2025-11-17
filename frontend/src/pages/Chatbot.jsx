import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { Send } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋, I'm your AI Finance Assistant. How can I help you today?" }
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");
    setTyping(true);

    try {
      const res = await API.post("/ai/chat", { message: userInput });

      setTimeout(() => {
        const botMessage = { sender: "bot", text: res.data.response };
        setMessages((prev) => [...prev, botMessage]);
        setTyping(false);
      }, 800); // typing delay

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error connecting to AI service." }
      ]);
      setTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white flex justify-center">
      <div className="bg-white text-gray-900 w-full max-w-3xl h-[85vh] rounded-3xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="p-4 bg-indigo-600 rounded-t-3xl text-white text-xl font-bold flex items-center gap-2">
          🤖 AI Finance Assistant
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm max-w-[75%] shadow 
                  ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-pulse">🤖 AI is typing...</div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white rounded-b-3xl border-t flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border px-4 py-2 rounded-full outline-none bg-gray-100"
            placeholder="Ask something… (e.g., How can I save money?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
