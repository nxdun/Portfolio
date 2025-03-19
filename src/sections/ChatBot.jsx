// * Main ChatBot Component File
// ! Security Note: This component requires proper API key configuration
// ? Consider adding rate limiting for API calls

import { useEffect, useRef, useReducer, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import propTypes from "prop-types";
import { ChatService } from '../utils/ChatService';
import projectData from '../data/ProjectData.json';

// Initialize ChatService
const chatService = new ChatService(import.meta.env.VITE_API_KEY, {
  timeout: 30000,
  maxRetries: 3
});

// State management
const initialState = {
  messages: [{ user: "bot", text: "Hello! How can I assist you today?", icon: "🤖" }],
  userInput: "",
  isTyping: false,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER_INPUT":
      return { ...state, userInput: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// * Prepare system instructions with project data
const prepareSystemInstructions = () => {
  const baseInstructions = import.meta.env.VITE_MODEL_SYSTEM_INSTRUCTIONS;
  
  // Add special instructions for image formatting
  const enhancedInstructions = baseInstructions + 
    "IMPORTANT IMAGE FORMATTING:\n" +
    "- When showing project images, use EXACTLY this format: ![Image Description](image_url)\n" +
    "- DO NOT nest image markdown tags - use ONE SINGLE markdown tag per image\n" +
    "- NEVER use nested brackets when showing images\n" +
    "- Each image should be on its own line with proper markdown\n" +
    "- Example: ![Project Screenshot](https://example.com/image.png)\n\n";
  
  const projectDataJSON = JSON.stringify({
    platform_config: {
      host: "www.nadun.me",
      owner: "Nadun Lakshan",
      contact: {
        email: "nadun@gmail.com",
        phone: "0774364177",
        whatsapp: "0774364177",
        instagram: "nadu.lk"
      }
    },
    projects: projectData,
    guidelines: {
      response_tone: "Professional",
      query_handling: "Context-specific",
      privacy_level: "High"
    }
  }, null, 2);
  
  return enhancedInstructions + projectDataJSON;
};

// * Markdown and URL Processing Functions
// 💡 These functions handle special URL format: $$$ "label": "url" $$$ and plain URLs
const parseMarkdownContent = (text) => {
  const urlBlocks = [];
  
  // Sanitize the text to fix common issues with markdown
  let sanitizedText = text
    // Fix duplicate image markdown syntax
    .replace(/!\[Project Screenshot\s*\n*\s*.*?\]\(!\[Project Screenshot/g, '![Project Screenshot')
    // Fix closing parentheses issues
    .replace(/\)\s*\n*\s*\)/g, ')')
    // Clean up any remaining malformed markdown
    .replace(/\]\(!\[(.*?)\]\((.*?)\)/g, '](http:$2)')
    .replace(/\]\(!\[(.*?)\]\[(.*?)\]/g, ']($2)');
  
  // First pass: Process markdown image syntax ![alt](url)
  const markdownImagesProcessed = sanitizedText.replace(
    /!\[(.*?)\]\((https?:\/\/[^)\s]+)\)/g,
    (match, alt, url) => {
      // Make sure URL is clean
      const cleanUrl = url.replace(/[\n\r\s]+/g, '');
      urlBlocks.push({ 
        label: alt || 'Project Image', 
        url: cleanUrl 
      });
      return `__URL_${urlBlocks.length - 1}__`;
    }
  );
  
  // Second pass: Process special URL format and direct URLs
  const cleanText = markdownImagesProcessed.replace(
    /\$\$\$ ([^:]+): (https?:\/\/[^ ]+) \$\$\$|"(https?:\/\/[^"]+)"|(https?:\/\/[^\s]+)/g,
    (match, label, url, quotedUrl, plainUrl) => {
      if (plainUrl) {
        // Handle plain URLs (not in quotes, not in special format)
        urlBlocks.push({ 
          label: isImageUrl(plainUrl) ? 'Project Image' : 'Link', 
          url: plainUrl 
        });
      } else if (quotedUrl) {
        // Handle quoted URLs
        urlBlocks.push({ 
          label: isImageUrl(quotedUrl) ? 'Project Image' : 'Link', 
          url: quotedUrl 
        });
      } else if (url) {
        // Handle $$$ format
        urlBlocks.push({ label, url });
      }
      return `__URL_${urlBlocks.length - 1}__`;
    }
  );

  return {
    sections: cleanText.split(/(?=###)/g),
    urlBlocks
  };
};

// * URL Type Checker - Enhanced
// note: Checks if URL points to an image resource with more patterns
const isImageUrl = url => (
  url && (
    url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i) ||
    url.includes('ik.imagekit.io') ||
    url.includes('raw.githubusercontent.com') ||
    url.includes('imagekit') ||
    url.match(/\bimage\b|\bimg\b/i)
  )
);

// * Message Content Renderer
// todo: Add support for code blocks and tables
// 💡 Could be enhanced with syntax highlighting
const renderUrlBlock = (blockIndex, urlBlocks) => {
  const { label, url } = urlBlocks[blockIndex];
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

  return isImageUrl(cleanUrl) ? (
    <div key={`img-${blockIndex}`} className="my-4">
      <img
        src={cleanUrl}
        alt={label}
        className="rounded-lg max-w-full h-auto"
        loading="lazy"
        onError={(e) => {
          console.error(`Failed to load image: ${cleanUrl}`);
          e.target.style.display = 'none';
        }}
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

// Update the renderMessageContent function
const renderMessageContent = (text) => {
  const { sections, urlBlocks } = parseMarkdownContent(text);

  return (
    <div className="space-y-4 max-w-full">
      {sections.map((section, sIndex) => (
        <div key={`section-${sIndex}`} className="mb-4">
          {section.split(/(__URL_\d+__)/).map((part, pIndex) => {
            const urlMatch = part.match(/__URL_(\d+)__/);
            return urlMatch ? 
              renderUrlBlock(parseInt(urlMatch[1]), urlBlocks) : 
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

// * Main ChatBot Component
// work: Ongoing improvements for accessibility
const ChatBot = ({ closeMe }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isTyping]);

  const handleSendMessage = async () => {
    const trimmedInput = state.userInput.trim();
    if (!trimmedInput) return;

    // Add user message
    dispatch({ type: "ADD_MESSAGE", payload: { user: "user", text: trimmedInput, icon: "👤" } });
    dispatch({ type: "SET_USER_INPUT", payload: "" });
    dispatch({ type: "SET_TYPING", payload: true });

    try {
      // Get bot response using ChatService with combined instructions and project data
      const response = await chatService.createChatCompletion(
        trimmedInput,
        prepareSystemInstructions()
      );

      if (response.success) {
        dispatch({
          type: "ADD_MESSAGE",
          payload: { user: "bot", text: response.content, icon: "🤖" }
        });
      } else {
        dispatch({
          type: "ADD_MESSAGE",
          payload: { user: "bot", text: response.content, icon: "⚠️" }
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to get response from the bot"
      });
    } finally {
      dispatch({ type: "SET_TYPING", payload: false });
    }
  };

  const handleInputChange = useCallback((e) => {
    dispatch({ type: "SET_USER_INPUT", payload: e.target.value });
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, []);

  // * Width Calculator
  // note: Responsive design helper
  const calculateWidth = () => {
    const baseWidth = window.innerWidth < 768 ? 320 : 480;
    const maxWidth = window.innerWidth < 768 ? 400 : 720;
    const increment = Math.min(state.messages.length * 20, maxWidth - baseWidth);
    return baseWidth + increment;
  };

  // * Quick Access Messages
  // 💡 Could be dynamically generated based on user history
  const templateMessages = [
    "How much Projects You Did",
    "What is Your Favorite Project provide github and relevant images",
    "Show Me Images Of lms-microservice Project",
  ];

  // * Component Render
  // 🔥 Critical for user interaction
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
          {state.messages.map((message, index) => (
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
          {state.isTyping && (
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
            value={state.userInput}
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
                onClick={() => dispatch({ type: "SET_USER_INPUT", payload: message })}
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
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
};

// * Component Export and PropTypes
// ! Required for type checking
export default ChatBot;
ChatBot.propTypes = { closeMe: propTypes.func.isRequired };
