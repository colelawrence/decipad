---
sidebar_position: 40
---

# Converting between units

## Simple units

Deci understands some basic units. To convert between them you can use the `in` operator like this:

```deci live
3 km in miles
==> 1.(864512119328775637041640770665009322560596643878185208203853325046612802983219390926041019266625233064014916096954630205096333126165320074580484773151025481665630826600372902423865755127408328154133001) miles
```

```deci live
2 atm in Pa
==> 202650 Pa
```

Since Deci understands unit multiplers (`deca` `mili`, `centi`, `h`, `k`), you can use them as unit prefixes:

```deci live
3431 kJoules in calories
==> 820.(028680688336520076481835564053537284894837476099426386233269598470363288718929254302103250478011472275334608030592734225621414913957934990439770554493307839388145315487571701720841300191204588910133843212237093690248565965583173996175908221797323135755258126195) calories
```

```deci live
30 cm in m
==> 0.3 m
```

[Here is a list of all the units Deci knows](/docs/docs/language/supported-units).

## Complex units

You can also convert more complex units. For instance, you may have the number of bananas per unit of area, and you wish to convert to the number of bananas per another unit of area:

```deci live
10 bananas/meter^2 in bananas/yard^2
==> 8.3612 bananas/yard^2
```

Or, with more known units:

```deci live
4184 joules/hour in calories/day
==> 24 calories/day
```

## Expanding and contracting units

Deci understands how some units can be decomposed in other units. For instance, pressure is force divided by area. So Deci understands this and tries to do the right thing when you mix these units in conversions:

```deci live
30 newtons/m^2 in bars
==> 0.0003 bars
```

```deci live
30 bars in newton/m^2
==> 3000000 newtons/m^2
```

Or in operations:

```deci live
30 psi + 1 newton/inch^2
==> 134.4460 newtons/inch^2
```

## Conversion Factors

In Decipad the following 

```deci live
Bolt = 44.72 km/hour in meter/sec
==> 12.4(2) meters/sec
```

is equivalent to

```deci live
Speed = 44.72 km/hour
HoursToSec = 3600 sec/hour
SpeedInSeconds = Speed / HoursToSec
KmToMeters = 1000 meter/km
SpeedInMetersSecond = SpeedInSeconds * KmToMeters
==> 12.4(2) meters/sec
```
