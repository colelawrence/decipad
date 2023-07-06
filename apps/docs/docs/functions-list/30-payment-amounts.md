---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
slug: 'payment-amounts'
---

# Payment Amounts

**Syntax**:

`paymentamounts(Rate, Number of Periods, Amount)`

Calculates the annual payment amount of a loan considering the borrowed amount, the number of repayment periods, and a constant interest rate. `pmt()` is the compact format for readability.

### Examples

```deci live
paymentamounts(3%, 36 months, $10k)
==> 458.0379 $ per month
```
