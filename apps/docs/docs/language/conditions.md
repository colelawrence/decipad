---
sidebar_position: 70
---

# Conditions

## If Then Else

You can now use a boolean value to perform an operation conditionally by using `if ... then ... else` like this:

```deci live
TheSunIsDown = false
if TheSunIsDown then "Dinner" else "Lunch"
==> 'Lunch'
```

> Here we're using another type of value: the string. "dinner" and "lunch" are strings of text. They're enclosed in quotation marks and can have any character inside except new lines (a new line happens when you press the _Enter_ key).

You can have more complex values inside `if ... then ... else` expressions, but both expressions must have the same type.

For instance, the following is invalid:

```deci live
TheSunIsDown = true
if TheSunIsDown then "dinner" else 337
==> This operation requires a string and a number was entered
```

You can assign the result of an `if ... then ... else` to a variable:

```deci live
Points = 8
Stars = if Points > 6
  then 5
  else Points / 2
==> 5
```

> If you're wondering, no, you can't have an `if` without the `else`. If you did, you wouldn't be able to determine the type of an expression, and that can lead to a whole mess of programming errors that you may want to avoid.

## Decision Tables

Sometimes you might want to test a group of conditions and return a value when a true statement is found. You can do this using the `match{}` keyword. Sounds complicated?

**Let's explore some practical examples!**

Here you can see how you can determine a salary bonus based on performace. The current `Bonus` is `0.02` because the value for `Performance` matches (in other words, is) `Exceeds`. If the value for `Performace` was "Meets" the `Bonus` would be `0`.

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

You can also combine decision tables with [a custom formula](/docs/language/formulas#custom-formulas) to make them easy to reuse. Let's for example define a formula to match scores of students to their grades:

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

Here we are defining [a custom formula](/docs/language/formulas#custom-formulas) called `grade(g)` that we then use on a table. Can you see how the `Grades` column is automatically filling the correct score for each student? How cool is that?
