# Frontend

This document outlines some of the structure, history and principles of the frontend code that is spread throughout multiple packages in our codebase.
It is meant to be a worthwhile read for developers who are completely new to the frontend codebase, who have only contributed a few changes in some areas so far, and even for those who are quite proficient in it already but may be wondering why some things came to be the way they are.

## Structure

The frontend consists mainly of the following key pieces:

- Applications
  - `frontend` — This is the main artifact we deploy to be served statically. It establishes basic structure of the pages that we have. The crucial aspects it takes care of are routing, data fetching, data layer error handling, and "meta aspects" like authentication, analytics, and monitoring. But it never contains, for example, UI code, such as layouting and styling or significant interaction with the DOM.
- Libraries
  - `ui` — The `ui` implements our design system. It contains code that deals with the visuals and semantics of the pages, such as HTML tags, CSS styles, layouting, accessibility concerns, focus handling, et cetera. It may contain logic, as long as it does not intrude on responsibilities of another package, and maintain state, as long as it is not duplicated. In fact, if the logic or state can be in the `ui`, e.g. an expand/collapse mechanism that no higher-up components care about, it probably _should_ be in the `ui`, because it makes the other packages that are already burdened with a lot of logic easier to follow.
  - `editor*` - The `editor` and the `editor-*` packages it is composed of implement the logic for the document editing and viewing experience. They do also not contain significant chunks of UI, for which they should instead rely on using `ui` components, although doing a bit of layouting to e.g. show an autocompletion menu above an editor element, may be pragmatic and acceptable. The editor packages are solely responsible for dealing with our core editor libraries `slate`, `slate-react`, and `plate`. Editor-specific code leaking out is avoided; for instance UI should not care about whether it is rendered in an editor context or not.

There are further packages of less significance that are used by these frontend packages.
You can dive into these when you are working on a feature area that leads you to them.
Some examples (absolutely non-exhaustive) are:

- `react-context` and `client-events`, made purely for frontend purposes
- `docsync` and `language`, which are used by the frontend but may also be required by the backend for some features, such as server-side result calculation
- `feature-flags` and `utils`, which are entirely universal

## History

This section tells the story of the three big undertakings that took the frontend from a prototype-y exploration to the structure that it has today.

These projects were important technical steps to establish an architecture that would allow the frontend to grow sustainably, but they also always had immediate benefits to the user in mind, such as establishing visual consistency, achieving stability, or improving performance.

### The conception of the `ui`

