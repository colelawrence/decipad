import { createContext, useContext } from 'react';

export type ProgramBlocksContextValue = {
  setBlockVarName?: (blockId: string, varname: string) => void;
  setBlockProvider?: (blockId: string, provider: string) => void;
  setBlockExternalId?: (blockId: string, externalId: string) => void;
};

export const ProgramBlocksContext = createContext<ProgramBlocksContextValue>(
  {}
);

export const ProgramBlocksContextProvider = ProgramBlocksContext.Provider;
export const ProgramBlocksContextConsumer = ProgramBlocksContext.Consumer;

export const useEditorBlocks = () => useContext(ProgramBlocksContext);
