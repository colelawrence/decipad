---
sidebar_position: 350
---

# Playground

Here you can freely try the Deci language:

```deci live
Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}
==> {
  Year = [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ],
  InterestRateFromYear = [ 1, 1.08, 1.1664, 1.2597, 1.3604, 1.4693 ],
  Price = [ 4 USD/gallon, 4.32 USD/gallon, 4.67 USD/gallon, 5.04 USD/gallon, 5.44 USD/gallon, 5.88 USD/gallon ]
}
```
