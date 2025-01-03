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
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: import.meta.env.VITE_MODEL_SYSTEM_INSTRUCTIONS || "System instructions not set",
        },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
    });
    return response.choices[0]?.message?.content || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Sorry, there was an error processing your request.";
  }
};

const parseMarkdownContent = (text) => {
  const urlBlocks = [];
  const cleanText = text.replace(
    /\$\$\$ "([^"]+)": "([^"]+)" \$\$\$/g,
    (_, label, url) => {
      urlBlocks.push({ label, url });
      return `__URL_${urlBlocks.length - 1}__`;
    }
  );

  return {
    sections: cleanText.split(/(?=###)/g),
    urlBlocks
  };
};

const isImageUrl = url => (
  url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
  url.includes('ik.imagekit.io') ||
  url.includes('raw.githubusercontent.com')
);

const renderMessageContent = (text) => {
  const { sections, urlBlocks } = parseMarkdownContent(text);

  const renderUrlBlock = (blockIndex) => {
    const { label, url } = urlBlocks[blockIndex];
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    return isImageUrl(url) ? (
      <div key={`img-${blockIndex}`} className="my-4">
        <img
          src={cleanUrl}
          alt={label}
          className="rounded-lg max-w-full"
          loading="lazy"
          onError={(e) => e.target.style.display = 'none'}
        />
        <p className="mt-1 text-sm text-gray-400">{label}</p>
      </div>
    ) : (
      <a
        key={`link-${blockIndex}`}
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="my-1 inline-block break-words text-blue-500 underline"
      >
        {label}
      </a>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section, sIndex) => (
        <div key={`section-${sIndex}`} className="mb-4">
          {section.split(/(__URL_\d+__)/).map((part, pIndex) => {
            const urlMatch = part.match(/__URL_(\d+)__/);
            return urlMatch ? 
              renderUrlBlock(parseInt(urlMatch[1])) : 
              part && (
                <ReactMarkdown
                  key={`md-${pIndex}`}
                  components={{
                    h3: ({children}) => <h3 className="mb-3 text-lg font-semibold">{children}</h3>,
                    p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="mb-3 space-y-1 list-disc pl-6">{children}</ul>,
                    ol: ({children}) => <ol className="mb-3 space-y-1 list-decimal pl-6">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {part.trim()}
                </ReactMarkdown>
              );
          })}
        </div>
      ))}
    </div>
  );
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
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    setMessages(prev => [...prev, { user: "user", text: trimmedInput, icon: "👤" }]);
    setUserInput("");
    setIsTyping(true);

    const botReply = await fetchBotResponse(trimmedInput);
    setMessages(prev => [...prev, { user: "bot", text: botReply, icon: "🤖" }]);
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

  const templateMessages = [
    "How much Projects You Did",
    "What is Your Favorite Project",
    "Show Me Images Of lms-microservice Project",
  ];

  return (
    <div
      className="fixed bottom-8 right-8 z-50 rounded-lg border border-gray-600 bg-black/40 p-4 shadow-lg backdrop-blur-md"
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
            <div className="flex items-center justify-start">
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
            className="w-full rounded-lg border border-gray-300 bg-gray-700 p-3 text-white"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="relative flex items-center overflow-hidden rounded-full bg-blue-500 p-3 text-white transition-all hover:bg-blue-600"
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

        {/* Quick Messages Section with Seamless Loop and Slow Animation */}
        <div className="mt-2 flex overflow-x-hidden pb-2">
          <div className="animate-marquee flex space-x-1">
            {templateMessages.concat(templateMessages).map((message, index) => (
              <button
                key={index}
                onClick={() => setUserInput(message)}
                className="rounded-full bg-gray-700 px-4 py-2 text-white shadow-sm hover:bg-gray-600"
                style={{ whiteSpace: "nowrap" }}
              >
                {message}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>
        {`
          .animate-marquee {
            display: flex;
            flex-direction: row;
            animation: marquee 30s linear infinite;
          }

          @keyframes marquee {
            0% {
              transform: translateX(0%);            }            100% {              transform: translateX(-50%);            }          }        `}{" "}
      </style>{" "}
    </div>
  );
};
export default ChatBot;
ChatBot.propTypes = { closeMe: propTypes.func.isRequired };
