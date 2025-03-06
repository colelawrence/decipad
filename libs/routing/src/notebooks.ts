import { booleanParser, route, stringParser } from 'typesafe-routes';
import { descriptiveIdParser } from './shared/descriptive-id';
import { SECRET_URL_PARAM } from './shared/secret';

if (typeof window !== 'undefined') {
  ((
    history: History & { onpushstate?: (data: { state: unknown }) => void }
  ) => {
    const { pushState } = history;

    // eslint-disable-next-line no-param-reassign
    history.pushState = (state, unused, url) => {
      if (typeof history.onpushstate === 'function') {
        history.onpushstate({ state });
      }

      const event = new CustomEvent('beforereplace', {
        detail: { history, state, unused, url },
      });

      window.dispatchEvent(event);

      return pushState.call(history, state, unused, url);
    };
  })(window.history);
}

const notebook = route(
  `/:notebook/:tab?&:${SECRET_URL_PARAM}?&:embed?&:scenario?&:alias?&:FilterStartDate?&:FilterInterval?&:FilterLastPeriod?`,
  {
    notebook: descriptiveIdParser,
    tab: stringParser,
    scenario: stringParser,
    alias: stringParser,
    [SECRET_URL_PARAM]: stringParser,
    embed: booleanParser,
    FilterStartDate: stringParser,
    FilterInterval: stringParser,
    FilterLastPeriod: stringParser,
  },
  {}
);

const acceptInvite = route(
  `/:notebook/accept-invite/:invite`,
  { notebook: descriptiveIdParser, invite: descriptiveIdParser },
  {}
);

const addCredits = route(
  `/:notebook/add-credits`,
  { notebook: descriptiveIdParser },
  {}
);

const welcomeNotebook = route(`/welcome`, {}, {});

export default route(
  '/n',
  {},
  { notebook, acceptInvite, welcomeNotebook, addCredits }
);
