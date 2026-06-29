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

export default function AIInsightsChat({
  messageStats,
  activityStats,
  responseStats,
  wordStats,
  emojiStats,
  mediaStats,
  messages,
}: AIInsightsChatProps) {
  const { ask, answer, loading, error, reset } = useGrok();
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
          <span className="ai-chat-avatar">✨</span>
          <div>
            <p className="ai-chat-title">Ask AI</p>
            <p className="ai-chat-subtitle">Powered by your real data</p>
          </div>
        </div>
        <span className="ai-chat-badge">Groq</span>
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
                  <span className="ai-chat-answer-icon">✨</span>
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
              <span className="ai-chat-answer-icon">✨</span>
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
          <p className="ai-chat-empty-title">Your chat, decoded 🔍</p>
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
          <span>💡 Try: "What do we talk about most?" or "Who starts conversations more?"</span>
        </div>
      </div>
    </div>
  );
}