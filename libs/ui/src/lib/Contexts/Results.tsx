import { createContext, useContext } from 'react'

// TODO import this from the computer when it's possible
type Result = any

export type ResultsContextValue = { [blockId: string]: Result }

const ResultsContext = createContext<ResultsContextValue>({})

export const ResultsContextProvider = ResultsContext.Provider

export const useResult = (blockId: string): Result | null => {
  return useContext(ResultsContext)?.[blockId] ?? null
}
