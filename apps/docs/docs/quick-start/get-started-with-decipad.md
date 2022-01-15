---
sidebar_position: 5
---

# Get started with Decipad

## Step 1 - Create your first notebook

Think of a notebook as a place where narrative and data coexist. In a notebook, you can type text as well as type `/`to create calculation blocks and tables and easily move all of these up and down.

## Step 2 - Add calculations

If what you are looking for is to play with numbers, then you'll have fun with the `/calculation block`. The calculation block is the place where you can type numbers and perform operations in a more natural way powered by the [Decipad language](/docs/language/introduction-to-the-language).

```deci live
2 + 2
==> 4
```

## Step 3 - Name your data

In a calculation block, you can assign a name to your data by using the `=` operator - we call it creating [variables](/docs/language/variables). This is a useful way to quickly reuse data throughout your notebook as you build your model. For now, variables can't use spaces, symbols or emoji, and are also case sensitive.

```deci live
NameSomethingInDecipad = 300
==> 300
```

## Step 4 - Use tables to add more data

Type `/table` and easily add a table to your notebook. Data in a table can be text, numbers or dates. Same as with variables, you can name your table and use it as an input in an operation.

![tables](https://user-images.githubusercontent.com/76447845/146926068-463a1bc4-e70d-443d-a05b-6f49dcecf310.gif)

If you're a builder, you can always build your table using the [Decipad language](/docs/organising-your-data/tables).

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

## Step 5 - Share your work

You've done it! You created your first notebook and now you can share it with the world. Click on the `Share` button on the right corner of your notebook to generate a public link that you can then copy and share it with anyone.
