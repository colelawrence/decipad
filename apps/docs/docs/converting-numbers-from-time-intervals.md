---
sidebar_position: 9
---

# Converting time intervals to numbers

In Deci, a time interval can be expressed like this:

```deci live
[10 days, 5 hours]
```

You can also calculate a time interval between two dates:

```deci live
date(2020-02-23) - date(2020-01-12)
```

You can then convert a time interval to, let's say, days:

```deci live
date(2020-02-23) - date(2020-01-12) in days
```

or hours:

```deci live
date(2020-02-23 17:35) - date(2020-01-12 05:23) in hours
```

or minutes:

```deci live
date(2020-02-23 17:35) - date(2020-01-12 05:23) in minutes
```

or seconds:

```deci live
date(2020-02-23 17:35:43) - date(2020-01-12 05:23:12) in seconds
```

or milliseconds:

```deci live
date(2020-02-23 17:35:43) - date(2020-01-12 05:23:12) in milliseconds
```
