---
sidebar_position: 40
---

# Unit quality

Besides a quantity, units can also have a quality.

For instance, `1 kilogram of flour` and `30 grams of sugar` are both represented by units of mass with different qualities `flour` and `sugar`.

You can define **Qualities** with the keyword `of`.

An example will make things easier to grasp:

```deci live
flour = 2 kg of flour
butter = 150 g of butter

ratio = butter / flour
==> 75 g of butter/kg of flour
```

With qualities, you are able to express data relations in a more realistic way. On our example you can clearly see that for every `kg of flour`you will have `75 g of butter`. Awesome right?

Here's another example:

```deci live
constructionIndex = 1.6 m^2 of usefularea / m^2 of land
terrain = 600 m^2 of land

buildingArea = constructionIndex * terrain
==> 960 m² of usefularea
```
