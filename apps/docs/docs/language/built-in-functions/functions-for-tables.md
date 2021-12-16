---
sidebar_position: 50
---

# Functions for tables

Deci has a bunch of built-in functions that operate on tables. They are:

## splitby

This function splits the table into several different tables, splitted by the unique values of a column:

```deci live
flights = {
  company = ["EZJ", "TAP", "BA", "TAP", "BA", "EZJ", "TAP"]
  flight_number = ["EZJ123", "TP456", "BA789", "TP098", "BA765", "EZJ432", "TP210"]
}

splitby(flights, flights.company)
==> {
  company = [ 'BA' <string> x unknown, 'EZJ' <string> x unknown, 'TAP' <string> x unknown ],
  values = [ {
  flight_number = [ 'BA789', 'BA765' ]
}, {
  flight_number = [ 'EZJ123', 'EZJ432' ]
}, {
  flight_number = [ 'TP456', 'TP098', 'TP210' ]
} ]
}
```

## sortby

This function sorts a table by the values of a column:

```deci live
flights = {
  flight_number = ["EZJ123", "TP456", "BA789", "TP098", "BA765"]
  departure_time = [date(2022-03-11 15:20), date(2022-03-11 16:20), date(2022-03-10 10:05), date(2022-03-13 12:20), date(2022-03-11 15:20)]
}

sortby(flights, flights.departure_time)
==> {
  flight_number = [ 'BA789', 'EZJ123', 'BA765', 'TP456', 'TP098' ],
  departure_time = [ time 2022-03-10 10:05, time 2022-03-11 15:20, time 2022-03-11 15:20, time 2022-03-11 16:20, time 2022-03-13 12:20 ]
}
```

## reverse

This function reverses a table:

```deci live
flights = {
  company = ["EZJ", "TAP", "BA", "TAP", "BA", "EZJ", "TAP"]
  flight_number = ["EZJ123", "TP456", "BA789", "TP098", "BA765", "EZJ432", "TP210"]
}

reverse(flights)
==> {
  company = [ 'TAP', 'EZJ', 'BA', 'TAP', 'BA', 'TAP', 'EZJ' ],
  flight_number = [ 'TP210', 'EZJ432', 'BA765', 'TP098', 'BA789', 'TP456', 'EZJ123' ]
}
```
