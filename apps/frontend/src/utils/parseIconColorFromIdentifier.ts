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

    const icon = parsedIcon[0] as UserIconKey;
    const iconColor = parsedIcon[1] as AvailableSwatchColor;

    if (!userIconKeys.includes(icon)) {
      return { ok: false };
    }

    if (!swatchNames.includes(iconColor)) {
      return { ok: false };
    }

    return { icon, iconColor, ok: true };
  }
  if (typeof iconIdentifier === 'string') {
    console.error(`bad parameter for iconIdentifier ${iconIdentifier}`);
  }
  return { ok: false };
}
