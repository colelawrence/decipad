We use these extensively throughout and they live in the `react-context` folder, and a lot of these are defined at the `Editor.component` so can be used in any component in the document.

- Computer: Provides a reference to the computer object, no real effects on performance, use away. `useComputer`
- EditorChange: Provides an Rxjs observable to any change in the editor: Be careful when using this, your component could start to re-render everytime the editor changes.
- EditorReadOnly: Boolean value if we are in edit mode or read mode, no real effects on performance.
- EditorStyles: Style information such as the colour the user choose for the editor, no real effects on performance.
- StarterChecklist: The onboarding checklist capture's all the users events to see if they are completing a tutorial. It is only used in the `StarterChecklist` component.
