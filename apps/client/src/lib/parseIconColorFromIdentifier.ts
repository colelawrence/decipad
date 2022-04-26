import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';

export function parseIconColorFromIdentifier(
  iconIdentifier: string | null | undefined
) {
  const parsedIcon = iconIdentifier?.split('-');

  if (parsedIcon) {
    if (parsedIcon.length !== 2) {
      console.error(`Cannot parse notebook icon ${iconIdentifier}`);
      return { ok: false };
    }
    const newIcon = parsedIcon[0] as UserIconKey;
    const newIconColor = parsedIcon[1] as AvailableSwatchColor;
    return { newIcon, newIconColor, ok: true };
  }
  if (typeof iconIdentifier === 'string') {
    console.error(`bad parameter for iconIdentifier ${iconIdentifier}`);
  }
  return { ok: false };
}
