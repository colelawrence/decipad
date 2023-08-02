import { Global } from '@emotion/react';
import { FC, useMemo } from 'react';
import { themeStore } from '@decipad/utils';
import {
  black,
  blackWhiteBlack,
  blue100,
  blue200,
  blue300,
  blue400,
  blue50,
  blue500,
  blue600,
  blue700,
  blue800,
  blue900,
  brand100,
  brand200,
  brand300,
  brand400,
  brand500,
  brand600,
  brand700,
  brand800,
  brand900,
  dark100,
  dark300,
  dark400,
  dark500,
  dark600,
  dark700,
  fullTransparent,
  grey100,
  grey200,
  grey300,
  grey400,
  grey600,
  grey700,
  offBlack,
  offWhite,
  orange100,
  orange200,
  orange300,
  orange50,
  orange500,
  orange600,
  orange700,
  orange800,
  purple100,
  purple200,
  purple300,
  purple500,
  purple600,
  purple700,
  purple800,
  red100,
  red200,
  red300,
  red400,
  red50,
  red500,
  red600,
  red700,
  red800,
  red900,
  teal100,
  teal200,
  teal50,
  teal500,
  teal600,
  teal700,
  teal800,
  white,
  yellow100,
  yellow200,
  yellow300,
  yellow500,
  yellow600,
  yellow700,
  yellow800,
  yellow900,
} from './color';
import { AvailableSwatchColor } from '../utils';
import { setCssVar } from './var';

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
 * React hook for when you want to use a theme color that isn't specified by the editor.
 * It has to be a hook, because it must react to changes in light and dark mode.
 *
 * If you cannot use a hook, then you can use the @see `getThemeColor` function instead.
 */
export function useThemeColor(swatchColor: AvailableSwatchColor): ColorPalette {
  const isDarkMode = themeStore((s) => s.theme);
  const theme = translateOldThemeColor(swatchColor);

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
        Subdued: brand900.hex,
        Default: brand900.hex,
        Heavy: brand800.hex,
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
        Subdued: yellow900.hex,
        Default: yellow900.hex,
        Heavy: yellow800.hex,
      },
    },
  },
};

export interface ComponentCssVariables {
  // ---------------- Buttons ----------------
  ButtonPrimaryDefaultBackground: string;
  ButtonPrimaryDefaultText: string;
  ButtonPrimaryHoverBackground: string;
  ButtonPrimaryHoverText: string;
  ButtonPrimaryDisabledBackground: string;
  ButtonPrimaryDisabledText: string;

  ButtonSecondaryDefaultBackground: string;
  ButtonSecondaryDefaultText: string;
  ButtonSecondaryHoverBackground: string;
  ButtonSecondaryHoverText: string;
  ButtonSecondaryDisabledBackground: string;
  ButtonSecondaryDisabledText: string;

  ButtonTertiaryDefaultBackground: string;
  ButtonTertiaryDefaultText: string;
  ButtonTertiaryHoverBackground: string;
  ButtonTertiaryHoverText: string;
  ButtonTertiaryDisabledBackground: string;
  ButtonTertiaryDisabledText: string;

  ButtonTertiaryAltDefaultBackground: string;
  ButtonTertiaryAltDefaultText: string;
  ButtonTertiaryAltHoverBackground: string;
  ButtonTertiaryAltHoverText: string;
  ButtonTertiaryAltDisabledBackground: string;
  ButtonTertiaryAltDisabledText: string;

  ButtonBorderlessDefaultBackground: string;
  ButtonBorderlessDefaultText: string;
  ButtonBorderlessHoverBackground: string;
  ButtonBorderlessHoverText: string;
  ButtonBorderlessDisabledBackground: string;
  ButtonBorderlessDisabledText: string;

  ButtonDangerDefaultBackground: string;
  ButtonDangerDefaultText: string;
  ButtonDangerHoverBackground: string;
  ButtonDangerHoverText: string;
  ButtonDangerDisabledBackground: string;
  ButtonDangerDisabledText: string;
  // ------------- End Buttons ----------------

