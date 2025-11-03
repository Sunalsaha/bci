import React, { useState, useEffect, useRef } from 'react';
import Navbar from './navbar';
import './AccessibleDashboard.css';


interface CareOption {
  id: number;
  gif: string;
  label: string;
  color: string;
  urgent?: boolean;
}


const AccessibleDashboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showBuzzerFeedback, setShowBuzzerFeedback] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [clickFeedback, setClickFeedback] = useState<{ x: number; y: number } | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fullscreenInitiated, setFullscreenInitiated] = useState<boolean>(false);
  const lastClickTime = useRef<number>(0);
 const doubleClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);



  // Games URL constant
  const GAMES_URL = 'https://www.gamearter.com/game/evo-f4/';


  const careOptions: CareOption[] = [
    { id: 1, gif: '/emer.gif', label: 'Emergency', color: '#ff0000ff', urgent: true },
    { id: 2, gif: '/doct.gif', label: 'Doctor', color: '#0040ffff' },
    { id: 3, gif: '/oxygen.gif', label: 'Oxygen', color: '#00fff7ff' },
    { id: 4, gif: '/Itching.gif', label: 'Itching', color: '#ff0080ff' },
    { id: 5, gif: '/toilet.gif', label: 'Toilet', color: '#ffff05ff' },
    { id: 6, gif: '/potty.gif', label: 'Potty', color: '#ff9500ff' },
    { id: 7, gif: '/water.gif', label: 'Water', color: '#00ffddff' },
    { id: 8, gif: '/food.gif', label: 'Food', color: '#00ff37ff' },
    { id: 9, gif: '/med.gif', label: 'Medicine', color: '#6fff00ff' },
    { id: 10, gif: '/Position.gif', label: 'Position', color: '#3500a0ff' },
    { id: 11, gif: '/temp.gif', label: 'Temperature', color: '#ffa600ff' },
    { id: 12, gif: '/games.gif', label: 'games', color: '#b2209fff' }
  ];


  const anglePerItem = 360 / careOptions.length;


  // FIXED: Fullscreen triggered on first click
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setFullscreenInitiated(true);
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
  };


  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozFullScreenElement) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msFullscreenElement) {
        await (document as any).msExitFullscreen();
      }
      setFullscreenInitiated(false);
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
    }
  };


  const playBuzzerSound = (): void => {
    setShowBuzzerFeedback(true);
    setTimeout(() => setShowBuzzerFeedback(false), 800);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 1200;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);

      const duration = 0.5;
      const frequency = 15;

      for (let i = 0; i < frequency; i++) {
        const time = audioContext.currentTime + (i / frequency) * duration;
        gainNode.gain.setValueAtTime(0.4, time);
        gainNode.gain.setValueAtTime(0, time + duration / (frequency * 2));
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };


  const rotateWheel = (direction: 'right' | 'left'): void => {
    if (isAnimating) return;
    setIsAnimating(true);

    let newIndex = currentIndex;
    let newRotation = rotation;

    if (direction === 'right') {
      newIndex = (currentIndex + 1) % careOptions.length;
      newRotation = rotation - anglePerItem;
    } else if (direction === 'left') {
      newIndex = (currentIndex - 1 + careOptions.length) % careOptions.length;
      newRotation = rotation + anglePerItem;
    }

    setCurrentIndex(newIndex);
    setRotation(newRotation);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };


  // FIXED: Fullscreen triggered on first click
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Enter fullscreen on first click if not already done
    if (!fullscreenInitiated) {
      enterFullscreen();
      return;
    }

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime.current;

    setClickFeedback({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickFeedback(null), 600);

    if (timeDiff < 400) {
      if (doubleClickTimeout.current) {
        clearTimeout(doubleClickTimeout.current);
        doubleClickTimeout.current = null;
      }
      handleDoubleClick();
    } else {
      doubleClickTimeout.current = setTimeout(() => {
        rotateWheel('right');
      }, 200);
    }

    lastClickTime.current = currentTime;
  };


  const handleDoubleClick = (): void => {
    const currentOption = careOptions[currentIndex];
    
    if (currentOption.label.toLowerCase() === 'games') {
      window.open(GAMES_URL, '_blank', 'noopener,noreferrer');
    } else {
      playBuzzerSound();
    }
  };


  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };


  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        rotateWheel('right');
      } else {
        rotateWheel('left');
      }
    }

    setTouchStart(null);
  };


  const currentOption = careOptions[currentIndex];


  return (
    <div
      className="accessible-care-container"
      onClick={handlePageClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="main"
      aria-label="Care hub 3D circular carousel with swipeable options"
    >
      <Navbar appTitle="CareHub" />

      {showInstructions && (
        <div className="instructions-overlay">
          <div className="instructions-box">
            <h2>Welcome to CareHub</h2>
            <p>👆 Click to Enter Fullscreen</p>
            <p>👆 Single Click = Rotate Wheel</p>
            <p>👆👆 Double Click = Call Buzzer</p>
            <p>👈 Swipe = Rotate Wheel</p>
          </div>
        </div>
      )}

      {clickFeedback && (
        <div
          className="click-ripple"
          style={{
            left: clickFeedback.x,
            top: clickFeedback.y,
          }}
        />
      )}

      <main className="main-content">
        <div className="wheel-container">
          <div className="perspective-wrapper">
            <div
              className={`circular-wheel ${isAnimating ? 'animating' : ''}`}
              style={{
                transform: `rotateY(${rotation}deg)`,
              }}
            >
              {careOptions.map((option, idx) => {
                const itemAngle = idx * anglePerItem;
                return (
                  <div
                    key={option.id}
                    className="wheel-item-3d"
                    style={{
                      transform: `rotateY(${itemAngle}deg) translateZ(500px)`,
                    }}
                  >
                    <div
                      className={`care-circle ${idx === currentIndex ? 'active' : ''}`}
                      style={{
                        borderColor: option.color,
                        background:
                          idx === currentIndex
                            ? `radial-gradient(circle at 40% 40%, ${option.color}66, ${option.color}22)`
                            : `radial-gradient(circle at 30% 30%, ${option.color}44, ${option.color}11)`,
                      }}
                    >
                      <div className={`circle-gif ${idx === currentIndex ? 'main-gif' : ''}`}>
                        <img src={option.gif} alt={option.label} />
                      </div>
                      <div className="circle-label">{option.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showBuzzerFeedback && (
            <div className="buzzer-feedback-center">
              <div className="pulse-ring" style={{ borderColor: currentOption.color }}></div>
              <div
                className="pulse-ring"
                style={{ borderColor: currentOption.color, animationDelay: '0.15s' }}
              ></div>
            </div>
          )}
        </div>
      </main>

      <div className="progress-indicator">
        {careOptions.map((option, idx) => (
          <div
            key={option.id}
            className={`progress-dot ${idx === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};


export default AccessibleDashboard;
