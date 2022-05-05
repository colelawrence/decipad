---
sidebar_position: 15
---

# Magic Numbers

:::caution `Experimental Feature`
Magic Numbers are currently being developed. This new feature allows you to embed any value from your model directly into your notebook text.
:::

Magic numbers are the glue between your data and your notebook. If you want to incorporate a result into a paragraph, you can do so by writing the variable name between `%` on any paragraph.

## Here's an example

Firstly, you need to have a variable defined, in our case we have an input widget called `Variable`.

Then, you can add a magic number to a paragraph using `%`the-variable-you-previously-defined`%`. This will create a reference to the original variable, in this example the input widget.

![ezgif-5-d38e916afb](https://user-images.githubusercontent.com/12210180/166690768-26c0d9a8-e08d-4666-9243-eecc8f8f095b.gif)

Check how every time the variable value changes, the magic number updates. Each time you or someone adjusts the notebook model, the magic numbers will update.

How do you see yourself using this feature in your notebook?
