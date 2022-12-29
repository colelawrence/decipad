# Event Interceptor

In the root of our plugins we have a `superInterceptorPlugin`, this lives in `libs/editor-plugins/src/plugins/EventInterception`. This plugin currently intercepts the following events:

- Backspace
- Delete
- Enter

How does a component make itself interceptable? You use the sister plugin with the `createEventInterceptorPluginFactory`. Below is an example of how to use this plugin within a components plugin.

```ts
createEventInterceptorPluginFactory({
  name: 'INTERCEPT_VAR_DEF',
  elementTypes: [
    ELEMENT_VARIABLE_DEF,
    ELEMENT_CAPTION,
    ELEMENT_EXPRESSION,
    ELEMENT_DROPDOWN,
  ],
  interceptor: (editor, entry, event) => {
    if (event.type === 'on-enter' && entry[0].type === ELEMENT_DROPDOWN) {
      return false;
    }
    if (
      event.type !== 'on-enter' ||
      entry[0].type === ELEMENT_VARIABLE_DEF
    ) {
      return true;
    }
    setSelectionNext(editor, entry);
    return true;
  },
})(),
```

In the example above, we are saying that we want the `elementTypes`, to be intercepted and dealt with by the super interceptor, we also have some custom logic to say that we don't want the `Enter` event type to be handled if the element is a `Dropdown`, we also have the utility function `setSelectionNext` which picks the next available node to set the editors selection. This example is usually more than you'll ned though.

Be warned, the interceptor by default just cancels the events, this is good in components such as the widget because you do not really want to allow the user to press `Enter` in the middle of the title.

## Debugging Prompts

- Component not reacting to keyboard input
- Enter not creating new line
- Backspace not working
- Unexpected behavior on Enter/Backspace