  // ---------------- Links -------------------
  LinkDefaultColor: string;
  LinkLighterColor: string;
  LinkDefaultHoverColor: string;
  LinkDangerColor: string;
  LinkDangerHoverColor: string;
  // ------------- End Links ------------------

  // ------------- AI Colors ------------------
  AiTextColor: string;
  AiBubbleBackgroundColor: string;
  AiSendButtonStrokeColor: string;
  AiSendButtonBgColor: string;
  // ----------- End AI Colors ----------------

  // REMOVE ME
  // ------------- Error Block ----------------
  ErrorBlockColor: string;
  ErrorBlockWarning: string;
  ErrorBlockInfo: string;
  ErrorBlockAnnotationWarning: string;
  ErrorBlockError: string;
  // ----------- End Error Block --------------

  // ----------- Mutation Color ---------------
  MutationAnimationColor: string;
  // --------- End Mutation Color -------------

  // --------------- Tooltips -----------------
  TooltipBackground: string;
  TooltipCodeBackground: string;
  TooltipText: string;
  TooltipTextSecondary: string;
  // -------------End  Tooltips ---------------

  // ------------- Droplines ------------------
  DroplineBgColor: string;
  DroplineColor: string;
  TableSelectionBackgroundColor: string;
  TableFocusColor: string;
  // ------------ End Droplines ---------------

  // REMOVE ME
  // ---------- Slash (remove me) -------------
  WeakerSlashIconColor: string;
  WeakSlashIconColor: string;
  StrongSlashIconColor: string;
  // ------------- End Slash ------------------
  //
  // ---------- Status Indicators -------------
  StatusIndicatorSavedForeground: string;
  StatusIndicatorSavedBackground: string;
  StatusIndicatorUnsavedForeground: string;
  StatusIndicatorUnsavedBackground: string;
  StatusIndicatorOfflineForeground: string;
  StatusIndicatorOfflineBackground: string;
  StatusIndicatorErrorForeground: string;
  StatusIndicatorErrorBackground: string;

  SecretsWarningBackground: string;

  ChartBlueColor: string;

  ToggleOffBackgroundColor: string;
  ToggleOnBackgroundColor: string;
}

/**
 * Object containing specific component colors, both for light and dark mode.
 * Keep the light and dark parts consistent.
 */
