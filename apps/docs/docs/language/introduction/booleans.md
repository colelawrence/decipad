---
sidebar_position: 65
---

# Booleans

## What they are

A boolean value can either be true or false.

You can express boolean values like this:

```deci live
true
==> true
```

```deci live
false
==> false
```

## Comparing values

You can also compare two values like this:

```deci live
3 > 2
==> true
```

This comparison results in a boolean value (`true` in this case).

You can use other comparators:

- `>`: "greater than"
- `<`: "less than"
- `>=`: "greater or equal"
- `<=`: "less or equal"
- `==`: "equals"
- `!=`: "different"

```deci live
10 bananas != (20 bananas / 2)
==> false
```

> We're using parenthesis to ensure that the operation on the right side of the `==` is done **before** we compare. If you are chaining operators, we recommend you use parenthesis.

## Functions on booleans

[Here is a list of all the functions that work on booleans](/docs/docs/language/built-in-functions/functions-for-booleans).