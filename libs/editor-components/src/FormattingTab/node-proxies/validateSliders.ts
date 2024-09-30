type SliderMinMaxStep = { min: number; max: number; step: number };
type SliderValidationResult = Partial<Record<'min' | 'max' | 'step', string>>;

export const validateSliders = (
  sliders: SliderMinMaxStep[]
): SliderValidationResult => {
  const highestMin = Math.max(...sliders.map((s) => s.min));
  const lowestMax = Math.min(...sliders.map((s) => s.max));
  const lowestRange = Math.min(...sliders.map((s) => s.max - s.min));

  const errors: SliderValidationResult = {};
  let gotNonPositiveStepError = false;

  for (const { min, max, step } of sliders) {
    if (min >= max) {
      errors.min = `Must be lower than ${lowestMax}`;
      errors.max = `Must be bigger than ${highestMin}`;
    }

    if (step <= 0) {
      gotNonPositiveStepError = true;
      errors.step = 'Must be bigger than 0';
    }

    if (!gotNonPositiveStepError && lowestRange >= 1 && step > max - min) {
      errors.step = `Must be lower than ${lowestRange}`;
    }
  }

  return errors;
};
