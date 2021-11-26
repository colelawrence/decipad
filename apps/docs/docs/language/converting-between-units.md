---
sidebar_position: 16
---

# Converting between units

Deci understands some basic units. To convert between them you can use the `as` operator like this:

```deci live
3 km as miles
==> 1.(864512119328775637041640770665009322560596643878185208203853325046612802983219390926041019266625233064014916096954630205096333126165320074580484773151025481665630826600372902423865755127408328154133001) miles
```

```deci live
2 atm as Pa
==> 202650 Pa
```

Since Deci understands unit multiplers (`deca` `mili`, `centi`, `h`, `k`), you can use them as unit prefixes:

```deci live
3431 kJoules as calories
==> 820.(028680688336520076481835564053537284894837476099426386233269598470363288718929254302103250478011472275334608030592734225621414913957934990439770554493307839388145315487571701720841300191204588910133843212237093690248565965583173996175908221797323135755258126195) calories
```

```deci live
30 cm as m
==> 0.3 m
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
- mmHg, torr
- psi

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
