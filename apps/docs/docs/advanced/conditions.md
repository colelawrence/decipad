---
sidebar_position: 0
---

# Conditions

Conditions are expressions you define to control calculations.

These are the key concepts to understand when working with conditions in Decipad:

- **Booleans** : Booleans represent pairs of data with values of `true` or `false`. They are used to define conditions and make decisions in your code. Booleans can also be the result of a comparison or logical operations.

- **Comparison Operators**: Comparison operators allow you to compare values and return a boolean value (`true` or `false`) based on the result of the comparison. Common comparison operators include:

  - Greater than `>`
  - Less than `<`
  - Greater or equal than `>=`
  - Less or equal than `<=`
  - Equal to `==`
  - Different to `!=`

  **Example:** For a `Price = $200` the condition `Price > $100` is true, however, if `Price` is `$300` the condition is false.

- **Logical Operators**: Logical operators enable you to combine and manipulate boolean values. The `not` operator negates a boolean value, `and` returns `true` if both operands are true, and `or` returns `true` if at least one operand is true.

  **Example:** `TotalSales < $500 and Discount > 5%`.

Combining comparison and logical operators allows you to create conditions that evaluate to either `true` or `false`. They can be used to control your calculations based on their outcome,

## If-Then-Else Conditions

:::tip Syntax

` if [Condition] then [Calculation when Condition is True] else [Calculation when Condition is False]`

:::

The `if [Condition] then ... else ...` statement lets you to create calculations conditionally. It takes your condition, check wether it is true or false, and performs a calculation based on that.

:::note Examples

Let's consider a scenario where we have a condition `Item > $200` . We want to determine if a certain item is overpriced or underpriced.

`if Item > $200 then "Overpriced" else "Underpriced"`

In this example, the condition `Item > $200` is evaluated. If it is `true`, the value "Overpriced" is returned; otherwise, the value "Underpriced" is returned. It's important to ensure that the expressions in the "then" and "else" parts return the same data type. Mixing different types can lead to errors.

:::

Additionally, in tables, you can use the keyword `first` with the If-Then-Else statement to check for the first row.

:::note Examples

Showcase a different message on the first row: <br />
`if first then "I am the first row" else "I am not the first row"`

Compute income increases based on a set value from a slider: <br />
`if first then IncomeSlider else previous(0) + 5%`

:::

## Verification Conditions

:::tip Syntax

`assert([Condition])`

:::

To ensure that certain conditions are met on your notebook, you can use the `assert()` statement. It checks a condition and creates an error in the notebook if the condition is not true. This helps in validating assumptions and catching errors.

:::note Examples

`assert(Sales >= $0)`

If `Sales < $0` an error will be generated, highlighting any discrepancy on your notebook.

:::

## Checking Multiple Conditions

:::tip Syntax

```
[Result] = match {
  [Condition 1]: [Result 1]
  [Condition 2]: [Result 2]
  [Condition 3]: [Result 3]
              ...
}
```

:::

The `match{}` statement tests a group of conditions and returns a value when a true statement is found. It simplifies decision-making based on specific conditions.

:::note Examples

Suppose we have a variable `Performance` with the value "Exceeds". We want to determine the bonus based on the performance level.

```deci live
Performance = "Exceeds"

Bonus = match {
  Performance == "Meets": 0%
  Performance == "Exceeds": 2%
  Performance == "Greatly exceeds": 3%
}
```

In this example, the `Bonus` variable will be assigned the value of 2% because the value of `Performance` matches the condition "Exceeds". The `match()` statement allows us to specify different conditions and their corresponding results or calculations.

:::

## Calculating Tiers

:::tip Syntax

```
tiers [Your Value] {
         [Tier 1]: [Value or Calculation]
         [Tier 2]: [Value or Calculation]
         [Tier 3]: [Value or Calculation]
                            ...
  [Optional] rest: [Value or Calculation]
  [Optional]  max: [Value or Calculation]
  [Optional]  min: [Value or Calculation]
}
```

:::

Tiers allow you to slice a number into different levels and perform calculations on each tier. It simplifies complex scenarios such as tiered sales commission structures or progressive tax systems.

:::note Examples

Let's consider a sales commission scenario where the commission rate varies based on the sales amount (`YourSales`).

```deci live
YourSales = $120000

tiers YourSales {
   $50000: tier - 5%
  $100000: tier - 7%
  $150000: tier - 10%
      rest: tier - 15%
       max: $500000
       min: $5000
}
```

In this example, the `YourSales` variable is divided into different tiers based on the specified thresholds. The commission percentage changes as the sales amount crosses these thresholds. The `tiers` statement allows us to define calculations for each tier and handle scenarios beyond the defined thresholds.

:::

### Reusing Tiers with a Custom Function

To make tier calculations more reusable, you can define a custom formula that incorporates the tiers.

:::note Examples

In this example, the `CalculateSales` formula takes the `YourSales` variable as input and applies the tiered calculation defined in the `tiers` formula. This allows you to easily calculate sales based on different sales amounts by using the `CalculateSales()` formula.

```deci live
CalculateSales(YourSales) = tiers YourSales {
   $50000: tier - 5%
  $100000: tier - 7%
  $150000: tier - 10%
      rest: tier - 15%
       max: $500000
       min: $5000
}

CalculateSales($120000)
```

By calling `CalculateSales($120000)`, you will get the result based on the tiered calculations for that specific sales amount.

:::
