import React, { useState, useEffect } from 'react';
import './Navbar1.css';

interface NavbarProps {
  appTitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ appTitle = 'CareHub' }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getOccasion = (): string => {
    const hour = currentTime.getHours();
    if (hour < 12) return ' Good Morning';
    if (hour < 17) return ' Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  const formatDate = (): string => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (): string => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="header-section">
      <div className="date-time-info">
        <div className="title-wrapper">
          <h2 className="app-title">{appTitle}</h2>
        </div>
        <div className="datetime-display">
          <span className="occasion-badge">{getOccasion()}</span>
          <span className="date">{formatDate()}</span>
          <span className="time">{formatTime()}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
