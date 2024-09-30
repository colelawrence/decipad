import { describe, expect, it } from 'vitest';
import { validateSliders } from './validateSliders';

const simpleValidSlider = { min: 0, max: 10, step: 1 };
const highMinValidSlider = { min: 50, max: 60, step: 1 };
const lowMaxValidSlider = { min: -60, max: -50, step: 1 };
const shortRangeValidSlider = { min: 4, max: 6, step: 1 };
const largeStepValidSlider = { min: 0, max: 10, step: 10 };
const equalMinMaxInvalidSlider = { min: 10, max: 10, step: 1 };
const invertedMinMaxInvalidSlider = { min: 11, max: 10, step: 1 };
const zeroStepInvalidSlider = { min: 0, max: 10, step: 0 };
const negativeStepInvalidSlider = { min: 0, max: 10, step: -1 };
const largeStepInvalidSlider = { min: 0, max: 10, step: 11 };

const validSliders = [
  simpleValidSlider,
  highMinValidSlider,
  lowMaxValidSlider,
  shortRangeValidSlider,
  largeStepValidSlider,
];

const invalidSliders = [
  equalMinMaxInvalidSlider,
  invertedMinMaxInvalidSlider,
  zeroStepInvalidSlider,
  negativeStepInvalidSlider,
  largeStepInvalidSlider,
];

const allSliders = [...validSliders, ...invalidSliders];

describe('validateSliders', () => {
  it('returns no errors for valid sliders', () => {
    expect(validateSliders(validSliders)).toEqual({});
  });

  describe('when min and max are equal', () => {
    it('returns an error', () => {
      expect(validateSliders([equalMinMaxInvalidSlider])).toEqual({
        min: `Must be lower than ${equalMinMaxInvalidSlider.max}`,
        max: `Must be bigger than ${equalMinMaxInvalidSlider.min}`,
      });
    });

    it('uses the lowest min and highest max in its error messages', () => {
      const sliders = [
        highMinValidSlider,
        equalMinMaxInvalidSlider,
        lowMaxValidSlider,
      ];
      expect(validateSliders(sliders)).toEqual({
        min: `Must be lower than ${lowMaxValidSlider.max}`,
        max: `Must be bigger than ${highMinValidSlider.min}`,
      });
    });
  });

  describe('when min is greater than max', () => {
    it('returns an error', () => {
      expect(validateSliders([invertedMinMaxInvalidSlider])).toEqual({
        min: `Must be lower than ${invertedMinMaxInvalidSlider.max}`,
        max: `Must be bigger than ${invertedMinMaxInvalidSlider.min}`,
      });
    });

    it('uses the lowest min and highest max in its error messages', () => {
      const sliders = [
        highMinValidSlider,
        invertedMinMaxInvalidSlider,
        lowMaxValidSlider,
      ];
      expect(validateSliders(sliders)).toEqual({
        min: `Must be lower than ${lowMaxValidSlider.max}`,
        max: `Must be bigger than ${highMinValidSlider.min}`,
      });
    });
  });

  describe('when the step is zero', () => {
    it('returns an error', () => {
      expect(validateSliders([zeroStepInvalidSlider])).toEqual({
        step: 'Must be bigger than 0',
      });
    });
  });

  describe('when the step is negative', () => {
    it('returns an error', () => {
      expect(validateSliders([negativeStepInvalidSlider])).toEqual({
        step: 'Must be bigger than 0',
      });
    });
  });

  describe('when the step is larger than the range', () => {
    it('returns an error', () => {
      expect(validateSliders([largeStepInvalidSlider])).toEqual({
        step: `Must be lower than ${
          largeStepInvalidSlider.max - largeStepInvalidSlider.min
        }`,
      });
    });

    it('uses the lowest range in its error message', () => {
      expect(
        validateSliders([largeStepInvalidSlider, shortRangeValidSlider])
      ).toEqual({
        step: `Must be lower than ${
          shortRangeValidSlider.max - shortRangeValidSlider.min
        }`,
      });
    });
  });

  describe('when one slider has a zero step and another has a step larger than its range', () => {
    describe('when zero step is first', () => {
      it('returns the zero error only', () => {
        expect(
          validateSliders([zeroStepInvalidSlider, largeStepInvalidSlider])
        ).toEqual({
          step: 'Must be bigger than 0',
        });
      });
    });

    describe('when large step is first', () => {
      it('returns the zero error only', () => {
        expect(
          validateSliders([largeStepInvalidSlider, zeroStepInvalidSlider])
        ).toEqual({
          step: 'Must be bigger than 0',
        });
      });
    });
  });

  describe('when there is a mixture of errors', () => {
    it('reports errors for all fields', () => {
      expect(validateSliders(allSliders)).toEqual({
        min: `Must be lower than ${lowMaxValidSlider.max}`,
        max: `Must be bigger than ${highMinValidSlider.min}`,
        step: 'Must be bigger than 0',
      });
    });
  });
});
