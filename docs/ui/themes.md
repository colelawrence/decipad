Theming in our application is implemented through three main files: `var.tsx`, `dark.tsx`, and `light.tsx`. In order to use a color in both dark and light modes, it must first be defined in `var.tsx`.

When working with these files, you may need to change colors that are defined using the cssVar function. If you are asked to make such changes by a designer, you may need to create a new color. To do this, define the new key in var.tsx, and then create corresponding entries in both `dark.tsx` and `light.tsx`.

To access the current theme in your code, you can use the following:

```ts
const [darkTheme] = useThemeFromStore();
```

Our application also includes a set of predefined color swatches that can be used throughout the application. These colors can be accessed in a themed way using the following:

```ts
swatchesThemed(darkTheme)[color];
```

For example, you can use the following code to get the current dark theme and the applicable color swatches:

```ts
const [darkTheme] = useThemeFromStore();
const baseSwatches = swatchesThemed(darkTheme);
```

If you need to add new colors to the application, you can do so in the colors.tsx file. The palette for these colors should be provided to you by a designer.
