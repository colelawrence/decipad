---
sidebar_position: 10
---

# Explore Numbers and Data

## Calculations

If what you are looking for is to play with numbers, then you'll have fun with the `/calculation block`. To add one, write `/` in a new paragraph and select **Calculations**.

The calculation blocks are the place where you can work with numbers by performing operations in a natural way, powered by the [Decipad language](../language).

```deci live
2 + 2
==> 4
```

## Name your data: Variables

In a calculation block, assign names to data by using the `=` sign - we call it creating [variables](/docs/language/variables).

For now, variables can't have spaces, but you can use symbols or emojis. Don't forget that [variables](/docs/language/variables) are case-sensitive.

Call these variables throughout your notebook to reference your data on calculations.

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

If you are looking to create complex tables, you can always build your own table using the [Decipad language](/docs/organising-your-data/tables).

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

## Share your model!

You just created your first model on a notebook. Click the `Share` button on the right corner of your notebook to generate a public link.

# Learn More:

- [Blocks](/blocks)
- [Language](/language)
