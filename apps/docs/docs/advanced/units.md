---
sidebar_position: 6
---

# Number Units

Units specify the measurement or quantity of a number, adding context and meaning to calculations. They also simplify calculations by handling conversions automatically, eliminating the need for manual conversions.

These are the key concepts to understand units in Decipad:

- **Simple Units**: Simple units are straightforward and represent a specific quantity. For example, `$4` denotes 4 in dollars.
- **Complex Units**: Complex units involve combinations of measurements, rates, or compound units. For instance, `miles per hour` represents the speed at which a distance is covered in one hour.
- **Built-in Units**: Decipad already supports a list of several known units that you can reuse on your calculations. See list bellow.
- **Custom Units** You can define your own units simply by adding them to your calculations and Decipad will automatically detect them. Example: `5 mugs` or `5$ per mug`. Alternatively you can use the `add custom unit` field on any formula block or column.

### Converting Between Units

:::tip Syntax
`[Number] [Source Unit] in [Target Unit]`

:::

Decipad understands basic units and offers a conversion capability using the `in` keyword. To convert a value from one simple unit to another, use the following syntax:

:::note Example

Convert 3 kilometers to miles: `3 kilometers in miles`

:::

### Working with Formulas and Units

Decipad provides additional formulas to help you manipulate numbers with units.

- `stripunit()` removes the units from a calculation, allowing you to work with the numbers alone. **Example:** `stripunit(5$ per mug)` will return `5`.
- `getunit()` retrieves the units used in a calculation, providing you with the unit information associated with the value. **Example:** `getunit(10$)` will return `$`.

These formulas are particularly useful when you need to perform calculations or comparisons without considering the units or when you want to extract the units for further analysis.

## Built-in Units

### Currencies Units

- 🇺🇸 United States dollar (`USD`): `$`
- 🇪🇺 Euro (`EUR`): `€`
- 🇯🇵 Japanese yen (`JPY`): `¥`
- 🇬🇧 Pound sterling (`GBP`): `£`
- 🇦🇺 Australian dollar (`AUD`): `A$`
- 🇨🇦 Canadian dollar (`CAD`): `C$`
- 🇨🇭 Swiss franc (`CHF`): `CHF`
- 🇨🇳 Renminbi (`CNY`): `¥`
- 🇭🇰 Hong Kong dollar (`HKD`): `HK$`
- 🇳🇿 New Zealand dollar (`NZD`): `NZ$`
- 🇸🇪 Swedish krona (`SEK`): `skr`
- 🇰🇷 South Korean won (`KRW`): `₩`
- 🇸🇬 Singapore dollar (`SGD`): `S$`
- 🇳🇴 Norwegian krone (`NOK`): `nkr`
- 🇲🇽 Mexican peso (`MXN`): `$`
- 🇮🇳 Indian rupee (`INR`): `₹`
- 🇷🇺 Russian ruble (`RUB`): `₽`
- 🇿🇦 South African rand (`ZAR`): `R`
- 🇹🇷 Turkish lira (`TRY`): `₺`
- 🇧🇷 Brazilian real (`BRL`): `R$`
- 🇹🇼 New Taiwan dollar (`TWD`): `NT$`
- 🇩🇰 Danish krone (`DKK`): `dkr`
- 🇵🇱 Polish złoty (`PLN`): `zł`
- 🇹🇭 Thai baht (`THB`): `฿`
- 🇮🇩 Indonesian rupiah (`IDR`): `Rp`
- 🇭🇺 Hungarian forint (`HUF`): `Ft`
- 🇨🇿 Czech koruna (`CZK`): `Kč`
- 🇮🇱 Israeli new shekel (`ILS`): `₪`
- 🇨🇱 Chilean peso (`CLP`): `CLP$`
- 🇵🇭 Philippine peso (`PHP`): `₱`
- 🇦🇪 UAE dirham (`AED`): `د.إ`
- 🇨🇴 Colombian peso (`COP`): `COL$`
- 🇸🇦 Saudi riyal (`SAR`): `﷼`
- 🇲🇾 Malaysian ringgit (`MYR`): `RM`
- 🇷🇴 Romanian leu (`RON`): `L`
- 🇺🇦 Ukrainian hryvnia (`UAH`): `₴`

### Time Units

- Second (`second`, `sec`, `s`).
- Year (`year`, `y`) = `12 months`
- Month (`month`, `m`) = `1/12 year`
- Week (`day`, `day`) = `7 days`
- Day (`day`, `day`) = `24 h`
- Hour (`hour`, `h`) = `60 minutes`
- Minutes (`minute`, `m`) = `60 s`

### Length Units

- Mile (`mile`, `mi`) = `1609.344 m` = `1,760 yards`
- Yard (`yard`, `yd`) = `3 ft`
- Foot (`foot`, `ft`) = `12 inches`
- Inch (`inch`, `in`) = `0.0254 meters`
- Rope (`rope`) = `6.096 meters`
- Hand (`hand`) = `4 inches`
- Smoot (`smoot`) = `1,702 meters`
- Marathon (`marathon`) = `42195 meters`
- League (`league`, `lea`) = `4828 meters`

### Area Units

- Square Meter (`squaremeter`, `m2`, `m²`).
- Square Kilometer (`squarekilometre`, `km2`, `km²`) = `10e6 m2`
- Square Mile (`squaremile`, `sqmi`) = `2,589,988.110336 m2` = `3,097,600 sqyd`
- Square Yard (`squareyard`, `sqyd`) = `9 sqft`
- Square Foot (`squarefoot`, `sqft`) = `144 sqin`
- Square Inch (`squareinch`, `sqin`) = `0.00064516 m2`
- Barn (`barn`, `b`) = `10e−28 m2`
- Hectare (`hectare`, `ha`) = `10,000 m2`
- Are (`are`, `a`) = `100 m2`
- Acre (`acre`, `ac`) = `4840 sqyd`
- Barony (`barony`) = `4000 ac`

