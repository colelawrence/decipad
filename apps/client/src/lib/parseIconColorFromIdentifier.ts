import {
  AvailableSwatchColor,
  swatchNames,
  UserIconKey,
  userIconKeys,
} from 'libs/ui/src/utils';

export function parseIconColorFromIdentifier(
  iconIdentifier: string | null | undefined
) {
  const parsedIcon = iconIdentifier?.replace(' ', '').split('-');

  if (parsedIcon) {
    if (parsedIcon.length !== 2) {
      console.error(`Cannot parse notebook icon ${iconIdentifier}`);
      return { ok: false };
    }

    const newIcon = parsedIcon[0] as UserIconKey;
    const newIconColor = parsedIcon[1] as AvailableSwatchColor;

    if (!userIconKeys.includes(newIcon)) {
      return { ok: false };
    }

    if (!swatchNames.includes(newIconColor)) {
      return { ok: false };
    }

    return { newIcon, newIconColor, ok: true };
  }
  if (typeof iconIdentifier === 'string') {
    console.error(`bad parameter for iconIdentifier ${iconIdentifier}`);
  }
  return { ok: false };
}
