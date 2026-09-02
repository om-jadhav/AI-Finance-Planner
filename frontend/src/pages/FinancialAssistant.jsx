import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { sendChatMessage } from "../api/chat";

const MAX_HISTORY_MESSAGES = 10;

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your financial assistant. Ask me about investing basics " +
    "(SIP, mutual funds, CAGR, diversification...), or ask about your " +
    "own profile and plan once you've generated one -- I'll use your " +
    "saved data to answer.",
};

const SUGGESTED_QUESTIONS = [
  "Explain my financial plan",
  "Which plan suits me best?",
  "Why is my goal difficult?",
  "What is SIP?",
  "Explain my risk profile",
  "Compare my plans",
];

export default function FinancialAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || sending) return;

    const nextMessages = [...messages, { role: "user", content: trimmedText }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      // Only real conversation turns go to the API -- the local welcome
      // message is a UI-only placeholder. Only the last N are sent
      // (also trimmed again server-side as a safety net).
      const conversationForApi = nextMessages
        .filter((m) => m !== WELCOME_MESSAGE)
        .slice(-MAX_HISTORY_MESSAGES);

      const { reply } = await sendChatMessage(conversationForApi);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't reach the chat assistant. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleClear() {
    setMessages([WELCOME_MESSAGE]);
    setError("");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="financial-assistant" />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">Financial Assistant</span>
              <span className="user-email">Ask about your profile, plan, or investing in general</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content chat-page-content">
          <section className="chat-card">
            <div className="chat-card-header">
              <span>Chat</span>
              <button type="button" className="chat-clear-button" onClick={handleClear}>
                Clear conversation
              </button>
            </div>

            <div className="chat-suggested-questions">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chat-suggestion-chip"
                  onClick={() => sendMessage(q)}
                  disabled={sending}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                  {m.content}
                </div>
              ))}
              {sending && (
                <div className="chat-bubble chat-bubble-assistant chat-bubble-loading">
                  Thinking…
                </div>
              )}
            </div>

            {error && <div className="chat-error">{error}</div>}

            <form className="chat-input-row" onSubmit={handleSubmit}>
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about your plan or investing…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="chat-send-button" disabled={sending || !input.trim()}>
                Send
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
