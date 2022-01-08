---
sidebar_position: 30
---

# Units

## Understanding units

Units can be simple, like in `4 apples`.

Yet, sometimes you need to express units in regards to another unit.

For example, miles per hour is a speed expressing the number of miles travelled in exactly one hour.

```deci live
40 miles/hour
==> 40 miles per hour
```

Decipad will simplify units for you when possible:

```deci live
Speed = 40 miles/hour
Distance = Speed * 4 hours
==> 160 miles
```

> Note: in the example above we're using variables to hold values.
> To declare a variable and assign it a value you can type `variable_name = value`.

The same goes for division:

```deci live
Distance = 40 miles
Duration = 2 hours
Speed = Distance / Duration
==> 20 miles per hour
```

## Converting between units

### Simple units

Decipad understands some basic units. To convert between them you can use the `in` directive like this:

```deci live
3 km in miles
==> 1.8(641135767120019088523025530899546647578143) miles
```

```deci live
2 atm in Pa
==> 202650 Pa
```

Since Decipad understands unit multipliers (`deca` `mili`, `centi`, `h`, `k`), you can use them as unit prefixes:

```deci live
30 cm in m
==> 0.3 m
```

### Complex units

You can also convert more complex units. For instance, you may have the number of bananas per unit of area, and you wish to convert to the number of bananas per another unit of area:

```deci live
10 bananas/meter^2 in bananas/yard^2
==> 8.3612 bananas·yard⁻²
```

Or, with more known units:

```deci live
4184 joules/hour in calories/day
==> 24000 calories per day
```

### Expanding and contracting units

Decipad can contract and expand units automatically. For instance, pressure is force divided by area. So Decipad understands this and tries to do the right thing when you mix these units in conversions:

```deci live
30 newtons/m^2 in bars
==> 0.0003 bars
```

```deci live
30 bars in newton/m^2
==> 3000000 N·m⁻²
```

Or in operations:

```deci live
3 bar + 13 newton/inch^2
==> 206.548 N·inch⁻²
```

Decipad will even auto-convert units when you need the same units for some non-numeric operations:

```deci live
cat([1 meters, 2], [3 centimeters, 4])
==> [ 1 meters, 2 meters, 0.03 meters, 0.04 meters ]
```

### Creating your own units

We don't support all units. However you can create your own:

```
SpeedOfSound = 1234.8 km/h
Bolt = 44.72 km/hour
SpeedOfSound in Bolt
```

### Conversion factors

In Decipad the following

```deci live
Bolt = 44.72 km/hour in meter/sec
==> 12.4(2) meters/sec
```

is the same as

```deci live
Speed = 44.72
HoursToSec = 3600
SpeedInSeconds = Speed / HoursToSec
KmToMeters = 1000
SpeedInMetersSecond = SpeedInSeconds * KmToMeters
==> 12.4(2)
```

### Supported units

[Here is a list of all the units Decipad knows](/docs/docs/language/supported-units).
