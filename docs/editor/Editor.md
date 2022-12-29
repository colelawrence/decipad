The editor is a crucial part of the project. It lives in `libs/editor`, where the main file is `libs/src/Editor.component.tsx`, this file takes in an instance of the editor, and some other metadata and renders components and context that should be available throughout the document.

Usually this component doesn't re-render, because if it does so do all the [[Slate]] components and that would be slow.

## More on the editor

- [[Editor Plugins]]