The `frontend` and the `editor` are among the oldest of our packages, dating back to early 2021. The `ui`, however, was only conceived in mid-2021. Prior to this point, the `frontend` and `editor` contained UI in arbitrary locations. The UI was based on [Chakra UI](https://chakra-ui.com/) and was a copy-paste collection with little consistency, particularly no consistency _enforced by the structure of the code_.

The `ui` package was created

- to improve code organisation and reduce component sizes by separating UI concerns from the concerns of the `editor` and `frontend`,
- to display every piece of UI in our Storybook, which is easy if UI components contain strictly no non-UI logic,
- and to ensure consistency in the CSS-in-JS styling by re-using design tokens encoded in JavaScript as `primitives`, and layouting data such as paddings and grid templates.

Until the end of 2021, almost all UI was gradually moved out of `editor` and `frontend` into `ui` and at the same time re-written to follow strict principles.
After this was 95% completed, the last bits of old, non-standard, weird looking UI that is outside the `ui` package and/or uses Chakra UI, are only moved and re-written when someone happens to touch them anyway. A few such pieces remain even months later.

### The editor reform

Throughout most of 2021, the `editor` struggled with stability issues. It would very often exhibit weird behaviors such as cursor jumping, enter invalid states due to user input, or outright crash entirely.

In late 2021 and early 2022, much (although far from all) of the editor code was re-written.
Unnecessary complex transformations and dead code in copy-pasted examples were eliminated.
Shared utils were used and unit-tested, and the editor plugins are integration tested at whole editor level, sometimes including `slate-react` rendering.
The entire editor value was strictly typed, and normalizers were put in place to enforce these types.
More end-to-end tests also helped a great deal against regressions.

In early 2022, the editor stability had improved greatly. Further refactors were later done, such as splitting the editor into multiple `editor-*` packages.

### The client re-write

The `frontend` was called `client` until mid-2022, when it was mostly re-written to establish

- lazy-loading,
- consistent loading and error state handling, and
- normalized GraphQL caching.

If you find explicit references to the `client` or implicit references such as `e2e` (meaning end-to-end tests for the `client`), they now mean the `frontend`.

The re-write improved first contentful paint on slow networks from ~8s to ~1s, and largest contentful paint / time to interactive on the login and dashboard entry pages from ~8s to ~4s. The notebook page did not see big metrics improvement, but subjective improvement from earlier loading of the topbar.
Later, a start was made lazy-loading parts of the editor (such as plots) to reduce editor hot path bundle size as well, but the editor is still an exceptionally big chunk and optimizations to it tend to be significantly more expensive in than usual due to its special technical constraints.

## The `frontend`

The `frontend` is structured essentially according to its route hierarchy, mapped to a directory hierarchy, e.g. `src/workspaces/workspace` contains the components for the `/w/:workspaceId` route.

### Rendering UI

When it renders a page, often that page will have slots for smaller templates.
In a simple environment such as Storybook, these slots may be plainly filled by the templates that they are made for, e.g.

```jsx
<WorkspacePage topbar={<WorkspaceTopbar />} notebookList={<NotebookList />} />
```

In the frontend, however, we deal with concerns such as lazy loading and data fetching without suspending the entire page and catching errors without crashing the entire page. These slots are made for allowing exactly that:

```jsx
<WorkspacePage
  topbar={
    <Suspense fallback={<LoadingIndicator />}>
      <ErrorBoundary>
        <WorkspaceTopbar />
      </ErrorBoundary>
    </Suspense>
  }
  notebookList={
    <Suspense fallback={<NotebookListPlaceholder />}>
      <ErrorBoundary>
        <WorkspaceTopbar />
      </ErrorBoundary>
    </Suspense>
  }
/>
```

The `<Frame>` helper unifies suspense, error boundary, and more into one component that we render around most, if not all, pieces of UI.

### Data layer

We try to keep data queries and mutations as low in the component tree as possible to avoid higher-up "god components".
For example, not the entire notebook page needs to know or change whether a notebook is set to public, only the topbar template does.

To ensure that no stale data is in the Graphcache after a mutation, we use the same fragments in mutation results as we do in the queries that the mutation affects.
Some mutations require manual cache updates as described in the documentation of the cache library, which we add to the Graphcache configuration.

## The `editor`

Editor logic tends to be complicated and full of edge cases, so rigorous type safety, failing fast in unexpected cases before causing weird behavior, and writing a lot of tests for the logic is crucial.

Getting to know Slate can be overwhelming without experience with it. We try to be explicit using util functions with detailed names, passing paths explicitly instead of relying on "defaults to selection", and tests that define their behavior precisely.

### Type safety

A key piece to making sure the editor is stable is always knowing what shape its value has.
Thus, when changing what shape the editor can have, one must **always update the editor typings and write normalizers to enforce the typings**.
There are many ways things can go wrong here (bugs in our transforms, user pasting, documents from other versions of Decipad, ...), so this is essential.

### Rendering UI

When rendering UI in the editor, we deal with editor specifics so that the UI doesn't have to.
For example, we render `<div {...attributes}>` around the UI component, and `<div contentEditable={false}>` if needed.
We don't let the UI read or manipulate editor state (e.g. via `slate` hooks), instead we provide it with props containing the required values from the editor state and event handlers that manipulate the editor state.

The editor is more deeply interwoven with the UI. Restrictions like for the frontend, which only uses the `templates` and `pages` exported from the UI, are not practical for the editor.
However, this does not mean the editor can basically fuse with the UI. Accessing `primitives`, for example, is not acceptable; accessing icons, atoms, and molecules, should also always be questioned. Code wanting to do this should often be in a UI component in the first place.

## The `ui`

UI components are, from lowest to highest level, grouped into

- `atoms`, which do not use other UI components;
- `molecules`, which use atoms;
- `organisms`, which use components of lower and the same level, and may sometimes have state and behavior;
- `templates`, which can use components of lower level, and are the lowest level to be exposed for usage in the frontend;
- `pages`, which can use components of lower level, but templates only if offered as "slot in" props so that they can be wrapped and augmented by the frontend.

`icons` are stored as first-class React components so that they can access primitives, e.g. CSS variables, with type safety. We may sooner or later need a compile step to keep them efficient and performant.

`primitives` are another key piece of the `ui` internals, implementing the design tokens of our design system, such as centralized typography style combinations, color values, theming variables, etc.
When a styling aspect is encoded in primitives, components must never hardcode it themselves, for it may introduce visual inconsistencies.
Examples include

- colors, including
- colors with `opacity` or alpha values (`Opacity` primitive);
- font styles, including not only `font-size` and `font-family`, but also `font-weight`, `line-height`, and everything else encoded in primitives;
- breakpoints, whether for media queries, or (preferred) for viewport unit `calc`s (we have utils for this), `flex-basis`, et cetera;
- animation durations.

There are further directories in the UI, containing shared `styles` (use for example when you are aligning things across multiple components with similar padding values or grid templates), `types`, and more things you may occasionally need.

Recommended reading: [Every Layout](https://every-layout.dev/)
