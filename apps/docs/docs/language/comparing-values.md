---
sidebar_position: 65
---

# Comparing values

## Booleans

The simplest value in the Deci language is a boolean. A boolean value can either be true or false.

You can express boolean values literally:

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

> Notice here that we're using parenthesis. This is because we want to make sure that the operation on the right side of the `==` is done **before** we compare it. If you're using many operators at once, use parenthesis to make sure the operations are done in the order you want.
