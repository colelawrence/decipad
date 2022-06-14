---
sidebar_position: 28
---

# Opposites

On/Off, 1/0, True/False. Lots of data information comes in pairs. We call this data type a boolean. For simplicity a boolean value can either be _true_ or _false_, but you can use it to define any type of data pair you want.

## Boolean values

The keywords `true` and `false` are a special on the Decipad Language because they represent a boolean value. Take a look at these examples:

**Example 1**:

```deci live
true
==> true
```

```deci live
false
==> false
```

When you use the keyworkds `true` or `false` they will return themselves since they represent a value.

**Example 2**:

```deci live
On = true
==> true
```

```deci live
Off = false
==> false
```

The next time you need to say that something is `On` or `Off` you can use a boolean data type!

## Comparing values

Compare two values like this:

```deci live
3 > 2
==> true
```

In this example, the comparison result is `true`.

The list of available comparators is the following:

- `>`: "greater than"
- `<`: "less than"
- `>=`: "greater or equal"
- `<=`: "less or equal"
- `==`: "equals"
- `!=`: "different"

## Parenthesis

Use parenthesis to chain operators and define priorities

```deci live
10 bananas != (20 bananas / 2)
==> false
```

> Parentheses are used to ensure that the `/` operation on the right side of the `!=` is performed **before** the evaluation of the `!=` itself.

## Formulas on booleans

[Here is a list of all the functions that work on booleans](/docs/built-in-formulas/formulas-for-booleans).
