---
pagination_next: null
pagination_prev: null
---

# Define a String

When working with text, words, or phrases in your notebook, you can represent them using a data type called **strings**.

To declare a string, enclose your text within quotation marks (`"`). Here's an example:

```deci live
A = "Hello world!"
A
==> 'Hello world!'
```

In this example, the variable `A` is declared with the string "Hello world!". Whenever you use the variable `A`, it represents the text "Hello world!".

## Joining two strings

At times, you may have separate variables that contain parts of a phrase, and you might want to join them together. You can concatenate two strings using the `+` operator. Here's an example:

```deci live
H = "Hello "
W = "World!"
H + W
==> 'Hello World!'
```

In this case, the variables `H` and `W` contain the strings "Hello " and "World!" respectively. By using the `+` operator, you can concatenate them to create the string "Hello World!".