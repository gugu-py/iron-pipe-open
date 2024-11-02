import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Animations = ({ isConnected, showDropAnimation, memeName }) => (
  <>
    {/* Connecting Animation */}
    {!isConnected && (
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '100px' }}
        >
          🔄 {/* A rotating refresh emoji */}
        </motion.div>
        <p>Connecting to server...</p>
      </div>
    )}

    {/* Drop Emoji Animation */}
    <AnimatePresence>
      {showDropAnimation && (
        <motion.div
          key="dropEmoji"
          initial={{ y: -100 }}
          animate={{ y: window.innerHeight }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '200px',
          }}
        >
          🔧 {/* Iron pipe or hammer emoji */}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Meme Name Pop-up */}
    <AnimatePresence>
      {memeName && (
        <motion.div
          key="memeName"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '40px',
            borderRadius: '20px',
            fontSize: '48px',
          }}
        >
          {memeName}
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
