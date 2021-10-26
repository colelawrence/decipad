---
sidebar_position: 3
---

# Functions for booleans

Deci has a bunch of built-in functions that operate on booleans. They are:

## not

This operator negates a boolean:

```deci live
not true
```

## and

This binary operator takes two booleans and results `true` if and only if both arguments are true:

```deci live
can_travel = true
can_afford_traveling = false
will_travel = can_travel and can_afford_traveling
```

## or

This binary operator takes two booleans and results `false` if and only if both arguments are false:

```deci live
on_vacation = false
sick = true
skip_work = on_vacation or sick
```
