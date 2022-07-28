---
sidebar_position: 330
---

# Tiers & Slices

There are a lot of instances when you need to use a formula on a number until a certain threshold and other formulas as that number grows.

For examples:

* Performance gates in a tiered sales commission structure. When someone sells within a certain range, they may earn a higher percentage of commission. 
* A progressive tax system where each tax bracket is taxed at a different rate.



## Tiers

To make these easier to work on Decipad, we've created a special syntax!
Its called Tiers and here's an example for a sales comission scenario.


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
As the sales cross the `$100,000` mark, the sales comission goes from `5%` to `7%`.


## Tiers Syntax

Let's unpack the syntax.

* The Tier syntax looks a lot like the table syntax, but you will need to specify `<YourNumber>` for evaluation.

* Inside `{}` and before `:`, you can specify each tier threshold.

* After `:` you can specify the formula for each level.

* When defining the formulas, you may use the keyword `tier` to reference `<YourNumber>` on that tier.

Take a look at this conceptual example:

```
tiers <YourNumber> {
  1st tier : Formula for 1st tier
  2nd tier : Formula for 2nd tier
  nth tier : Formula for nth tier
  rest: Formula for scenarios greater than the nth tier
}
```

Optionally, you can specify a maximum and minimum value for your tier system. No matter how big or small your result may be, your tier system will always return between these boundaries.

Check this conceptual example:

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

## Tier Examples

You can use tiers/slices within a formula definition to make it easier to reuse later.

Take a look at this example where we are calculating our income taxes in the UK.

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

`MyIncome`is `£52,000`and my taxes are `£8,231.8`.


------

Give it a try! How do you see yourself using tiers on your notebook?
