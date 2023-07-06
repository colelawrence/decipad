---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Net Present Value

**Syntax**:

`netpresentvalue(Discount Rate, Future Cashflows Column)`

Calculates the net present value of an investment based on a list or column of periodic cash flows and a discount rate. `npv()` is the compact format for readability.

### Examples

```deci live
Revenue = {
  Years = [date(2020)..date(2023)]
  Cashflows = [$100, $500, $200, $400]
}

 NPV = netpresentvalue(5%, Revenue.Cashflows)
==> 1050.6013 $
```
