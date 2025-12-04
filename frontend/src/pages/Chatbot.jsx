import React, { useState, useRef } from "react";
import API from "../services/api";
import { Mic, Send } from "lucide-react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🎤 Voice Input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Voice Input.");
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = "en-IN";
    recognitionRef.current.continuous = false;

    recognitionRef.current.onstart = () => setListening(true);

    recognitionRef.current.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setInput(speech);
      setListening(false);
    };

    recognitionRef.current.onerror = () => setListening(false);
    recognitionRef.current.start();
  };

  // 🔊 Text to Speech
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  // ⌨ Typing Animation (ChatGPT style)
  const typeText = (text, callback) => {
    let index = 0;

    const interval = setInterval(() => {
      callback(text.slice(0, index));
      index++;

      if (index > text.length) {
        clearInterval(interval);
      }
    }, 20);
  };

  // 📩 Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await API.post("/ai/chat", { message: userMsg });

      const botReply = res.data.response;
      const source = res.data.source;

      let prefix = " BudgetWise AI: ";

      if (source === "OPENROUTER") {
        prefix = "🤖 OpenRouter AI: ";
      } else if (source === "HUGGING_FACE") {
        prefix = "🤖 HuggingFace AI: ";
      }

      const finalText = prefix + botReply;

      // Add empty message first for typing effect
      setMessages((prev) => [...prev, { role: "bot", text: "" }]);

      // Typing animation: update last bot message slowly
      typeText(finalText, (typedText) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = typedText;
          return updated;
        });
      });

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠ Something went wrong. Try again." },
      ]);
    }
  };

  // ⭐ Quick Buttons
  const quickQuestions = [
    "Predict my next month expense",
    "What is my highest spending category this month?",
    "What is my highest spending category this week?",
    "Give me my financial analysis",
    "How can I save more money?",
    "How to reduce expenses?",
    "Help me make a budget",
    "Give me investment advice",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 flex justify-center items-center">
      <div className="bg-white/90 backdrop-blur-2xl w-full max-w-3xl rounded-3xl shadow-2xl p-6 border border-purple-200">

        <h2 className="text-3xl font-extrabold text-indigo-700 mb-5 text-center tracking-wide">
          🤖 Smart AI Assistant
        </h2>

        {/* CHAT AREA */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-100 rounded-2xl shadow-inner mb-5 border border-gray-200">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 my-2 rounded-xl w-fit max-w-xs text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white ml-auto shadow-md"
                  : "bg-white text-gray-900 shadow"
              }`}
            >
              {msg.text}

              {msg.role === "bot" && (
                <button
                  onClick={() => speak(msg.text)}
                  className="ml-2 text-indigo-600 text-xs underline hover:text-indigo-800"
                >
                  🔊 Speak
                </button>
              )}
            </div>
          ))}
        </div>

        {/* QUICK BUTTONS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-200 transition cursor-pointer"
              onClick={() => setInput(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 bg-white rounded-full px-4 py-2 shadow focus:ring-2 focus:ring-indigo-400"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={startListening}
            className={`p-3 rounded-full ${
              listening ? "bg-red-500" : "bg-indigo-600"
            } text-white hover:bg-indigo-700 transition`}
          >
            <Mic size={20} />
          </button>

          <button
            onClick={sendMessage}
            className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
