---
sidebar_position: 180
---

# Formulas for Tables

Built-in functions that operate on tables:

## lookup()

[Here is documentation on the lookup function](/docs/formulas/lookups).

## filter()

You can select the elements from a table based on a condition:

```deci live
Flights = {
  FlightNumber = ["EZJ123", "TP456", "BA789", "TP098", "BA765", "EZJ432", "TP210"]
  PassengerCount = [100, 200, 150, 125, 210, 240, 80]
}

filter(Flights, Flights.PassengerCount <= 140)
==> {
  FlightNumber = [ 'EZJ123', 'TP098', 'TP210' ],
  PassengerCount = [ 100, 125, 80 ]
}
```

## sortby()

This formula sorts a table by the values of a column:

```deci live
Flights = {
  FlightNumber = ["EZJ123", "TP456", "BA789", "TP098", "BA765"]
  DepartureTime = [date(2022-03-11 15:20), date(2022-03-11 16:20), date(2022-03-10 10:05), date(2022-03-13 12:20), date(2022-03-11 15:20)]
}

sortby(Flights, Flights.DepartureTime)
==> {
  FlightNumber = [ 'BA789', 'EZJ123', 'BA765', 'TP456', 'TP098' ],
  DepartureTime = [ minute 2022-03-10 10:05, minute 2022-03-11 15:20, minute 2022-03-11 15:20, minute 2022-03-11 16:20, minute 2022-03-13 12:20 ]
}
```

## reverse()

This formula reverses a table:

```deci live
Flights = {
  Company = ["EZJ", "TAP", "BA", "TAP", "BA", "EZJ", "TAP"]
  FlightNumber = ["EZJ123", "TP456", "BA789", "TP098", "BA765", "EZJ432", "TP210"]
}

reverse(Flights)
==> {
  Company = [ 'TAP', 'EZJ', 'BA', 'TAP', 'BA', 'TAP', 'EZJ' ],
  FlightNumber = [ 'TP210', 'EZJ432', 'BA765', 'TP098', 'BA789', 'TP456', 'EZJ123' ]
}
```
