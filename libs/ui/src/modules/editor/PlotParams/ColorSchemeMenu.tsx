import { Brush } from 'libs/ui/src/icons';
import { ColorScheme } from 'libs/ui/src/primitives';
import { MenuItem, MenuList, TriggerMenuItem } from 'libs/ui/src/shared';
import { ReactNode, SetStateAction } from 'react';
import { getColorSchemePrettyName } from './helpers';
import { constMenuMinWidth } from './styles';
import { ColorSchemeUniqueName, SubMenuKey } from './types';

type ColorSchemeChangeHandler = (
  value: SetStateAction<string | undefined>
) => void;

interface BaseColorSchemeProps {
  open: SubMenuKey | undefined | null;
  onChangeOpen: (key: SubMenuKey) => (isOpen: boolean) => void;
  setColorScheme: (str: string) => void;
  setCachedColorScheme: ColorSchemeChangeHandler;
  setTempColorScheme: ColorSchemeChangeHandler;
}

interface ColorSchemeSubMenuProps extends BaseColorSchemeProps {
  menuKey: SubMenuKey;
  itemTrigger: ReactNode;
  colorSchemes: [string, ColorScheme][];
  currentColorScheme: ColorSchemeUniqueName;
}

interface ColorSchemeMenuProps extends BaseColorSchemeProps {
  selectedColorScheme: ColorSchemeUniqueName;
  monochromeColorSchemes: [string, ColorScheme][];
  multicolorColorSchemes: [string, ColorScheme][];
}

const ColorSchemeSubMenu: React.FC<ColorSchemeSubMenuProps> = ({
  menuKey,
  open,
  onChangeOpen,
  itemTrigger,
  colorSchemes,
  currentColorScheme,
  setColorScheme,
  setCachedColorScheme,
  setTempColorScheme,
}) => {
  return (
    <MenuList
      key={menuKey}
      open={open === menuKey}
      onChangeOpen={onChangeOpen(menuKey)}
      itemTrigger={itemTrigger}
    >
      {colorSchemes.map(([uniqueName, cs]) => (
        <MenuItem
          key={uniqueName}
          selected={uniqueName === currentColorScheme}
          onSelect={() => {
            setColorScheme(uniqueName);
            setCachedColorScheme(uniqueName);
          }}
          onMouseEnter={() => {
            setTempColorScheme(uniqueName);
          }}
          onMouseLeave={() => {
            setTempColorScheme(undefined);
          }}
        >
          <div css={constMenuMinWidth}>{cs.name}</div>
        </MenuItem>
      ))}
    </MenuList>
  );
};

const ColorSchemeMenu: React.FC<ColorSchemeMenuProps> = ({
  open,
  onChangeOpen,
  selectedColorScheme,
  setColorScheme,
  setCachedColorScheme,
  setTempColorScheme,
  monochromeColorSchemes,
  multicolorColorSchemes,
}) => (
  <MenuList
    key="color-scheme"
    open={open?.startsWith('color-scheme')}
    onChangeOpen={onChangeOpen('color-scheme')}
    itemTrigger={
      <TriggerMenuItem
        icon={<Brush />}
        selectedPreview={getColorSchemePrettyName(selectedColorScheme)}
      >
        Color scheme
      </TriggerMenuItem>
    }
  >
    <ColorSchemeSubMenu
      menuKey="color-scheme_monochrome"
      open={open}
      onChangeOpen={onChangeOpen}
      itemTrigger={
        <TriggerMenuItem icon={<Brush />}>Monochrome</TriggerMenuItem>
      }
      colorSchemes={monochromeColorSchemes}
      currentColorScheme={selectedColorScheme}
      setColorScheme={setColorScheme}
      setCachedColorScheme={setCachedColorScheme}
      setTempColorScheme={setTempColorScheme}
    />
    <ColorSchemeSubMenu
      menuKey="color-scheme_multicolor"
      open={open}
      onChangeOpen={onChangeOpen}
      itemTrigger={
        <TriggerMenuItem icon={<Brush />}>Multicolor</TriggerMenuItem>
      }
      colorSchemes={multicolorColorSchemes}
      currentColorScheme={selectedColorScheme}
      setColorScheme={setColorScheme}
      setCachedColorScheme={setCachedColorScheme}
      setTempColorScheme={setTempColorScheme}
    />
  </MenuList>
);

export default ColorSchemeMenu;
