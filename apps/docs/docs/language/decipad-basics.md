---
sidebar_position: 5
---

# Decipad Basics

## What is Decipad?

Decipad is an interactive document to gather information, build models in minutes and bring data-driven ideas to life.

## Get started with Decipad in 4 easy steps

### 👉🏽 Step 1 - Create your first notebook

Think of a notebook as a place where narrative and data coexist. In a notebook, you can type text as well as type `/`to create calculation blocks and tables and easily move all of these up and down.

### 👉🏽 Step 2 - How much is `2+2`

If what you are looking for is to play with numbers, then you'll have fun with the `/calculation block`. The calculation block is the place where you can type numbers and perform operations in a more natural way powered by the [Deci language](docs/docs/language/start.md#deci-language-intro).

```deci live
2 + 2
==> 4
```

### 👉🏽 Step 3 - Name your data

In a calculation block, you can assign a name to your data by using the `=` operator - we call it creating [variables](docs/docs/language/name-assignment.md#declaring-variables). This is a useful way to quickly reuse data throughout your notebook as you build your model. For now, variables can't use spaces, symbols or emoji, and are also case sensitive. We recommend using underscore or dash when you name_something_in_Decipad.

```deci live
Total_Guests = 300
==> 300
```

### 👉🏽 Step 4 - <3 Tables, tables, tables

Type `/table` and easily add a table to your notebook. Data in a table can be text, numbers or dates. Same as with variables, you can name your table and use it as an input in an operation. Operations are not yet possible on tables, but we're working on it 💪
If you prefer, you can always build your own table using the [Deci language](docs/docs/language/start.md#deci-language-intro).

```deci live
Simple_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}
==> {
  column_A = [ 1, 2, 3 ],
  column_B = [ 4, 5, 6 ]
}
```
