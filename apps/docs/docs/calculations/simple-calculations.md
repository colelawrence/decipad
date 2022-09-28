---
sidebar_position: 0
---

# Create Simple Calculations

Currently, there is just one way of manipulating data on your notebook, and that is with calculations blocks.

On the calculation block you can play with numbers and data using the [Decipad language](/calculations).

Other blocks such as tables and widgets are useful for data inputting and display.

To add a calculation block to your notebook:

1.  Write `/` in a new paragraph;
2.  Select **Calculations**.

Here's an example:

```deci live
2 + 2
==> 4
```

As you would expect, [operators](/calculations/simple-calculations) work as in any other mathematical context.

Each calculation block will also resume the operation result on the right for you or anyone reading to follow.

## Numbers

You can express simple integer numbers like this:

```deci live
42
==> 42
```

You can also specify the units of a number:

```deci live
12 bananas
==> 12 bananas
```

Quantities can also be fractional:

```deci live
2.5 coconuts
==> 2.5 coconuts
```

## Arithmetic operations

In Decipad you have all the arithmetic operations you would expect:

```deci live
3 + 5 / 2 * 4 - 7
==> 6
```

When you have numbers with units, these operations also result in numbers with units:

```deci live
7 oranges + 2 oranges
==> 9 oranges
```

Depending on the operations, the units must match. For instance, when adding or subtracting, the units in the numbers should be the same.

Here you can see what happens when you try to add numbers with different units:

```deci live
5 apples + 5 oranges
==> This operation requires compatible units
```

When doing any arithmetic operation with two numbers, you can omit the units in one of them:

```deci live
5 apples - 2
==> 3 apples
```

Decipad tries its best to match plural and singular units:

```deci live
5 bananas + 1 banana
==> 6 bananas
```

Other operations, like exponentiation, do their best to compute the correct units:

```deci live
(3 meters) ** 2
==> 9 meters²
```

You can also use percentages:

```deci live
20% * 5000kg
==> 1000 kg
```

Percentages can be added to other numbers, to increase them proportionally:

```deci live
200m + 5%
==> 210 m
```

## Variables

In a calculation block, you are able to assign names to your data using the `=` sign - we call it creating [variables](/docs/calculations/variables). Naming your data is very useful since it allows you to reference that data point on other blocks just by using its name.

For now, variables can't have spaces on their names, but you can use symbols or emojis. Don't forget that [variables](/docs/calculations/variables) are case-sensitive, meaning that _myvariable_ is different that _MYVARIABLE_.

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

If you are looking to create complex tables, you can always build your own table on a calculation block using the [Decipad language](/docs/guides/tables).

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

- [Language](/calculations)
