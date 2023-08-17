import {
  AvailableSwatchColor,
  swatchNames,
  UserIconKey,
  userIconKeys,
} from 'libs/ui/src/utils';

interface ParseIconColorReturn {
  ok: boolean;
  icon: UserIconKey;
  iconColor: AvailableSwatchColor;
}

const invalid: ParseIconColorReturn = {
  ok: false,
  icon: 'Deci',
  iconColor: 'Catskill',
};

export function parseIconColorFromIdentifier(
  iconIdentifier: string | null | undefined
): ParseIconColorReturn {
  const parsedIcon = iconIdentifier?.replace(' ', '').split('-');

  if (parsedIcon) {
    if (parsedIcon.length !== 2) {
      console.error(`Cannot parse notebook icon ${iconIdentifier}`);
      return invalid;
    }

    const icon = parsedIcon[0] as UserIconKey;
    const iconColor = parsedIcon[1] as AvailableSwatchColor;

    if (!userIconKeys.includes(icon)) {
      return invalid;
    }

    if (!swatchNames.includes(iconColor)) {
      return invalid;
    }

    return { icon, iconColor, ok: true };
  }
  if (typeof iconIdentifier === 'string') {
    console.error(`bad parameter for iconIdentifier ${iconIdentifier}`);
  }
  return invalid;
}
