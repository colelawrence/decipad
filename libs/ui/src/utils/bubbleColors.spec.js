import {
  blue100,
  blue200,
  blue600,
  blue700,
  dark200,
  dark400,
  dark600,
  dark700,
  teal100,
  teal200,
  teal600,
  teal800,
} from '../primitives';
import { bubbleColors } from './bubbleColors';

const expectedResults = {
  Catskill: {
    highlighted: {
      darkTheme: {
        backgroundColor: dark700,
        color: dark200,
        magicNumberColor: expect.anything(),
      },
      lightTheme: {
        backgroundColor: teal200,
        color: teal800,
        magicNumberColor: expect.anything(),
      },
    },
    normal: {
      darkTheme: {
        backgroundColor: dark600,
        color: dark200,
        magicNumberColor: dark400,
      },
      lightTheme: {
        backgroundColor: teal100,
        color: teal800,
        magicNumberColor: teal600,
      },
    },
  },
  Malibu: {
    highlighted: {
      darkTheme: {
        backgroundColor: expect.anything(),
        color: expect.anything(),
        magicNumberColor: expect.anything(),
      },
      lightTheme: {
        backgroundColor: blue200,
        color: blue700,
        magicNumberColor: expect.anything(),
      },
    },
    normal: {
      darkTheme: {
        backgroundColor: blue600,
        color: blue100,
        magicNumberColor: dark400,
      },
      lightTheme: {
        backgroundColor: blue100,
        color: blue700,
        magicNumberColor: blue600,
      },
    },
  },
};

describe('bubbleColors', () => {
  Object.keys(expectedResults).forEach((colorName) => {
    const { highlighted, normal } = expectedResults[colorName];
    it(`should match the expected result for ${colorName} (normal) (dark theme)`, () => {
      const { backgroundColor, textColor } = bubbleColors({
        color: colorName,
        isDarkTheme: true,
      });

      expect(backgroundColor).toEqual(normal.darkTheme.backgroundColor);
      expect(textColor).toEqual(normal.darkTheme.color);
    });

    it(`should match the expected result for ${colorName} (normal) (light theme)`, () => {
      const { backgroundColor, textColor } = bubbleColors({
        color: colorName,
        isDarkTheme: false,
      });

      expect(backgroundColor).toEqual(normal.lightTheme.backgroundColor);
      expect(textColor).toEqual(normal.lightTheme.color);
    });

    it(`should match the expected result for ${colorName} (highlighted) (dark theme)`, () => {
      const { backgroundColor, textColor } = bubbleColors({
        color: colorName,
        isDarkTheme: true,
        variant: 'highlighted',
      });

      expect(backgroundColor).toEqual(highlighted.darkTheme.backgroundColor);
      expect(textColor).toEqual(highlighted.darkTheme.color);
    });

    it(`should match the expected result for ${colorName} (highlighted) (light theme)`, () => {
      const { backgroundColor, textColor } = bubbleColors({
        color: colorName,
        isDarkTheme: false,
        variant: 'highlighted',
      });

      expect(backgroundColor).toEqual(highlighted.lightTheme.backgroundColor);
      expect(textColor).toEqual(highlighted.lightTheme.color);
    });
  });
});
