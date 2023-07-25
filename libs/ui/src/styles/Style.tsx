import { Global } from '@emotion/react';
import { FC, useMemo } from 'react';
import { themeStore } from '@decipad/react-contexts';
import {
  blue100,
  blue200,
  blue500,
  blue600,
  blue700,
  blue800,
  brand200,
  brand300,
  brand400,
  brand600,
  brand700,
  brand800,
  orange100,
  orange200,
  orange500,
  orange600,
  orange700,
  orange800,
  purple100,
  purple200,
  purple500,
  purple600,
  purple700,
  purple800,
  red100,
  red50,
  red500,
  red600,
  red700,
  red800,
  setCssVar,
  teal100,
  teal200,
  teal500,
  teal600,
  teal700,
  teal800,
  yellow100,
  yellow200,
  yellow300,
  yellow500,
  yellow600,
  yellow700,
  yellow800,
} from '../primitives';
import { AvailableSwatchColor } from '../utils';

type ColorPalette = {
  Text: {
    Subdued: string;
    Default: string;
  };
  Background: {
    Subdued: string;
    Default: string;
    Heavy: string;
  };
};

type ThemeColorObject = {
  Light: ColorPalette;
  Dark: ColorPalette;
};

type Themes =
  | 'Teal'
  | 'Brand'
  | 'Blue'
  | 'Red'
  | 'Orange'
  | 'Purple'
  | 'Yellow';

type ThemeColorsType = Record<Themes, ThemeColorObject>;

/**
 * Component rendered alongside the editor to apply the global theme CSS Variables.
 * These variables change depending on the editor icon color, and also if the app is in
 * light/dark mode.
 */
export const GlobalThemeStyles: FC<{ color: AvailableSwatchColor }> = ({
  color,
}) => {
  const isDarkMode = themeStore((store) => store.theme);
  const mode = isDarkMode ? 'Dark' : 'Light';

  const ThemeColor = useMemo<keyof typeof ThemeColors>(
    () => translateOldThemeColor(color),
    [color]
  );

  return (
    <Global
      styles={{
        ':root': {
          ...setCssVar(
            'themeTextSubdued',
            ThemeColors[ThemeColor][mode].Text.Subdued
          ),
          ...setCssVar(
            'themeTextDefault',
            ThemeColors[ThemeColor][mode].Text.Default
          ),
          ...setCssVar(
            'themeBackgroundSubdued',
            ThemeColors[ThemeColor][mode].Background.Subdued
          ),
          ...setCssVar(
            'themeBackgroundDefault',
            ThemeColors[ThemeColor][mode].Background.Default
          ),
          ...setCssVar(
            'themeBackgroundHeavy',
            ThemeColors[ThemeColor][mode].Background.Heavy
          ),
        },
      }}
    />
  );
};

/**
 * Returns the new theme colors based on old theme names (Catskill, Malibu, etc...)
 */
export function translateOldThemeColor(
  color: AvailableSwatchColor
): keyof typeof ThemeColors {
  switch (color) {
    case 'Catskill':
      return 'Teal';
    case 'Sulu':
      return 'Brand';
    case 'Sun':
      return 'Yellow';
    case 'Grapefruit':
      return 'Orange';
    case 'Rose':
      return 'Red';
    case 'Malibu':
      return 'Blue';
    case 'Perfume':
      return 'Purple';
  }
}

/**
 * Returns the color palette, with the correct dark or light mode.
 */
export function getThemeColor(swatchColor: AvailableSwatchColor): ColorPalette {
  const theme = translateOldThemeColor(swatchColor);
  const { theme: isDarkMode } = themeStore.getState();

  return ThemeColors[theme][isDarkMode ? 'Dark' : 'Light'];
}

/**
 * Global object containing the different themes in our app.
 * These are not themselves CSS Variables, but are used to SET the CSS Variables.
 */
export const ThemeColors: ThemeColorsType = {
  Teal: {
    Light: {
      Text: {
        Subdued: teal600.hex,
        Default: teal800.hex,
      },
      Background: {
        Subdued: teal100.hex,
        Default: teal100.hex,
        Heavy: teal200.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: teal500.hex,
        Default: teal200.hex,
      },
      Background: {
        Subdued: teal800.hex,
        Default: teal800.hex,
        Heavy: teal700.hex,
      },
    },
  },

  Brand: {
    Light: {
      Text: {
        Subdued: brand700.hex,
        Default: brand800.hex,
      },
      Background: {
        Subdued: brand200.hex,
        Default: brand300.hex,
        Heavy: brand400.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: brand600.hex,
        Default: brand200.hex,
      },
      Background: {
        Subdued: brand800.hex,
        Default: brand800.hex,
        Heavy: brand700.hex,
      },
    },
  },

  Blue: {
    Light: {
      Text: {
        Subdued: blue600.hex,
        Default: blue700.hex,
      },
      Background: {
        Subdued: blue100.hex,
        Default: blue100.hex,
        Heavy: blue200.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: blue500.hex,
        Default: blue200.hex,
      },
      Background: {
        Subdued: blue800.hex,
        Default: blue800.hex,
        Heavy: blue700.hex,
      },
    },
  },

  Red: {
    Light: {
      Text: {
        Subdued: red600.hex,
        Default: red700.hex,
      },
      Background: {
        Subdued: red50.hex,
        Default: red100.hex,
        Heavy: red100.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: red500.hex,
        Default: red100.hex,
      },
      Background: {
        Subdued: red800.hex,
        Default: red700.hex,
        Heavy: red700.hex,
      },
    },
  },

  Orange: {
    Light: {
      Text: {
        Subdued: orange600.hex,
        Default: orange800.hex,
      },
      Background: {
        Subdued: orange100.hex,
        Default: orange200.hex,
        Heavy: orange200.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: orange500.hex,
        Default: orange200.hex,
      },
      Background: {
        Subdued: orange800.hex,
        Default: orange700.hex,
        Heavy: orange700.hex,
      },
    },
  },

  Purple: {
    Light: {
      Text: {
        Subdued: purple600.hex,
        Default: purple700.hex,
      },
      Background: {
        Subdued: purple100.hex,
        Default: purple200.hex,
        Heavy: purple200.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: purple500.hex,
        Default: purple200.hex,
      },
      Background: {
        Subdued: purple800.hex,
        Default: purple800.hex,
        Heavy: purple700.hex,
      },
    },
  },

  Yellow: {
    Light: {
      Text: {
        Subdued: yellow600.hex,
        Default: yellow800.hex,
      },
      Background: {
        Subdued: yellow100.hex,
        Default: yellow200.hex,
        Heavy: yellow300.hex,
      },
    },
    Dark: {
      Text: {
        Subdued: yellow500.hex,
        Default: yellow200.hex,
      },
      Background: {
        Subdued: yellow800.hex,
        Default: yellow800.hex,
        Heavy: yellow700.hex,
      },
    },
  },
};
