---
sidebar_position: 390
---

# Appendix A: Supported units

Deci supports the following units, and compositions of them:

## Length units

The default length unit is Meter (`meter`, `m`).

The following are also supported:

- International Mile (`mile`, `mi`) = `1609.344 m` = `1,760 yards`
- Yard (`yard`, `yd`) = `3 ft`
- Foot (`foot`, `ft`) = `12 inches`
- Inch (`inch`) = `0.0254 m`

```deci live
1 mile in inches
==> 63360 inches
```

Typography & Displays:

- Point (`point`, `pt`) = `1/72.272 inches`
- Twip (`twip`) = `1/1440 inches`
- Pica (`pica`) = `12 points`

```deci live
1 point in twip
==> 19.9247 twips
```

Nautical:

- Nautical Mile (`nauticalmile`, `nmi`) = `1852 m`
- Nautical League (`nauticalleague`, `nl`) = `3 nmi`
- Fathom (`fathom`, `ftm`) = `6 ft`

```deci live
3 nmi in nl
==> 1 nl
```

Natural Sciences:

- Ångström (`angstrom`, `Å`) = `0.1 nm`
- Attometre (`attometre`, `am`) = `1×10e−18 m`
- Fermi (`fermi`, `fm`) = `0.000001 nm`
- Bohr (`bohr`, `a0`, `a₀`) = `5.29177210903e11 m`

```deci live
1 angstrom in am
==> 100000000 am
```

Surveyor:

- Furlong (`furlong`, `fur`) = `220 yd`
- Chain (`chain`, `ch`) = `66 ft`
- Rod (`rod`, `rd`) = `0.25 chain`
- Link (`link`, `lnk`) = `7.92 inches`

```deci live
1 rod in link
==> 25 links
```

Astronomy:

- Astronomical unit (`austronomicalunit`, `au`) = `1.495978707×10e11 m`
- Light Year (`lightyear`, `ly`) = `9.4607304725808×10e15 m`
- Light Hour (`lightday`, `ld`) = `24 lh`
- Light Hour (`lighthour`, `lh`) = `60 lm`
- Light Minutes (`lightminute`, `lm`) = `60 ls`
- Light Second (`lightsecond`, `ls`) = `299792458 m`
- Parsec (`parsec`, `pc`) = `30856775814913700 m`

```deci live
1 ls in marathons
==> 7104.9(284986372792984950823557293518189358928783031164829956155942647233084488683493304893944780187225974641545206778054271833155587154876170162341509657542362839198957222419717976063514634435359639767744993482640123237350396966465220997748548406209266500770233439981040407631235928427538807915629813958999881502547695224552672117549472686337243749259390923095153454200734684204289607773432871193269344709088754591776276810048583955444957933404431804716198601730062803649721530987083777698779476241260812892522810759568669273610617371726507880080578267567247304182960066358573290674250503614172295295651143500414741083066714065647588576845597819646877592131769166962910297428605) marathons
```

Fun:

- Rope (`rope`) = `6.096 m`
- Hand (`hand`) = `4 inches`
- Smoot (`smoot`) = `1,702 m`
- Marathon (`marathon`) = `42195 m`
- League (`league`, `lea`) = `4828 m`

It takes over 26 horse races to make a marathon.

```deci live
(1 marathon in furlong) / 8
==> 26.2187(574564543068480076354092102123598186590312) furlongs
```

## Area units

The default length unit is Square Meter (`squaremeter`, `m2`, `m²`).

The following are also supported:

- Square Kilometer (`squarekilometre`, `km2`, `km²`) = `10e6 m2`
- Square Mile (`squaremile`, `sqmi`) = `2,589,988.110336 m2` = `3,097,600 sqyd`
- Square Yard (`squareyard`, `sqyd`) = `9 sqft`
- Square Foot (`squarefoot`, `sqft`) = `144 sqin`
- Square Inch (`squareinch`, `sqin`) = `0.00064516 m2`

```deci live
(1 mi * 1mi in m^2) == (1 sqmi in m2)
==> true
```

Natural Sciences:

- Barn (`barn`, `b`) = `10e−28 m2`

Surveyor:

- Hectare (`hectare`, `ha`) = `10,000 m2`
- Are (`are`, `a`) = `100 m2`
- Acre (`acre`, `ac`) = `4840 sqyd`
- Barony (`barony`) = `4000 ac`

```deci live
1 ac in sqyd
==> 4840 sqyd
```

## Volume units

The default length unit is Square Meter (`cubicmeter`, `m3`, `m²`).

The following are also supported:

- Cubic Mile (`cubicmile`, `cumi`) ≡ `4168181825.440579584 m3`

- Cubic Yard (`cubicyard`, `yd3`, `cuyd`) = `27 ft3`

- Cubic Foot (`cubicfoot`, `ft3`, `cuft`) = `1,728 sqin`

- Cubic Inch (`cubicinch`, `in3`, `cuin`) = `16.387064×10e−6 m3`

- Acre Foot (`acrefoot`, `acft`) = `1 ac x 1 ft`

- Ton (`ton`) = `0.99108963072 m3`

- Barrel (`barrel`, `bl`) = `36 gal`

- Bushel (`bushel`, `bu`) = `8 gallons`

- Bucket (`bucket`, `bkt`) = `4 gallons`

- Gallon (`gallon`, `gal`) = `4.54609 liters`

- Liter (`liter`, `l`) = `0.001 m3`

```deci live
1 barrel in gallon
==> 36 gallons
```

```deci live
(1 ac * 1 ft) in acft
==> 999.9999 acft
```

Cooking:

- Cup (`cup`) = `250×10e−6 m3`
- Pint (`pint`) = `≡ 1/8 gal`
- Table Spoon (`tablespoon`, `tbsp`) = `3 tsp`
- Tea Spoon (`teaspoon`, `tsp`) = `5×10e−6 m3`
- Ounce (`ounce`, `floz`) = `1⁄160 gal`
- Pinch (`pinch`) = `1/16 tsp`
- Dash (`dash`) = `1/2 pinch`

```deci live
20 tbsp in cups
==> 1.2 cups
```

## Pressure units

- **atmosphere**, atm
- Pascal, Pa
- Bar, Ba
- Torr, mmHg
- PSI

## Energy units

- **joule**
- calorie

## Force units

- **Newton**, N

## Mass units

- **gram**, gr, g
- pound
- ounce
- ton

## Temperature units

- **kelvin**, °K
- celsius, °C
- fahrenheit, °F

## Time units

- **second**
- millisecond
- minute
- hour
- day
- week
- month
- year

## Frequency units

- **Hertz**, Hz

## Information units

- **bit**
- byte

## Power units

- **Watt**, W

## Substance units

- **mole**

## Electric current units

- **Ampere**, amp

## Electric charge units

- **Coulomb**, C

## Electrical capacitance

- **Farad**, F

## Electrical resistance

- **Ohm**, Ω

## Voltage

- **Volts**, V
