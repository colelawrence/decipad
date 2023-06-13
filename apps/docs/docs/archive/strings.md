---
sidebar_position: 2
draft: true
---

# Define a String

Text, words, phases, all of these can be data points, but how do you work with them on your notebook?
The answer is _strings_!

When defining a variable you will have different data types depending on the data you want to represent. For instance, a string is a data type used to represent text.

To declare a string, place your text between quotation marks `"`. Take a look at this example:

```deci live
A = "Hello world!"
A
==> 'Hello world!'
```

The variable `A` is declared with the string "Hello world!". From now on, each time you use the variable `A`, you will be using "Hello world!" behind the scenes.

## Joining two strings

Sometimes you will have separated variables with the phase you want to display and you may want to join them. Join two strings with the `+` operator like this:

```deci live
H = "Hello "
W = "World!"
H + W
==> 'Hello World!'
```
