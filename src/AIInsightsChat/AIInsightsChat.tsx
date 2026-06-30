import { useState, useRef, useEffect } from 'react';
import './AIInsightsChat.css';
import { useGrok } from '../hooks/useGrok';

interface AIInsightsChatProps {
  messageStats: any;
  activityStats: any;
  responseStats: any;
  wordStats: any;
  emojiStats: any;
  mediaStats: any;
  messages: any[];
}

interface ChatMessage {
  type: 'question' | 'answer' | 'error';
  content: string;
}

// Custom four-point spark mark — drawn as SVG rather than relying on
// an emoji, so it renders identically across platforms and reads as
// a deliberate brand mark rather than a generic "sparkles" glyph.
function SparkMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.5C12.3 6.3 13.2 8.7 15 10.5C16.8 12.3 19.2 13.2 23 13.5C19.2 13.8 16.8 14.7 15 16.5C13.2 18.3 12.3 20.7 12 24.5C11.7 20.7 10.8 18.3 9 16.5C7.2 14.7 4.8 13.8 1 13.5C4.8 13.2 7.2 12.3 9 10.5C10.8 8.7 11.7 6.3 12 2.5Z"
        fill="currentColor"
        transform="translate(0 -1)"
      />
    </svg>
  );
}

export default function AIInsightsChat({
  messageStats,
  activityStats,
  responseStats,
  wordStats,
  emojiStats,
  mediaStats,
  messages,
}: AIInsightsChatProps) {
  const { ask, answer, loading, error} = useGrok();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Build sample messages context — pick 10 random non-empty messages
  const sampleMessages = messages
    .filter(m => m.content && m.content.length > 5 && m.content.length < 200)
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map(m => ({
      sender: m.sender,
      content: m.content,
      date: new Date(m.timestamp).toLocaleDateString(),
    }));

  const ctx = {
    messageStats,
    activityStats,
    responseStats,
    wordStats,
    emojiStats,
    mediaStats,
    sampleMessages,
  };

  // When a new answer arrives, push it into chat history
  useEffect(() => {
    if (answer) {
      setChatHistory(prev => [
        ...prev,
        { type: 'answer', content: answer },
      ]);
    }
  }, [answer]);

  useEffect(() => {
    if (error) {
      setChatHistory(prev => [
        ...prev,
        { type: 'error', content: 'Something went wrong. Try again.' },
      ]);
    }
  }, [error]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleAsk = async () => {
    if (!inputQuestion.trim() || loading) return;

    const question = inputQuestion.trim();
    setChatHistory(prev => [
      ...prev,
      { type: 'question', content: question },
    ]);
    setInputQuestion('');
    
    await ask(question, ctx);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="ai-chat-wrapper">
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <span className="ai-chat-avatar">
            <SparkMark className="ai-chat-avatar-icon" />
          </span>
          <div>
            <p className="ai-chat-title">Ask AI</p>
            <p className="ai-chat-subtitle">Powered by your real data</p>
          </div>
        </div>
        <span className="ai-chat-badge">Gemini</span>
      </div>

      {/* Chat transcript */}
      {chatHistory.length > 0 && (
        <div className="ai-chat-transcript">
          {chatHistory.map((msg, i) => {
            if (msg.type === 'question') {
              return (
                <div key={i} className="ai-chat-bubble ai-chat-bubble--question">
                  {msg.content}
                </div>
              );
            }
            if (msg.type === 'answer') {
              return (
                <div key={i} className="ai-chat-bubble ai-chat-bubble--answer">
                  <span className="ai-chat-answer-icon">
                    <SparkMark />
                  </span>
                  <p>{msg.content}</p>
                </div>
              );
            }
            return (
              <div key={i} className="ai-chat-bubble ai-chat-bubble--error">
                {msg.content}
              </div>
            );
          })}

          {loading && (
            <div className="ai-chat-bubble ai-chat-bubble--answer ai-chat-bubble--loading">
              <span className="ai-chat-answer-icon">
                <SparkMark />
              </span>
              <div className="ai-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {chatHistory.length === 0 && (
        <div className="ai-chat-empty">
          <p className="ai-chat-empty-title">Ask about your chats?</p>
          <p className="ai-chat-empty-sub">
            Ask any question about your conversation and I'll analyse your real messages to answer it.
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="ai-chat-input-area">
        <div className="ai-chat-input-wrapper">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about your conversation..."
            className="ai-chat-input"
            disabled={loading}
          />
          <button 
            className="ai-chat-send-button"
            onClick={handleAsk}
            disabled={!inputQuestion.trim() || loading}
          >
            <span className="ai-chat-send-icon">➤</span>
          </button>
        </div>
        <div className="ai-chat-input-hint">
          <span>Try: "What do we talk about most?" or "Who starts conversations more?"</span>
        </div>
      </div>
    </div>
  );
}