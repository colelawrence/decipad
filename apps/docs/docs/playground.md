---
sidebar_position: 200
---

# Playground

Here you can freely try the Deci language:

```deci live
Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/galon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}
```
