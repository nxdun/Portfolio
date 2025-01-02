import { useState, useEffect, useRef } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Function to fetch the bot response from the Groq API using Groq SDK
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

const ChatBot = ({ closeMe }) => {
  const [messages, setMessages] = useState([
    { user: "bot", text: "Hi!I am Nadun How can I assist you today?", icon: "🤖" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    <div className="bg-white/50 fixed bottom-8 right-8 z-50 w-80 rounded-lg p-4 shadow-lg backdrop-blur-md">
      <div className="relative flex flex-col space-y-4">
        <button
          onClick={closeMe}
          className="absolute -right-4 -top-16 h-10 w-10 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
        >
          ✖️
        </button>
        <div className="h-72 space-y-4 overflow-y-auto p-2">
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
                    : "bg-gray-200 text-black"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start items-center">
              <span className="text-xl">🤖</span>
              <div className="ml-2 max-w-xs rounded-lg bg-gray-200 p-3 text-black">
                <span className="animate-pulse text-gray-500">Typing...</span>
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
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
