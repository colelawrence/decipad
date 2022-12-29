They live: `libs/editor-plugins` mostly, but some components define their own plugins, for example `editor-table` package has all the table related plugins in there.

Plugins is the main way in which our code base interacts with the editor, they provide listeners, normalizer and all sorts of events which we can use to modify state.

Plugins are ALL ran, everytime there is a change in the editor.

A plugin is created using a factory method, most of which come from [[Plate]], but we have some custom made ones in `libs/editor-plugins/src/factories`.

## Plugin Types

- [[Plugin Types#Normalizers]]
- [[Plugin Types#Keydown]]
- [[Plugin Types#Interceptors]]
