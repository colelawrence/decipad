# lol what are you doing here?

## [ENG-242](https://linear.app/decipad/issue/ENG-242)

```deci live
[1 cm, 1m]
==> Column cannot contain both cm and m
```

## [ENG-275](https://linear.app/decipad/issue/ENG-275)

```deci live
AddDifferentDateUnits = [ date(2020-01) ] + [ 1 year ]
==> [ month 2021-01 ]
```

## [ENG-246](https://linear.app/decipad/issue/ENG-246)

```deci live
Offer = 10 $
Step = 100%
Duration = [1..10]

grow(Offer, Step, Duration)
==> [ 10 $, 20 $, 40 $, 80 $, 160 $, 320 $, 640 $, 1280 $, 2560 $, 5120 $ ]
```

## [ENG-277](https://linear.app/decipad/issue/ENG-277)

```deci live
300000 N/m^2 + 1 bar
==> 4 bars
```

## [ENG-140](https://linear.app/decipad/issue/ENG-140)

```deci live
(900*m**2)**(1/2)
==> 30 m
```

## [ENG-263](https://linear.app/decipad/issue/ENG-263)

```deci live
Time = [date(2022-01) .. date(2025-01) by quarter]
StartingDate = first(Time)
==> month 2022-01
```

## [ENG-251](https://linear.app/decipad/issue/ENG-251)

```deci live
miles * hour^-1
==> 1 miles per hour
```

## [ENG-242](https://linear.app/decipad/issue/ENG-242)

```deci live
[1cm, 2m, 3cm]
==> Column cannot contain both cm and m
```

## [ENG-216](https://linear.app/decipad/issue/ENG-216)

```deci live
Speed = 10 miles / hour
grow(Speed, 10%, [1, 2, 3])
==> [ 10 miles per hour, 11 miles per hour, 12.1 miles per hour ]
```

## [ENG-270](https://linear.app/decipad/issue/ENG-270)

```deci live
1 fahrenheit + 1
==> 2 °F
```

## [ENG-211](https://linear.app/decipad/issue/ENG-211)

```deci live
transpose([[5$],[10$],[15$]])
==> [ [ 5 $, 10 $, 15 $ ] ]
```

## [ENG-286](https://linear.app/decipad/issue/ENG-286)

```deci live
Animals = {
  Name = ["Person", "Falcon"]
  Speed = [27.33 miles/hour, 55 miles/hour]
}

Animals2 = {
  Name = Animals.Name
  Speed = [27.33 mph, 55 mph]
}

Animals3 = {
  Name = Animals.Name
  Speed = [27.33 miles/hour in kilometer/second, 55 miles/hour in kilometer/second]
}

Race = {
  Name = ["Quarter", "Half", "Marathon"]
  Distance = [0.25 marathon, 0.5 marathon, 1 marathon]
}

Hours = round(sum(1/(Animals.Speed / Race.Distance) in hours), 2)
Hours2 = round(sum(1/(Animals2.Speed / Race.Distance) in hours), 2)
Hours3 = round(sum(1/(Animals3.Speed / Race.Distance) in hours), 2)


[Hours, Hours2, Hours3]
==> [ [ 1.68 hours, 0.83 hours ], [ 1.68 hours, 0.83 hours ], [ 1.68 hours, 0.83 hours ] ]
```

Why?

```deci live
Distance = 1.75 marathons in miles
Speed = [27.33 miles/hour, 55 miles/hour]
round(1/(Speed / Distance), 2)
==> [ 1.68 hours, 0.83 hours ]
```

## [ENG-139](https://linear.app/decipad/issue/ENG-139)

```deci live
A = 3
SQRTZ = sqrt(A * 3)
==> 3
```

## [ENG-327](https://linear.app/decipad/issue/ENG-327)

```deci live
Table = { A = 1 }
select(Table, B)
==> The selected column does not exist in the reference table
```

```deci live
Table = { A = 1 }
select(Table, A)
==> {
  A = [ 1 ]
}
```

```deci live
Table = { A = 1 }
select(Table, B, A)
==> The selected column does not exist in the reference table
```

## [ENG-297](https://linear.app/decipad/issue/ENG-327)

Part 1: splitby was malfunctioning

```deci live
People = {
  Name = ["Peter", "Paul", "Mary"]
  Origin = ["US", "UK", "US"]
}
Countries = splitby(People, People.Origin)
lookup(Countries, Countries.Origin == "UK")
==> {
  Origin = 'UK',
  Values = {
  Name = [ 'Paul' ]
}
}
```
