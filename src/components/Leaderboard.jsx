import React, { useState, useEffect } from "react";
import { usePlayersList } from "playroomkit";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSomeValue } from '../../slices/yourSlice';

export const Leaderboard = () => {
  const players = usePlayersList(true);
  const [timer, setTimer] = useState(300); // Initial timer value in seconds (5 minutes)
  const dispatch = useDispatch();
  const someValue = useSelector(state => state.yourSlice.someValue);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    dispatch(setSomeValue(players));
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave? If you leave the game the betting amount won't be refunded.";
      event.returnValue = message; // Standard for most browsers
      return message; // For some older browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    if (!storedStartTime) {
      const startTime = Date.now();
      localStorage.setItem("startTime", startTime);
    }

    const intervalId = setInterval(() => {
      const startTime = localStorage.getItem("startTime");
      if (startTime) {
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        const timeLeft = Math.max(300 - timeElapsed, 0);
        setTimer(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(intervalId);
          localStorage.setItem("gameOver", 'true');
          handleButtonClick();
          navigate('/result');
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate, handleButtonClick]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 1 && remainingSeconds < 1) {
      const obj = document.getElementById("timer_con");
      if (obj) {
        obj.style.backgroundColor = 'rgba(182, 47, 47, 0.99)';
        obj.style.padding = '4px 11px';
        obj.style.borderRadius = '9px';
        obj.style.fontFamily = 'cursive';
        obj.style.fontWeight = 'bold';
        obj.style.boxShadow = '0px 0px 20px 20px #ff000059';
        obj.style.border = '2px solid rgb(252, 38, 68)';
        obj.style.transition = 'background-color 0.5s ease-in-out';
      }
    }
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 p-4 flex z-10 gap-4">
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', top: '11%', position: "fixed" }}>
          <p id="timer_con" style={{ backgroundColor: '#75b0feab', padding: '4px 11px', borderRadius: '9px', fontFamily: 'cursive', fontWeight: 'bold', border: '2px solid #2682fc' }}>
            Time: {formatTime(timer)}
          </p>
        </div>

        {players.map((player) => (
          <div
            key={player.id}
            className={`bg-opacity-60 backdrop-blur-sm flex items-center rounded-lg gap-2 p-2 min-w-[140px]`}
            style={{ backgroundColor: '#75B0FE' }}
          >
            <img
              src={player.state.profile?.photo || ""}
              className="w-10 h-10 border-2 rounded-full"
              style={{
                borderColor: player.state.profile?.color,
              }}
            />
            <div className="flex-grow">
              <h2 className={`font-bold text-sm`}>
                {player.state.profile?.name}
              </h2>
              <div className="flex text-sm items-center gap-4">
                <p>🔫 {player.state.kills}</p>
                <p>💀 {player.state.deaths}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="fixed top-4 right-4 z-10 text-white"
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </button>
    </>
  );
};
