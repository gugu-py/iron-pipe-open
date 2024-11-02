import React from 'react';

export const Input = ({ messageInput, setMessageInput, sendMessage, handleKeyPress, isConnected, canSendMessage }) => {
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setMessageInput(value);
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={messageInput}
        onChange={handleInputChange} // Updated to use the new handler
        onKeyPress={handleKeyPress}
        placeholder="Enter meme name or 'drop'"
        className="input-field"
        disabled={!isConnected}
      />
      <button
        onClick={sendMessage}
        className={`send-button ${!isConnected || !canSendMessage ? 'disabled' : ''}`}
        disabled={!isConnected || !canSendMessage}
      >
        Send
      </button>
    </div>
  );
};
