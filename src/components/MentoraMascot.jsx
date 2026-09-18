import React from "react";

export default function PoliceRobotMascot(props) {
  const size = 400; 
  
  const height = size; 

  return (
    <>
      <style>{`
        /* Mascot ki smooth floating */
        @keyframes floatBot {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(12px) rotate(1deg); }
        }

        /* Shadow ki perfect pulsing center mein */
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50%      { transform: translateX(-50%) scale(0.8); opacity: 0.2; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.2); }
        }

        .bot-container {
          position: relative;
          width: ${size}px;
          height: ${height}px;
          margin: 0 auto; /* Center karne ke liye */
        }

        .bot-image-wrap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: floatBot 4s ease-in-out infinite;
          z-index: 10;
        }

        .bot-image {
          width: 85%; /* Thora adjust kiya taake bounds ke andar rahe */
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0px 15px 20px rgba(0, 0, 0, 0.4));
        }

        .bot-ground-shadow {
          position: absolute;
          bottom: 22%; /* <--- YAHAN SE SHADOW KO UPAR KIYA HAI */
          left: 50%;
          transform: translateX(-50%); /* Bilkul center mein rakhne ke liye */
          width: 45%;
          height: 14px;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 70%);
          animation: shadowPulse 4s ease-in-out infinite;
          z-index: 1;
        }

        .star {
          position: absolute;
          animation: twinkle 3s ease-in-out infinite;
          user-select: none;
          z-index: 12; /* Stars ko image ke upar/sath laane ke liye */
        }
        
        /* Stars ko bilkul robot ke paas kar diya */
        .s1 { top: 25%; left: 25%; font-size: 24px; color: #FFD700; text-shadow: 0 0 10px #FFD700; animation-delay: 0s; }
        .s2 { top: 32%; right: 26%; font-size: 20px; color: #87CEFA; text-shadow: 0 0 10px #87CEFA; animation-delay: 1s; }
        .s3 { top: 52%; left: 26%; font-size: 16px; color: #FFF; text-shadow: 0 0 8px #FFF; animation-delay: 2s; }
        .s4 { top: 18%; right: 30%; font-size: 22px; color: #FFD700; text-shadow: 0 0 10px #FFD700; animation-delay: 0.5s; }
        .s5 { bottom: 35%; right: 28%; font-size: 18px; color: #FFF; text-shadow: 0 0 8px #FFF; animation-delay: 1.5s; }
        .s6 { bottom: 42%; left: 22%; font-size: 20px; color: #87CEFA; text-shadow: 0 0 10px #87CEFA; animation-delay: 0.8s; }
      `}</style>

      <div className="bot-container">
        {/* Shiny Stars */}
        <div className="star s1">✦</div>
        <div className="star s2">✦</div>
        <div className="star s3">✨</div>
        <div className="star s4">✨</div>
        <div className="star s5">✦</div>
        <div className="star s6">✨</div>

        {/* Mascot PNG */}
        <div className="bot-image-wrap">
          <img 
            src="/mascot.png" 
            alt="Police Robot Mascot" 
            className="bot-image" 
          />
        </div>

        {/* Real-time scaling shadow */}
        <div className="bot-ground-shadow"></div>
      </div>
    </>
  );
}