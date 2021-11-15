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
==> {
  Year = [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ],
  InterestRateFromYear = [ 1, 1.0800, 1.1664, 1.2597, 1.3604, 1.4693 ],
  Price = [ 4 USD/galon, 4.32 USD/galon, 4.67 USD/galon, 5.04 USD/galon, 5.44 USD/galon, 5.88 USD/galon ]
}
```
