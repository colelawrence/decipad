---
pagination_next: null
pagination_prev: null
---

# Define a Boolean

On/Off, 1/0, True/False. Lots of information comes in pairs. We call this data type a boolean. For simplicity, a boolean value can either be _true_ or _false_, but you can use it to represent any type of data pair you want.

## Boolean values

The keywords `true` and `false` are special in the Decipad Language because they represent boolean values. Take a look at these examples:

**Example 1**:

```deci live
true
==> true
```

```deci live
false
==> false
```

When you use the keywords `true` or `false`, they will return themselves since they represent a value.

**Example 2**:

```deci live
On = true
==> true
```

```deci live
Off = false
==> false
```

The next time you need to represent something as `On` or `Off`, you can use a boolean data type!

## Comparing values

Compare two values using comparison operators like this:

```deci live
3 > 2
==> true
```

In this example, the comparison result is `true`.

The available comparison operators are as follows:

- `>`: "greater than"
- `<`: "less than"
- `>=`: "greater than or equal to"
- `<=`: "less than or equal to"
- `==`: "equals"
- `!=`: "not equal to"

## Parentheses

Use parentheses to chain operators and define priorities:

```deci live
10 bananas != (20 bananas / 2)
==> false
```

> Parentheses are used to ensure that the `/` operation on the right side of the `!=` is performed **before** the evaluation of the `!=` itself.
