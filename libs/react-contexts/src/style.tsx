import { createContext, FC, ReactNode, useContext } from 'react';

export interface StyleContextValue {
  icon?: string;
  color?: string;
  setIcon?: (icon: string) => void;
  setColor?: (color: string) => void;
}

const StyleContext = createContext<StyleContextValue>({});

export const StyleContextProvider: FC<
  StyleContextValue & {
    onColorChange: (color: string) => void;
    onIconChange: (icon: string) => void;
    children?: ReactNode;
  }
> = ({ children, icon, color, onIconChange, onColorChange }) => {
  return (
    <StyleContext.Provider
      value={{ icon, color, setIcon: onIconChange, setColor: onColorChange }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = (): StyleContextValue => useContext(StyleContext);
