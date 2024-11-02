import React from 'react';
import { motion } from 'framer-motion';

export const Chat = ({ messages }) => {
  // Limit messages to the latest 10
  const limitedMessages = messages.slice(-10);

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat</h2>
      <div>
        {limitedMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="chat-message"
          >
            <strong style={{ color: '#00aaff' }}>{msg.username}:</strong> {msg.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
