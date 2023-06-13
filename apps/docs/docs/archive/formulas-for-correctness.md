---
sidebar_position: 331
draft: true
---

# Formulas for Correctness

Ensure your notebook is always in a correct state, by double-checking your calculations programmatically.

## Check a condition - assert()

Creates an error in the notebook if the condition is not true

**Syntax:** `assert( Condition )`

```deci live
ledger = 5000 $
moneyInBank = 4999$
assert(ledger == moneyInBank)
==> User defined pre-condition was not met
```
