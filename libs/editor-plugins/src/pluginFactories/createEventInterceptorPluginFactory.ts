import {
  createTPluginFactory,
  EventInterceptor,
  MyElement,
} from '@decipad/editor-types';

interface EventInterceptorPluginProps {
  name: string;
  elementTypes: MyElement['type'][];
  interceptor: EventInterceptor;
}

/**
 * Create a plugin capable of intercepting some events, such as paste or pressing backspace.
 *
 * The `interceptor` function can stop propagation, or the default behavior, or both.
 */
export const createEventInterceptorPluginFactory = ({
  name,
  elementTypes,
  interceptor,
}: EventInterceptorPluginProps) => {
  return createTPluginFactory({
    key: name,
    withOverrides: (editor) => {
      const prevInterceptor = editor.interceptEvent ?? (() => false);

      // eslint-disable-next-line no-param-reassign
      editor.interceptEvent = (editorParam, entry, event) => {
        if (elementTypes.includes(entry?.[0].type)) {
          const wasHandled = interceptor(editorParam, entry, event);

          if (wasHandled) {
            return true;
          }
        }

        return prevInterceptor(editorParam, entry, event);
      };

      return editor;
    },
  });
};