export const ComponentColors: Record<'Light' | 'Dark', ComponentCssVariables> =
  {
    Light: {
      ButtonPrimaryDefaultBackground: brand500.hex,
      ButtonPrimaryDefaultText: blackWhiteBlack.hex,
      ButtonPrimaryHoverBackground: brand300.hex,
      ButtonPrimaryHoverText: blackWhiteBlack.hex,
      ButtonPrimaryDisabledBackground: brand200.hex,
      ButtonPrimaryDisabledText: grey400.hex,

      ButtonSecondaryDefaultBackground: blackWhiteBlack.hex,
      ButtonSecondaryDefaultText: white.hex,
      ButtonSecondaryHoverBackground: grey600.hex,
      ButtonSecondaryHoverText: white.hex,
      ButtonSecondaryDisabledBackground: grey400.hex,
      ButtonSecondaryDisabledText: white.hex,

      ButtonTertiaryDefaultBackground: grey200.hex,
      ButtonTertiaryDefaultText: blackWhiteBlack.hex,
      ButtonTertiaryHoverBackground: grey100.hex,
      ButtonTertiaryHoverText: grey600.hex,
      ButtonTertiaryDisabledBackground: grey200.hex,
      ButtonTertiaryDisabledText: grey400.hex,

      ButtonTertiaryAltDefaultBackground: grey300.hex,
      ButtonTertiaryAltDefaultText: black.hex,
      ButtonTertiaryAltHoverBackground: grey200.hex,
      ButtonTertiaryAltHoverText: grey600.hex,
      ButtonTertiaryAltDisabledBackground: grey200.hex,
      ButtonTertiaryAltDisabledText: grey400.hex,

      ButtonBorderlessDefaultBackground: fullTransparent.rgba,
      ButtonBorderlessDefaultText: blackWhiteBlack.hex,
      ButtonBorderlessHoverBackground: grey100.hex,
      ButtonBorderlessHoverText: grey600.hex,
      ButtonBorderlessDisabledBackground: fullTransparent.rgba,
      ButtonBorderlessDisabledText: grey400.hex,

      ButtonDangerDefaultBackground: red500.hex,
      ButtonDangerDefaultText: white.hex,
      ButtonDangerHoverBackground: red400.hex,
      ButtonDangerHoverText: white.hex,
      ButtonDangerDisabledBackground: red200.hex,
      ButtonDangerDisabledText: white.hex,

      LinkDefaultColor: blue700.hex,
      LinkLighterColor: blue500.hex,
      LinkDefaultHoverColor: blue700.hex,
      LinkDangerColor: red500.hex,
      LinkDangerHoverColor: red700.hex,

      AiTextColor: teal600.hex,
      AiBubbleBackgroundColor: teal50.hex,
      AiSendButtonStrokeColor: teal600.hex,
      AiSendButtonBgColor: teal100.hex,

      ErrorBlockColor: orange700.hex,
      ErrorBlockWarning: orange50.hex,
      ErrorBlockInfo: grey100.hex,
      ErrorBlockAnnotationWarning: yellow100.hex,
      ErrorBlockError: red50.hex,

      MutationAnimationColor: yellow200.hex,

      TooltipBackground: offBlack.hex,
      TooltipCodeBackground: grey300.hex,
      TooltipText: offWhite.hex,
      TooltipTextSecondary: grey400.hex,

      DroplineBgColor: blue100.hex,
      DroplineColor: blue300.hex,
      TableSelectionBackgroundColor: blue50.hex,
      TableFocusColor: blue300.hex,

      WeakerSlashIconColor: blue100.hex,
      WeakSlashIconColor: blue200.hex,
      StrongSlashIconColor: blue500.hex,

      StatusIndicatorSavedForeground: brand600.hex,
      StatusIndicatorSavedBackground: brand100.hex,
      StatusIndicatorUnsavedForeground: orange300.hex,
      StatusIndicatorUnsavedBackground: orange50.hex,
      StatusIndicatorOfflineForeground: grey300.hex,
      StatusIndicatorOfflineBackground: grey100.hex,
      StatusIndicatorErrorForeground: red300.hex,
      StatusIndicatorErrorBackground: red100.hex,

      SecretsWarningBackground: yellow200.hex,
      ChartBlueColor: blue400.hex,

      ToggleOffBackgroundColor: grey300.hex,
      ToggleOnBackgroundColor: grey600.hex,
    },
    Dark: {
      ButtonPrimaryDefaultBackground: purple300.hex,
      ButtonPrimaryDefaultText: dark700.hex,
      ButtonPrimaryHoverBackground: purple500.hex,
      ButtonPrimaryHoverText: dark700.hex,
      ButtonPrimaryDisabledBackground: purple600.hex,
      ButtonPrimaryDisabledText: dark500.hex,

      ButtonSecondaryDefaultBackground: dark400.hex,
      ButtonSecondaryDefaultText: dark700.hex,
      ButtonSecondaryHoverBackground: dark500.hex,
      ButtonSecondaryHoverText: dark700.hex,
      ButtonSecondaryDisabledBackground: dark600.hex,
      ButtonSecondaryDisabledText: dark500.hex,

      ButtonTertiaryDefaultBackground: dark700.hex,
      ButtonTertiaryDefaultText: dark300.hex,
      ButtonTertiaryHoverBackground: dark500.hex,
      ButtonTertiaryHoverText: dark400.hex,
      ButtonTertiaryDisabledBackground: dark400.hex,
      ButtonTertiaryDisabledText: dark500.hex,

      ButtonTertiaryAltDefaultBackground: dark600.hex,
      ButtonTertiaryAltDefaultText: dark300.hex,
      ButtonTertiaryAltHoverBackground: dark500.hex,
      ButtonTertiaryAltHoverText: dark400.hex,
      ButtonTertiaryAltDisabledBackground: dark400.hex,
      ButtonTertiaryAltDisabledText: dark500.hex,

      ButtonBorderlessDefaultBackground: fullTransparent.rgba,
      ButtonBorderlessDefaultText: dark400.hex,
      ButtonBorderlessHoverBackground: dark600.hex,
      ButtonBorderlessHoverText: dark400.hex,
      ButtonBorderlessDisabledBackground: fullTransparent.rgba,
      ButtonBorderlessDisabledText: dark500.hex,

      ButtonDangerDefaultBackground: red700.hex,
      ButtonDangerDefaultText: dark100.hex,
      ButtonDangerHoverBackground: red800.hex,
      ButtonDangerHoverText: dark100.hex,
      ButtonDangerDisabledBackground: red900.hex,
      ButtonDangerDisabledText: dark500.hex,

      LinkDefaultColor: blue700.hex,
      LinkLighterColor: blue500.hex,
      LinkDefaultHoverColor: blue700.hex,
      LinkDangerColor: red500.hex,
      LinkDangerHoverColor: red700.hex,

      AiTextColor: teal500.hex,
      AiBubbleBackgroundColor: teal800.hex,
      AiSendButtonStrokeColor: teal100.hex,
      AiSendButtonBgColor: teal700.hex,

      ErrorBlockColor: red50.hex,
      ErrorBlockWarning: orange700.hex,
      ErrorBlockInfo: grey700.hex,
      ErrorBlockAnnotationWarning: yellow700.hex,
      ErrorBlockError: red700.hex,

      MutationAnimationColor: yellow200.hex,

      TooltipBackground: dark300.hex,
      TooltipCodeBackground: offBlack.hex,
      TooltipText: offBlack.hex,
      TooltipTextSecondary: dark500.hex,

      DroplineBgColor: blue900.hex,
      DroplineColor: blue600.hex,
      TableSelectionBackgroundColor: blue900.hex,
      TableFocusColor: blue600.hex,

      WeakerSlashIconColor: blue100.hex,
      WeakSlashIconColor: blue200.hex,
      StrongSlashIconColor: blue500.hex,

      StatusIndicatorSavedForeground: brand600.hex,
      StatusIndicatorSavedBackground: brand800.hex,
      StatusIndicatorUnsavedForeground: orange500.hex,
      StatusIndicatorUnsavedBackground: orange700.hex,
      StatusIndicatorOfflineForeground: grey100.hex,
      StatusIndicatorOfflineBackground: grey600.hex,
      StatusIndicatorErrorForeground: red100.hex,
      StatusIndicatorErrorBackground: red300.hex,

      SecretsWarningBackground: yellow700.hex,
      ChartBlueColor: blue600.hex,

      ToggleOffBackgroundColor: dark500.hex,
      ToggleOnBackgroundColor: dark300.hex,
    },
  } as const;

export const GlobalComponentStyles: FC = () => {
  const isDarkMode = themeStore((store) => store.theme);
  const mode = isDarkMode ? 'Dark' : 'Light';

  const CssVars = useMemo(() => {
    const componentVars: Record<`--deci-${string}`, string> = {};
    for (const [k, v] of Object.entries(ComponentColors[mode])) {
      componentVars[`--deci-${k}`] = v;
    }
    return componentVars;
  }, [mode]);

  return (
    <Global
      styles={{
        ':root': CssVars,
      }}
    />
  );
};

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

export function componentCssVars(
  variable: keyof typeof ComponentColors['Light']
): string {
  return `var(--deci-${variable})`;
}

export function componentCssVarHex<V extends keyof ComponentCssVariables>(
  name: V
) {
  return ComponentColors.Light[name];
}
