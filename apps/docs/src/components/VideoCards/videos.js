import React, { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, thumbnailUrl }) => {
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const onYouTubePlayerAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            setPlayerLoaded(true);
          },
        },
      });
    };

    // Check if the YouTube Player API script is already loaded
    if (window.YT && typeof window.YT.Player === 'function') {
      onYouTubePlayerAPIReady();
    } else {
      // Load the YouTube Player API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/player_api';

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Assign a global function for the YouTube Player API to call
      window.onYouTubePlayerAPIReady = onYouTubePlayerAPIReady;
    }

    // Clean up the global function when the component is unmounted
    return () => {
      delete window.onYouTubePlayerAPIReady;
    };
  }, [videoId]);

  const playVideo = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();

      const thumbnail = document.getElementById('youtube-thumbnail');
      const player = document.getElementById('youtube-player');

      if (thumbnail && player) {
        thumbnail.style.display = 'none';
        player.style.display = 'block';
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = (containerWidth / 16) * 9; // 16:9 aspect ratio
      containerRef.current.style.height = `${containerHeight}px`;
    };

    handleResize(); // Set initial height

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        position: 'relative',
        height: 0,
        paddingTop: '56.25%', // 16:9 aspect ratio (9 / 16 = 0.5625 or 56.25%)
        overflow: 'hidden',
        backgroundColor: '#E5E9F0',
        borderRadius: '18px',
        border: '1px solid #ECF0F6',
      }}
    >
      <div
        id="youtube-thumbnail"
        onClick={playVideo}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundImage: `url('${thumbnailUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
        }}
      />
      <div
        id="youtube-player"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: playerLoaded ? 'block' : 'none',
          borderRadius: '24px',
        }}
      />
      <div className="triangle"></div>
      <style>
        {`
#youtube-thumbnail::after {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15%;
  padding-bottom: 15%;
  background-image: url("data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 182 182' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='91' cy='91' r='91' fill='%23E5E9F0' fill-opacity='0.8'/%3E%3Ccircle cx='91.5' cy='91.5' r='81.5' fill='%23F5F7FA'/%3E%3Cpath d='M125 84.5718C130.333 87.651 130.333 95.349 125 98.4282L80.75 123.976C75.4167 127.055 68.75 123.206 68.75 117.048L68.75 65.9522C68.75 59.7938 75.4167 55.9448 80.75 59.024L125 84.5718Z' fill='%23363F4D'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  transition: transform 0.3s;
}

#youtube-thumbnail:hover::after {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.YTPlayer svg.ytp-chrome-bottom {
  display: none !important;
}

.YTPlayer svg.ytp-share-button-visible {
  display: none !important;
}
        `}
      </style>
    </div>
  );
};

export default YouTubePlayer;
