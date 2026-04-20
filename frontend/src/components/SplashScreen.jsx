import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Initializing AI Engine...',
  'Loading NLP Processors...',
  'Calibrating ATS scoring models...',
  'Preparing ResumeIQ...'
];

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Reveal content quickly after mount for a smooth entry
    const enterTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Swap text every 850ms so you have time to comfortably read it
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 850);

    // Start exiting sequence after 3.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3500);

    // Unmount completely after 4 seconds
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(messageInterval);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(1.05)' : 'scale(1)',
      filter: isExiting ? 'blur(10px)' : 'none',
      transition: 'all 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
      pointerEvents: 'auto',
      overflow: 'hidden'
    }}>
      
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(200,240,74,0.06) 0%, rgba(10,10,15,0) 65%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'spin-bg 15s linear infinite',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 40,
        zIndex: 2,
        opacity: isReady ? 1 : 0,
        transform: isReady ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Outer rotating ring */}
          <div style={{
            position: 'absolute',
            inset: -12,
            borderRadius: 26,
            border: '2px solid transparent',
            background: 'linear-gradient(135deg, rgba(200,240,74,0.8), rgba(74,240,200,0.2), transparent, rgba(74,240,200,0.2)) border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'spin-ring 3s linear infinite',
          }} />

          {/* Logo Box */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #c8f04a, #4af0c8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, color: '#0a0a0f',
            boxShadow: '0 10px 40px rgba(200,240,74,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
            animation: 'float 3s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden'
          }}>
            ⚡
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%',
              width: '50%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              transform: 'skewX(-20deg)',
              animation: 'shimmer 2.5s infinite'
            }} />
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20
        }}>
          <span style={{
            fontFamily: 'Fraunces, serif', fontSize: 38,
            fontWeight: 500, color: '#f0f0f5', letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(255,255,255,0.1)'
          }}>
            Resume<span style={{ color: '#c8f04a', fontStyle: 'italic' }}>IQ</span>
          </span>

          {/* Fake Loading Indicator */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 160,
              height: 4,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                background: 'linear-gradient(90deg, #c8f04a, #4af0c8)',
                borderRadius: 4,
                animation: 'load-progress 3.5s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }} />
            </div>
            
            <span 
              key={messageIndex}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                animation: 'text-fade-in 0.3s ease-out forwards'
              }}>
              {LOADING_MESSAGES[messageIndex]}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-bg {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes load-progress {
          0% { width: 0%; }
          30% { width: 40%; }
          70% { width: 85%; }
          100% { width: 100%; }
        }
        @keyframes text-fade-in {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
