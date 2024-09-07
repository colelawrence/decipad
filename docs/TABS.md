# Tabs

Tabs are a feature that allows the user to have multiple pages within their notebook, so they can split up calculations and presentation in whichever way they want, making decipad notebooks more readable.

## Technical Implementation

They are implemented by using multiple `Slate` editors, where only one editor is loaded at one time (currently, although it is completely possible to have multiple on the screen at the same time). Keeping track of the changes between these multiple editors is the hard part.

## Docsync Interaction

Most of the code for controlling the tabs is in `EditorController` under `notebook-tabs` library. It's main job is to to operatinos done on one of the active editors and forward it to docsync with a translated `Path`. It also needs to work the other way round, taking operations from docsync and translating them to the correct sub editor.

You can see docsyncing overriding `EditorController.apply` in the file `yjsEditor` in `withYjs`.

Here is a small [diagram](https://imgur.com/a/uSTH1hc).

Here are three sequence diagrams you can paste into https://sequencediagram.org for clarity

```
title Case 1: Operation originates in sub editor

User->SubEditor: apply(op [0, 1])
note over SubEditor: Decision: The operation\nis not FROM_ROOT, so\nwe forward it to the\nEditorController.
SubEditor->SubEditor:translateOpUp\n=> op [2, 0, 1]
note over SubEditor: IS_LOCAL = true
SubEditor->EditorController: apply(op [2, 0, 1] IS_LOCAL)
note over EditorController: Decision: The operation\nis not FROM_ROOT, so\nwe forward it to both the\nSubEditor and the \nMirrorEditor.
EditorController->EditorController: translateOpDown\n=> op [0, 1] IS_LOCAL
note over EditorController: FROM_ROOT = true\non translated op
EditorController->SubEditor:apply(op [0, 1] IS_LOCAL FROM_ROOT)
note over SubEditor: Decision: The operation\nis FROM_ROOT, so we\nprocess it without\nforwarding it anywhere.
note over SubEditor: Slate processes\nthe operation here
SubEditor-->EditorController:
note over EditorController: FROM_ROOT = true\non original op
note over EditorController: Decision: The operation\nis not FROM_MIRROR,\nso we forward it to the\nMirrorEditor.
EditorController->MirrorEditor: apply(op [2, 0, 1] IS_LOCAL FROM_ROOT)
note over MirrorEditor: Decision: The operation\nis not FROM_MIRROR,\nso we process it.
note over MirrorEditor: Slate processes\nthe operation here
note over MirrorEditor: Decision: The operation\nis FROM_ROOT, so we\ndo not forward it to the\nEditorController.
MirrorEditor-->EditorController:
EditorController-->SubEditor:
SubEditor-->User:
```

```
title Case 2: Operation originates in mirror editor

User->MirrorEditor: apply(op [2, 0, 1])
note over MirrorEditor: Decision: The operation\nis not FROM_MIRROR,\nso we process it.
note over MirrorEditor: Slate processes\nthe operation here
note over MirrorEditor: Decision: The operation\nis not FROM_ROOT, so\nwe forward it to the\nEditorController.
note over MirrorEditor: FROM_MIRROR = true
MirrorEditor->EditorController: apply(op [2, 0, 1] FROM_MIRROR)
note over EditorController: Decision: The operation\nis not FROM_ROOT, so\nwe forward it to both the\nSubEditor and (maybe)\nthe MirrorEditor.
EditorController->EditorController: translateOpDown\n=> op [0, 1] FROM_MIRROR
note over EditorController: FROM_ROOT = true\non translated op
EditorController->SubEditor:apply(op [0, 1] FROM_MIRROR FROM_ROOT)
note over SubEditor: Decision: The operation\nis FROM_ROOT, so we\nprocess it without\nforwarding it anywhere.
note over SubEditor: Slate processes\nthe operation here
SubEditor-->EditorController:
note over EditorController: FROM_ROOT = true\non original op
note over EditorController: Decision: The operation\nis FROM_MIRROR, so\nwe do not forward it to\nthe MirrorEditor.
EditorController-->MirrorEditor:
MirrorEditor-->User:
```

```
title Case 3: Operation originates in the EditorController

User->EditorController: apply(op [2, 0, 1])
note over EditorController: Decision: The operation\nis not FROM_ROOT, so\nwe forward it to both the\nSubEditor and (maybe)\nthe MirrorEditor.
EditorController->EditorController: translateOpDown\n=> op [0, 1]
note over EditorController: FROM_ROOT = true\non translated op
EditorController->SubEditor:apply(op [0, 1] FROM_ROOT)
note over SubEditor: Decision: The operation\nis FROM_ROOT, so we\nprocess it without\nforwarding it anywhere.
note over SubEditor: Slate processes\nthe operation here
SubEditor-->EditorController:
note over EditorController: FROM_ROOT = true\non original op
note over EditorController: Decision: The operation\nis not FROM_MIRROR,\nso we forward it to the\nMirrorEditor.
EditorController->MirrorEditor: apply(op [2, 0, 1] FROM_ROOT)
note over MirrorEditor: Decision: The operation\nis not FROM_MIRROR,\nso we process it.
note over MirrorEditor: Slate processes\nthe operation here
note over MirrorEditor: Decision: The operation\nis FROM_ROOT, so we\ndo not forward it to the\nEditorController.
MirrorEditor-->EditorController:
EditorController-->User:
```

### How it works

If you create a new paragraph in one of the tabs, the corresponding slate operation is:

```js
{
  type: 'insert_node',
  path: [0],
  node: {
    type: 'p',
    id: 'some_id',
    children: [{text: ""}],
  }
}
```

The editor controller then takes this path and adds the index of the tab. Therefore the operation would become:

```js
{
  type: 'insert_node',
  path: [1, 0],
  node: {
    type: 'p',
    id: 'some_id',
    children: [{text: ""}],
  }
}
```

Where `1`, the 0th index of thet path, is the index of the tab. If you have multiple tabs, the Editor Controller willtranslate the correct index.

The way we listen to these changes on the sub editors is by overriding the `editor.apply` of each sub editor.

```js
editor.apply = (op) => {
  const index = findIndex();

  const op = TranslateOpUp(op);
  op.IS_LOCAL = true;

  this.apply();
};
```

Important to note that we add the extra parameter `IS_LOCAL`, this is because we don't want to get into an infinite loop where the editor controller tries to reapply this operation back onto the sub editor. Look at the implementation of `EditorController.apply`.

### The Title

The title of the notebook is the biggest edge case in this piece of work. This is because we must only have 1 notebook title across the entire notebook, so it has to be treated differently from Tabs. For this reason we have a `TitleEditor`.

The `TitleEditor` is always the first (0th) child of `EditorController.children`. It is a simple `Slate.js` editor that disables almost every operation except for adding/removing text and setting a selection.

The title is always displayed, no matter which tab you are in.

### The need for `EditorController.children`

Docsync should not care about how you implement the underlying editors. All it cares about is having a consistent object that it can perform slate operations on. For this reason I have `EditorController.children` which is the source of truth when it comes to docsync. This array is of type `[TitleElement, ...Array<MyValue>]`, meaning that the first element is always the title, and the subsequent values are the values of the sub editors. Every element in this array contains a getter to get the actual underlying values, see `EditorController.CreateSubEditor` function.

## Normalizations

We are not guaranteed that docsync will give us a correct structure, so we have to be able to see when a structure is broken and fix it. We do this in the `EditorController.Loaded` function, where we check the insert operations already performed by docsync, and check that they are correct. If they are not correct, we apply a slate operation to fix it. This operation will contain the `TO_REMOTE` flag which skips the `EditorController.apply` function, and goes straight to docsync. This ensures that docsync will be forced to keep a good notebook structure.
