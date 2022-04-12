---
sidebar_position: 40
---

# Unit quality

Besides a quantity, a unit can also have a quality.

For instance, `1 kilogram of flour` and `30 grams of sugar` have the same quantity fundamental unit (mass), but they have different qualities.

You can encode these qualities in Deci:

```deci live
flour = 2 kg of flour
butter = 150 g of butter

ratio = butter / flour
==> 75 g of butter/kg of flour
```

Here, using the `of` keyword you can add a **quality** to your quantities, making Deci understand more about your calculations and how to manage operations between them.

Here is another exmple of units with applied qualities:

```deci live
constructionIndex = 1.6 m^2 of usefularea / m^2 of land
terrain = 600 m^2 of land

buildingArea = constructionIndex * terrain
==> 960 m² of usefularea
```