### Mass Units

- Gram (`g`, `gr`)
- Tonne (`tonne`) = `1000 kg`
- Ton (`ton`) = `2240 lbav`
- Pound (Imperial) (`lbav`) = `0.45359237 kg`
- Ounce (Imperial) (`ozav`) = `1⁄16 lbav`
- Ounce (US food nutrition labelling) (`oz`) = `28 g`

### Temperature Units

- Kelvin (`kelvin`, `K`).
- Celsius (`celsius`, `°c`) = `[K] ≡ [°C] + 273.15`
- Fahrenheit (`fahrenheit`, `°f`) = `[K] ≡ ([°F] + 459.67) × 5⁄9`

### Cooking Units

- Cup (Metric) (`cup`) = `250×10e−6 m3`
- Tea Spoon (Metric) (`teaspoon`, `tsp`) = `5×10e−6 m3`
- Table Spoon (Metric) (`tablespoon`, `tbsp`) = `3 tsp`
- Pinch (Metric) (`pinch`) = `1/16 tsp`
- Dash (Metric) (`dash`) = `1/2 pinch`

### Volume Units

- Cubic Meter (`cubicmeter`, `m3`, `m³`).
- Liter (`liter`, `l`) = `0.001 m3`
- Cubic Mile (`cumi`) ≡ `4168181825.440579584 m3`
- Cubic Inch (`in3`, `in³`, `cuin`) = `16.387064×10e−6 m3`
- Cubic Yard (`yd3`, `yd³`,`cuyd`) = `27 ft3`
- Cubic Foot (`ft3`, `ft³`, `cuft`) = `1,728 sqin`
- Acre Foot (`acrefoot`, `acft`) = `1 ac x 1 ft`
- Ton (`ton_displacement`) = `0.99108963072 m3`
- Gallon (Imperial) (`gallon`, `gal`) = `4.54609 liters`
- Barrel (Imperial) (`barrel`, `bl`) = `36 gal`
- Bushel (Imperial) (`bushel`, `bu`) = `8 gallons`
- Bucket (Imperial) (`bucket`, `bkt`) = `4 gallons`
- Pint (Imperial) (`pint`) = `≡ 1/8 gal`
- Ounce (Imperial) (`floz`) = `28.4130625×10e−6 m3`

### Typography & Displays Units

- Point (American, English) (`point`, `pt`) = `1/72.272 inches`
- Twip (`twip`) = `1/1440 inches`
- Pica (`pica`) = `12 points`

### Natural Science Units

- Ångström (`angstrom`, `Å`) = `0.1 nm`
- Attometre (`attometre`, `am`) = `1×10e−18 m`
- Fermi (`fermi`, `fm`) = `0.000001 nm`
- Bohr (`bohr`, `a0`, `a₀`) = `5.29177210903e-11 m`

### Nautical Units

- Nautical Mile (`nauticalmile`, `nmi`) = `1852 m`
- Nautical League (`nauticalleague`, `nl`) = `3 nmi`
- Fathom (`fathom`, `ftm`) = `6 ft`

### Surveyor Units

- Furlong (`furlong`, `fur`) = `220 yd`
- Chain (`chain`, `ch`) = `66 ft`
- Rod (`rod`, `rd`) = `0.25 chain`
- Link (`link`, `lnk`) = `7.92 inches`

### Astronomy Units

- Astronomical unit (`austronomicalunit`, `au`) = `1.495978707×10e11 m`
- Light Year (`lightyear`, `ly`) = `9.4607304725808×10e15 m`
- Light Day (`lightday`, `ld`) = `24 lh`
- Light Hour (`lighthour`, `lh`) = `60 lm`
- Light Minutes (`lightminute`) = `60 ls`
- Light Second (`lightsecond`, `ls`) = `299792458 m`
- Parsec (`parsec`, `pc`) = `30856775814913700 m`

### Speed Units

- Kimoleter per hour (`kilometer/hour`)
- Meter per second (`meter/second`)
- Mile per hour (`mph`)
- Knot (`knot`) = `1 nmi/hour` = `1.852 kilometer/hour`

### Pressure Units

- Atmosphere (`atmosphere`, `atm`).
- Pascal (`pascal`, `pa`) = `1/101325 atm`
- Bar (`bar`, `ba`) = `105 Pa`
- Torr (`torr`, `mmHg`) = `1/760 atm`
- Pound per square inch(\*) (`psi`) =

### Energy Units

- Joule (`Joule`, `J`)
- Calorie (`calorie`, `cal`) = `4.1868 J`
- Watt hour (`Wh`) = `3600 J`

### Force Units

- Newton (`newton`, `N`).

### Frequency Units

- Newton (`hertz`, `Hz`).

### Information Units

- Bit (`bit`)
- Byte (`byte`)

### Chemistry Units

- Mole (`mole`, `mol`).

### Electrical Units

- Watt (`watt`, `W`).
- Current (`ampere`, `A`)
- Coulomb (`coulomb`, `C`)
- Farad (`farad`, `F`)
- Omh (`omh`, `Ω`)
- Siemens (`siemens`)
- Volt (`volt`, `V`)

### Luminosity Units

- Candela (`candela`, `cd`)
- Lumen (`lumen`, `lm`)

### Solid Angle

- Lumen (`steraradian`, `sr`)

### Angles Units

- Radians (`radian`, `rad`)
- Degrees (`degree`, `°`)
