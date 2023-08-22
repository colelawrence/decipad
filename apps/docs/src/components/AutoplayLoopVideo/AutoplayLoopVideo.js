import React, { useEffect, useRef, useState } from 'react';
import './AutoplayLoopVideo.css';

const AutoplayLoopVideo = ({ src, playbackSpeed }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.playbackRate = playbackSpeed || 1;

    const handleVideoClick = () => {
      setIsZoomed(!isZoomed);
    };

    const handleContainerClick = (event) => {
      if (event.target === containerRef.current) {
        setIsZoomed(false);
      }
    };

    videoElement.addEventListener('click', handleVideoClick);
    containerRef.current.addEventListener('click', handleContainerClick);

    return () => {
      videoElement.removeEventListener('click', handleVideoClick);
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeEventListener('click', handleContainerClick);
      }
    };
  }, [playbackSpeed, isZoomed]);

  useEffect(() => {
    const bodyElement = document.body;
    bodyElement.style.overflow = isZoomed ? 'hidden' : 'auto';

    return () => {
      bodyElement.style.overflow = 'auto';
    };
  }, [isZoomed]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (isZoomed) {
      videoElement.classList.add('fade-in');
    } else {
      videoElement.classList.remove('fade-in');
    }
  }, [isZoomed]);

  const handlePlayPause = () => {
    const videoElement = videoRef.current;

    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`video-container ${isZoomed ? 'zoomed' : ''}`}
    >
      <video
        ref={videoRef}
        className={`video-element  ${isZoomed ? 'zoomed' : ''}`}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Play/Stop button */}
      <button className="play-stop-button" onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AutoplayLoopVideo;

/* {
Example
import AutoplayLoopVideo from '@site/src/components/AutoplayLoopVideo/AutoplayLoopVideo';
<AutoplayLoopVideo src="/docs/video/VideoTest.mov" playbackSpeed={1}/>
} */
