import React, { useState, useEffect, useRef } from 'react';
import { Bot, Minus, Expand, X, Paperclip, Mic, Send } from 'lucide-react';
import aiService from '../services/aiService';

const AIChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello ${user?.fname || 'there'}! 👋 I'm your personal assistant. I can help you with your studies, check your progress, or generate roadmaps. How can I help today?` },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleMaximize = () => setIsMaximized(!isMaximized);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMaximized]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    let base64File = null;
    let mimeType = null;

    if (selectedFile) {
      try {
        const fullBase64 = await fileToBase64(selectedFile);
        base64File = fullBase64.split(',')[1];
        mimeType = selectedFile.type;
      } catch (err) {
        console.error("File reading error:", err);
      }
    }

    const userMessage = { 
      role: 'user', 
      text: input.trim(),
      ...(base64File && { file: { data: base64File, mimeType } })
    };

    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    clearFile();
    setIsLoading(true);

    try {
      const response = await aiService.chatWithAI(newMessages);
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I couldn't process that right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend(e);
  };

  // --- Microphone (Speech-to-Text) ---
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support Speech Recognition. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  // --- File Upload UI ---
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Optional: Since full backend upload isn't fully set up yet, 
      // we just show the name visually!
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* AI Chat Popup Window */}
      {isOpen && (
        <div className={`chat-popup-window ${isMaximized ? 'maximized' : ''}`} id="ai-chat-popup">
          <div className="chat-popup-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="avatar" style={{ width: "35px", height: "35px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: '20px' }}>
                🤖
              </div>
              <div>
                <h4 style={{ color: "#fff", margin: 0, fontSize: "1rem", fontFamily: "var(--font)" }}>StudySpark AI</h4>

              </div>
            </div>
            <div className="chat-controls">
              <button className="control-btn" id="minimize-chat-popup" title="Minimize" onClick={() => setIsOpen(false)}>
                <Minus size={16} />
              </button>
              <button className="control-btn" id="maximize-chat-popup" title="Maximize" onClick={toggleMaximize}>
                <Expand size={14} />
              </button>
              <button className="close-chat-btn" id="close-chat-popup" title="Close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chat-popup-body" id="chat-popup-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai-message'}`}>
                {msg.file && (
                  msg.file.mimeType && msg.file.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${msg.file.mimeType};base64,${msg.file.data}`} 
                      alt="Uploaded attachment" 
                      style={{ 
                        display: 'block',
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        objectFit: 'cover',
                        borderRadius: '10px', 
                        marginBottom: msg.text ? '8px' : '0', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }}
                    />
                  ) : (
                    <div style={{ 
                      marginBottom: msg.text ? '8px' : '0', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Paperclip size={14} /> 
                      <span>{msg.file.mimeType && msg.file.mimeType.includes('pdf') ? 'PDF Document' : 'File Attachment'}</span>
                    </div>
                  )
                )}
                {msg.text && <p>{msg.text}</p>}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-popup-footer">
            {/* File Preview Area */}
            {selectedFile && (
              <div id="chat-file-preview" className="chat-file-preview" style={{ padding: '8px 12px', background: 'var(--surface3)', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={14} /> {selectedFile.name}
                </span>
                <button onClick={clearFile} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            )}

            <div className="chat-input-wrapper">
              <input 
                type="file" 
                id="chat-file-input" 
                hidden 
                accept="image/png, image/jpeg, image/webp, application/pdf" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <button id="chat-attach-btn" title="Attach Image or PDF" onClick={handleAttachClick}>
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                id="ai-popup-input"
                placeholder="Ask anything..."
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <button 
                id="chat-mic-btn" 
                title="Speak" 
                onClick={toggleListening}
                style={{ color: isListening ? 'var(--red)' : '' }}
              >
                <Mic size={18} className={isListening ? 'pulse' : ''} />
              </button>

              <button id="ai-popup-send" title="Send" onClick={handleSend} disabled={(!input.trim() && !selectedFile) || isLoading}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Floating Widget Toggle */}
      {!isOpen && (
        <div className="ai-widget-container">
          <button className="ai-toggle-btn" id="ai-widget-toggle" onClick={toggleChat} style={{ fontSize: '24px' }}>
            🤖
          </button>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
