import {
  createTPluginFactory,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
} from '@decipad/editor-types';
import { LiveConnectionVarName } from '@decipad/editor-components';
import { lazyElementComponent } from '../../utils/lazyElement';

const LazyLiveConnection = lazyElementComponent(
  () =>
    import(/* webpackChunkName: "editor-live-connection" */ './LiveConnection')
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
