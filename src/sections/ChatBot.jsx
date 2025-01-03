import { useState, useEffect, useRef } from "react";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";
import propTypes from "prop-types";
const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

const fetchBotResponse = async (userMessage) => {
  try {
    console.log("Sending request to Groq API with message:", userMessage);

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            import.meta.env.VITE_MODEL_SYSTEM_INSTRUCTIONS ||
            "System instructions not set",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    console.log("Response from Groq API:", response);

    const botReply =
      response.choices[0]?.message?.content ||
      "Sorry, I couldn't understand that.";
    console.log("Bot reply:", botReply);

    return botReply;
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Sorry, there was an error processing your request.";
  }
};

const renderMessageContent = (text) => {
  const urlRegex = /(https?:\/\/(www\.)?(github\.com|nadun\.me|ik\.imagekit\.io|raw\.githubusercontent\.com)\S*)/gi;

  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      if (
        part.startsWith("https://ik.imagekit.io") ||
        part.startsWith("https://raw.githubusercontent.com")
      ) {
        return (
          <img
            key={index}
            src={part}
            alt="Rendered content"
            className="max-w-full rounded-lg"
          />
        );
      }
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {part}
        </a>
      );
    }
    return <ReactMarkdown key={index}>{part}</ReactMarkdown>;
  });
};

const ChatBot = ({ closeMe }) => {
  const [messages, setMessages] = useState([
    { user: "bot", text: "Hello! How can I assist you today?", icon: "🤖" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const calculateWidth = () => {
    const baseWidth = window.innerWidth < 768 ? 320 : 480;
    const maxWidth = window.innerWidth < 768 ? 400 : 720;
    const increment = Math.min(messages.length * 20, maxWidth - baseWidth);
    return baseWidth + increment;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const sanitizedInput = userInput.trim();
    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "user", text: sanitizedInput, icon: "👤" },
    ]);
    setUserInput("");
    setIsTyping(true);

    const botReply = await fetchBotResponse(sanitizedInput);

    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "bot", text: botReply, icon: "🤖" },
    ]);
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      className="bg-black/40 fixed bottom-8 right-8 z-50 rounded-lg p-4 shadow-lg backdrop-blur-md border border-gray-600"
      style={{ width: calculateWidth() }}
    >
      <div className="relative flex flex-col space-y-4">
        <button
          onClick={closeMe}
          className="absolute -right-4 -top-16 h-10 w-10 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
        >
          ✖️
        </button>
        <div
          className="h-96 space-y-4 overflow-y-auto p-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.6) transparent",
            scrollbarTrackColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <style>
            {`
              .h-96::-webkit-scrollbar {
                width: 8px;
              }
              .h-96::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                border-radius: 8px;
              }
              .h-96::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.6);
                border-radius: 8px;
                transition: background 0.3s ease;
              }
              .h-96::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.9);
              }
            `}
          </style>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.user === "user" ? "justify-end" : "justify-start"
              } items-center`}
            >
              <span className="text-xl">{message.icon}</span>
              <div
                className={`ml-2 max-w-xs rounded-lg p-3 ${
                  message.user === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                {renderMessageContent(message.text)}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start items-center">
              <span className="text-xl">🤖</span>
              <div className="ml-2 max-w-xs rounded-lg bg-gray-800 p-3 text-white">
                <span className="animate-pulse text-gray-400">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="w-full rounded-lg border border-gray-300 p-3 bg-gray-700 text-white"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="relative overflow-hidden rounded-full bg-blue-500 p-3 text-white transition-all hover:bg-blue-600 flex items-center"
          >
            <div className="svg-wrapper-1">
              <div className="svg-wrapper animate-fly">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  />
                </svg>
              </div>
            </div>
            <span className="ml-2"></span>
            <style>
              {`
                .svg-wrapper-1 {
                  display: inline-flex;
                }
                .svg-wrapper {
                  animation: fly 0.6s ease-in-out infinite alternate;
                }
                @keyframes fly {
                  from {
                    transform: translateY(0.1em);
                  }
                  to {
                    transform: translateY(-0.1em);
                  }
                }
              `}
            </style>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

ChatBot.propTypes = {
  closeMe: propTypes.func.isRequired,
};
