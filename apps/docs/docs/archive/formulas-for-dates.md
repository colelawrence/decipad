---
sidebar_position: 20
draft: true
---

# Formulas for Dates

These are built-in formulas that can help you operate on dates.

## Find the youngest date from a column - max()

**Syntax:** `max(Column)`

**Example:**

`max([date(2050-Jan-01), date(2025-Jun-01)])`

`max(Sales.Dates)`

## Find the oldest date from a column - min()

**Syntax:** `min(Column)`

**Example:**

`min([date(2050-Jan-01), date(2025-Jun-01)])`

`min(Sales.Dates)`

## Check if a range contains a date - contains()

This operator allows you to check whether a certain range contains a specific date:

**Syntax:** `[Range] contains [Date]`

**Example:**

`Range = range(date(2050-Jan-01) through date(2050-Dec-31))`

`Range contains date(2050-Feb-02 15:30)`

## Extract the year, month, or day from a date - pick()

Use the `pick()` formula to extract the year, month, or day from a given date.

**Syntax:** `pick(Date, [year/month/day])`

**Example:** `pick(date(2050-Jan-01), year)`

## Control a date precision - round()

Use the `round()` formula to control the precision of a given date. This formula is useful when you have a date for a specific day and you want to perform a calculation referring to its month or year instead.

**Syntax:** `round(Date, [year/month/day])`

**Example:** `round(date(2050-Jan-01), month)`
