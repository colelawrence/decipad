import { useCallback, useEffect, useRef, useState } from 'react';

export const useFramerate = (windowWidth: number) => {
  const prevValues = useRef<number[]>([]);
  const frames = useRef(0);
  const prevTime = useRef(performance.now());
  const animRef = useRef(0);
  const [framerate, setFramerate] = useState<number[]>([]);

  const calcFramerate = useCallback(() => {
    const t = performance.now();

    frames.current += 1;

    if (t > prevTime.current + 1000) {
      const elapsedTime = t - prevTime.current;

      const currentFramerate = Math.round(
        (frames.current * 1000) / elapsedTime
      );

      prevValues.current = prevValues.current.concat(currentFramerate);

      if (elapsedTime > 1500) {
        for (let i = 1; i <= (elapsedTime - 1000) / 1000; i++) {
          prevValues.current = prevValues.current.concat(0);
        }
      }

      prevValues.current = prevValues.current.slice(
        Math.max(prevValues.current.length - windowWidth, 0)
      );

      setFramerate(prevValues.current);

      frames.current = 0;
      prevTime.current = performance.now();
    }

    animRef.current = requestAnimationFrame(calcFramerate);
  }, [windowWidth]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(calcFramerate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [calcFramerate]);

  const avgFramerate = (
    framerate.reduce((a, b) => a + b, 0) / framerate.length
  ).toFixed(2);
  const maxFramerate = Math.max.apply(Math.max, framerate);
  const currentFramerate = framerate[framerate.length - 1];

  return { framerate, avgFramerate, maxFramerate, currentFramerate };
};
