---
sidebar_position: 320
draft: true
---

# Define a Decision Table

## Match

Sometimes you might want to test a group of conditions and return a value when a true statement is found. You can do this using the `match{}` keyword. Sounds complicated?

**Let's explore some practical examples!**

Here you can see how you can determine a salary bonus based on performace. The current `Bonus` is `0.02` because the value for `Performance` matches (in other words, is) `Exceeds`. If the value for `Performance` was "Meets" the `Bonus` would be `0`.

```deci live
Performance = "Exceeds"

Bonus = match {
  Performance == "Meets": 0%
  Performance == "Exceeds": 2%
  Performance == "Greatly exceeds": 3%
}
==> 2%
```

**A more complex example:**

You can also combine decision tables with a custom formula to make them easy to reuse. Let's for example define a formula to match scores of students to their grades:

```deci live
grade(g) = match {
  g >= 90%: "A"
  g >= 80%: "B"
  g >= 70%: "C"
  g >= 60%: "D"
  g >= 0: "F"
}

grade(75%)
==> 'C'
```

![image](https://user-images.githubusercontent.com/12210180/179830955-73f656c1-86b6-4e6f-9b7c-795aaf78c752.png)

Here we are defining a custom formula called `grade(g)` that we then use on a table. Can you see how the `Grades` column is automatically filling the correct score for each student? How cool is that?

## Tiers & Slices

There are a lot of instances when you need to use a formula on a number until a certain threshold, and other formulas as that number grows.

For examples:

- Performance gates in a tiered sales commission structure. When someone sells within a certain range, they may earn a higher percentage of commission.
- A progressive tax system where each tax bracket is taxed at a different rate.

### Tiers

To make these easier to work on Decipad, we've created a special syntax!

Its called `tiers` and it slices a number into different levels of tiers, so you can perform calculations using formulas on each tier. At the end, the results are added up for you.

Here's an example for a sales comission scenario.

```deci live
YourSales = $120 000

tiers YourSales  {
   $50 000 : tier * 5%
  $100 000 : tier * 7%
  $150 000 : tier * 10%
  rest     : tier * 15%
  max      : $500 000
  min      : $5 000
}
==> 8000 $
```

As `YourSales` crosses the `$100,000` mark, the sales comission goes from `5%` to `7%`.

### Tiers Syntax

Let's unpack the syntax.

- The Tier syntax looks a lot like the table syntax, but you will need to specify `<YourNumber>` for evaluation.

- Inside `{}` and before `:`, you can specify each tier threshold.

- After `:` you can specify the formula for each level.

- When defining the formulas, you may use the keyword `tier` to reference `<YourNumber>` on that tier.

**Take a look at this conceptual example:**

```
tiers <YourNumber> {
  1st tier : Formula for 1st tier
  2nd tier : Formula for 2nd tier
  nth tier : Formula for nth tier
  rest: Formula for scenarios greater than the nth tier
}
```

Optionally, you can specify a maximum and minimum value for your tier system. No matter how big or small your result may be, your tier system will always return between these boundaries.

**Check this conceptual example:**

```
tiers <YourNumber> {
  1st tier : Formula for 1st tier
  2nd tier : Formula for 2nd tier
  nth tier : Formula for nth tier
  max: Maximum value
  min: Minimum value
  rest: Formula for scenarios greater than the nth tier
}
```

Optionally you can use `slices` and `slice` instead of `tiers` and `tier`.

### Tier Examples

Take a look at this example where we calculate income taxes in the UK.

This is the current Income Tax Table in the UK:

| Income                       | Income Tax Band |
| ---------------------------- | --------------- |
| Up to £12,570                | 0%              |
| Between £12,571 and £50,270  | 20%             |
| Between £50,271 and £150,000 | 40%             |
| Over £150,000                | 45%             |

Here is how you build it on Decipad:

```deci live
MyIncome = £52000

IncomeTaxes(Income) = slices Income {
   £12570  : slice * 0%
   £50271  : slice * 20%
  £150000  : slice * 40%
   rest    : slice * 45%
}

IncomeTaxes(MyIncome)
==> 8231.8 £
```

On this example, we've combined tiers/slices and a formula definition to make it easier to reuse later. In this case, it allows you to use `ÌncomeTaxes()` each time you want to know how much someone will pay in income tax in the UK.

For this partical situation, since `MyIncome`is `£52,000` my taxes are going to be `£8,231.8`.

| Income                       | Income Tax Band | Tax paid                                  |
| ---------------------------- | --------------- | ----------------------------------------- |
| Up to £12,570                | 0%              | No income tax on the first £12,570        |
| Between £12,571 and £50,270  | 20%             | 20% income tax on you next £37,500 income |
| Between £50,271 and £150,000 | 40%             | 40% on the final £1,730 of income         |
| Over £150,000                | 45%             | No income tax paid at his rate            |

**Let's see another example:**

```deci live
MyIncome = £85000

IncomeTaxes(Income) = slices Income {
   £12570  : slice * 0%
   £50271  : slice * 20%
  £150000  : slice * 40%
   rest    : slice * 45%
}

IncomeTaxes(MyIncome)
==> 21431.8 £
```

Here `MyIncome`is `£85,000`instead of `£52,000` and my taxes are going to be `£21,431.8` instead of `£8,231.8`.

To make these calculations easier, you can also use a table:

![image](https://user-images.githubusercontent.com/12210180/181501145-d4bd8ebd-8e9e-4257-9ab7-81514779a797.png)

---

Give it a try! How do you see yourself using tiers on your notebook?
