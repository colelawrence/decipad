Styles are a complex part of our product, and it is one we have to keep in sync with the designers.

# CSS Variables
For us and designers to talk the same language, we have a set of CSS Variables that are re-used both in the frontend and in figma. Whenever you see a design on figma you will also see the variable you will want to use.

Take a look at `light.ts` or `dark.ts`, to see the underlying application of these variables.

## Should I create a new CSS Variable?
No (probably).

This new and less complicated way of dealing with colours and variants, was introduced to remove the complexity of having so many different CSS variables, (we ended up having around 180 variables, with only some being used).

However, if you and a designer agrees that you must have another colour that isn't currently defined in a CSS Variable, you have two options:
- If this is truly a 1 off, then it might not be the worst thing in the world to hard code the colour, however this has problems with dark mode.
- Use a theme colour directly from our `ThemedColors` object, which contains all the variants that we use from themes.
- Actually create another CSS Variable, and give it a nice semantic name such as `textBlack`, hopefully something that can be reused by other components.

## Semantics

CSS Variables now a general semantic meaning, instead of having specific variables for specific components, we have variables that can be used everywhere such as:

- textDefault
- textSubdued
- textHeavy

## Color Variants

We currently have a few variants, but mostly we use:
- Subdued
- Default
- Heavy

Some special cases have special variants, but we try and keep these to a minimum, because it isn't great for us and designers to maintain so many different variables.