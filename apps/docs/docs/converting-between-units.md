---
sidebar_position: 16
---

# Converting between units

Deci understands some basic units. To convert between them you can use the `as` operator like this:

```deci live
3 km as miles
```

```deci live
2 atm as Pa
```

Since Deci understands unit multiplers (`deca` `mili`, `centi`, `h`, `k`), you can use them as unit prefixes:

```deci live
3431 kJoules as calories
```

```deci live
30 cm as m
```

Here is a list of all the units Deci knows:

## Length units

- **meter**, m, metre
- inch
- mile
- angstrom

## Volume units

- **cubicmeter**
- liter

## Pressure units

- **atmosphere**, atm
- Pascal, Pa
- Bar, Ba
- mmHg

## Energy units

- **joule**
- calorie

## Mass units

- **gram**, gr, g
- pound
- ouce
- ton

## Temperature units

- **kelvin**
- celsius
- fahrenheit

## Time units

- **second**
- milisecond
- minute
- hour
- day
- week

## Information units

- **bit**
- byte
