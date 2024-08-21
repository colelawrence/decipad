const easeInOutCubic = (t: number) => {
  return 3 * t * t - 2 * t * t * t;
};

const DURATION = 150;

export const closeDataDrawerAnimation = (
  startHeight: number,
  setHeight: (height: number) => void,
  reset: () => void
): void => {
  const startTime = performance.now();

  const loop = () => {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / DURATION;

    const t = Math.min(elapsedTime, 1);
    const easedT = easeInOutCubic(t);

    const currentValue = Math.round(startHeight * (1 - easedT));

    setHeight(currentValue);

    if (t < 1) {
      window.requestAnimationFrame(loop);
      return;
    }

    reset();
  };

  loop();
};
