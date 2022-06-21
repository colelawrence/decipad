---
sidebar_position: 8
---

# Calculations

Currently, there is just one way of manipulating data on your notebook, and that is with calculations blocks.

On the calculation block you can play with numbers and data using the [Decipad language](../language).

Other blocks such as tables and widgets are useful for data inputting and display.

To add a calculation block to your notebook:

1. Write `/` in a new paragraph;
2. Select **Calculations**.

Here's an example:

```deci live
2 + 2
==> 4
```

As you would expect, [operators](../language/numbers/arithmetic-functions) work as in any other mathematical context.

Each calculation block will also resume the operation result on the right for you or anyone reading to follow.

## Variables

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

## Language Tables

If you are looking to create complex tables, you can always build your own table on a calculation block using the [Decipad language](/docs/data-organization/tables).

Take a look at this example:

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

---

# Learn More:

- [Language](/language)
