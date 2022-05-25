---
sidebar_position: 10
---

# Exploring Numbers and Data

Currently, there is just one way of manipulating data on your notebook, and that is with calculations blocks.

Other blocks such as tables and widgets are useful for data inputting and display.

## Play with data: Calculation Block

To add a calculation block to your notebook:

1. Write `/` in a new paragraph;
2. Select **Calculations**.

On calculation blocks, most operations are intuitive and natural to do since they powered by the [Decipad language](../language). Here's an example:

```deci live
2 + 2
==> 4
```

As you would expect, [operators](../language/numbers/arithmetic-functions) work as in any other mathematical context.

Each calculation block will also resume the operation result on the right for you or anyone reading to follow.

## Name your data: Variables

In a calculation block, you are able to assign names to your data using the `=` sign - we call it creating [variables](/docs/language/variables). Naming your data is very useful since it allows you to reference that data point on other blocks just by using its name.

For now, variables can't have spaces on their names, but you can use symbols or emojis. Don't forget that [variables](/docs/language/variables) are case-sensitive, meaning that _myvariable_ is different that _MYVARIABLE_.

Here are some examples on declaring a variable, where we use names or emojis as names.

```deci live
NameSomethingInDecipad = 300
==> 300
```

```deci live
🐙 = 300
==> 300
```

## Organize your data: Tables

Type `/` and select **Table** to add a table to your notebook.

Data in a table can be text, numbers (with or without units) or dates.
As with variables, you can name your table and use it in a calculation.

![tables](https://user-images.githubusercontent.com/76447845/146926068-463a1bc4-e70d-443d-a05b-6f49dcecf310.gif)

If you are looking to create complex tables, you can always build your own table using the [Decipad language](/docs/data-organization/tables).

```deci live
SimpleTable = {
  columnA = [1, 2, 3]
  columnB = [4, 5, 6]
}
==> {
  columnA = [ 1, 2, 3 ],
  columnB = [ 4, 5, 6 ]
}
```

## Connect Data and Narrative: Data Links

:::caution `Experimental Feature`
Data Links are currently being developed. This new feature allows you to embed any value from your model directly into your notebook text.
:::

Data Links are the glue between your data and your notebook. If you want to incorporate a result into a paragraph, you can do so by writing the variable name between `%` on any paragraph.

### Here's an example

Firstly, you need to have a variable defined, in our case we have an input widget called `Variable`.

Then, you can add a data link to a paragraph using `%`the-variable-you-previously-defined`%`. This will create a reference to the original variable, in this example the input widget.

![ezgif-5-d38e916afb](https://user-images.githubusercontent.com/12210180/166690768-26c0d9a8-e08d-4666-9243-eecc8f8f095b.gif)

Check how every time the variable value changes, the data link updates. Each time you or someone adjusts the notebook model, the data links will be updated.

# Learn More:

- [Blocks](/blocks)
- [Language](/language)
