import {
  createTPluginFactory,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
} from '@decipad/editor-types';
import { lazyElementComponent } from '../../utils/lazyElement';
import { LiveConnectionVarName } from './components/LiveConnectionVarName';

const LazyLiveConnection = lazyElementComponent(
  () =>
    import(
      /* webpackChunkName: "editor-live-connection" */ './components/LiveConnection'
    )
);

export const createLiveConnectionPlugin = createTPluginFactory({
  key: ELEMENT_LIVE_CONNECTION,
  isElement: true,
  component: LazyLiveConnection,
  plugins: [
    {
      key: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
      isElement: true,
      component: LiveConnectionVarName,
    },
  ],
});
