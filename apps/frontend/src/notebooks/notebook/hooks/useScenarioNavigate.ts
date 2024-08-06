import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooks, useNotebookRoute } from '@decipad/routing';

export const useScenarioNavigate = () => {
  const routeParams = useNotebookRoute();

  const selectedScenario = routeParams.scenario;
  const nav = useNavigate();
  const notebookNav = notebooks({}).notebook;
  const go = useCallback(
    (params: Partial<Parameters<typeof notebookNav>[0]>, replace = false) => {
      nav(`${notebookNav({ ...routeParams, ...params }).$}`, { replace });
    },
    [nav, notebookNav, routeParams]
  );

  const setSelectedScenario = (scenarioId?: string) => {
    if (!scenarioId) {
      go({ scenario: undefined }, true);
      return;
    }
    go({ scenario: scenarioId }, true);
  };

  return [selectedScenario, setSelectedScenario] as const;
};
