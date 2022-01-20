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
==> 2 °f
```

## [ENG-211](https://linear.app/decipad/issue/ENG-211)

```deci live
transpose([[5$],[10$],[15$]])
==> [ [ 5 $, 10 $, 15 $ ] ]
```
