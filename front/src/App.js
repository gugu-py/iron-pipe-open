import React, { useState, useEffect, useRef } from 'react';
import { Chat } from './Chat';
import { Input } from './Input';
import { Animations } from './Animations';
import './styles.css'; // Import the CSS file
import { motion, AnimatePresence } from 'framer-motion';

const MemeStreamer = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [showDropAnimation, setShowDropAnimation] = useState(false);
  const [memeName, setMemeName] = useState('');
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const [canSendMessage, setCanSendMessage] = useState(true);

  useEffect(() => {
    const ws = new WebSocket('ws://your_api_url:8000/ws');
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    return () => {
      if (ws) {
        ws.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    const { type, username, message, sound_url } = data;

    setMessages((prevMessages) => [...prevMessages, { username, message }]);
    clearTimeout(timeoutRef.current);

    if (type === 'meme' && sound_url) {
      playSound(sound_url, message, 5000);
    } else if (type === 'drop') {
      playDropSound(sound_url);
    }
  };

  const playSound = (url, message, duration) => {
    const memeAudio = new Audio(url);
    audioRef.current = memeAudio;
    memeAudio.play().catch((error) => console.error('Error playing meme audio:', error));

    setMemeName(message);
    setTimeout(() => setMemeName(''), 10000);

    timeoutRef.current = setTimeout(() => {
      memeAudio.pause();
      memeAudio.currentTime = 0;
    }, duration);
  };

  const playDropSound = (url) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const dropAudio = new Audio(url);
    audioRef.current = dropAudio;
    dropAudio.play().catch((error) => console.error('Error playing drop audio:', error));
    setShowDropAnimation(true);

    setTimeout(() => setShowDropAnimation(false), 2000);
  };

  const sendMessage = () => {
    if (canSendMessage && socket && isConnected && socket.readyState === WebSocket.OPEN && messageInput.trim()) {
      const messageData = { username: '', message: messageInput.trim() };
      socket.send(JSON.stringify(messageData));
      setMessageInput('');
      setCanSendMessage(false);

      setTimeout(() => setCanSendMessage(true), 1500);
    } else {
      console.warn('WebSocket is not connected or cooldown active. Cannot send message.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <h1>Meme Live Stream</h1>
        <a href='/instruction'>what is this</a>

        <Animations isConnected={isConnected} showDropAnimation={showDropAnimation} memeName={memeName} />

        {/* Meme Name Pop-up */}
        <AnimatePresence>
          {memeName && (
            <motion.div
              key="memeName"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="meme-popup"
            >
              {memeName}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Messages */}
      <Chat messages={messages} />

      {/* Input Field */}
      <Input
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
        isConnected={isConnected}
        canSendMessage={canSendMessage}
      />
    </div>
  );
};

export default MemeStreamer;
