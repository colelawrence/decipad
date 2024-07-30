import { useEffect, useMemo, useState } from 'react';

export interface VarInfo {
  name?: string;
  blockId?: string;
}

export const usePersistentVariableName = (
  blockId: string | undefined,
  variableNames: VarInfo[],
  onChangeBlockId: (newBlockId: string) => void
): void => {
  const [lastKnownHumanVarName, setLastKnownHumanVarName] = useState<
    string | undefined
  >();
  const humanVarName = useMemo(
    () => variableNames.find((varName) => varName.blockId === blockId)?.name,
    [blockId, variableNames]
  );

  // save the latest human variable name
  useEffect(() => {
    if (humanVarName) {
      setLastKnownHumanVarName(humanVarName);
    }
  }, [humanVarName]);

  // reinstate the blockId if the human variable name is found
  useEffect(() => {
    if (humanVarName) {
      // we have our variable, nothing to see here
      return;
    }
    if (lastKnownHumanVarName) {
      const varName = variableNames.find(
        (existingVarName) => existingVarName.name === lastKnownHumanVarName
      );
      if (varName?.blockId && blockId !== varName.blockId) {
        onChangeBlockId(varName.blockId);
      }
    }
  }, [
    blockId,
    humanVarName,
    lastKnownHumanVarName,
    onChangeBlockId,
    variableNames,
  ]);
};
