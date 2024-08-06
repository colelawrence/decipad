import { createContext, useContext } from 'react';

export const InsideLayoutContext = createContext(false);

export const useInsideLayoutContext = () => useContext(InsideLayoutContext);
