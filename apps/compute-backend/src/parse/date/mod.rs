use std::{borrow::Cow, convert::TryFrom as _};

use chrono::{format::Parsed, Month, NaiveDate, NaiveDateTime};

mod month;

use crate::types::types::DateSpecificity;
use thiserror::Error;
#[derive(Error, Debug)]
pub enum DateParseError<'a> {
    #[error("invalid date string for the specificity {0:?} - {1:?}")]
    InvalidInput(DateSpecificity, Option<&'a str>),

    #[error("could not parse month - {0}")]
    InvalidMonth(#[from] chrono::ParseMonthError),
    #[error("date out of range - {0}")]
    OutOfRange(#[from] chrono::OutOfRange),

    #[error(transparent)]
    Chrono(#[from] chrono::ParseError),
}

fn normalize(str: &str) -> impl Iterator<Item = &str> {
    str.split(['-', '/', ' ', 'T'])
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
}

fn combine<'a>(a: &'a [&'a str], b: &'a [&'a str]) -> impl Iterator<Item = String> + 'a {
    a.iter().flat_map(move |a| {
        b.iter()
            .flat_map(move |b| [format!("{a}-{b}"), format!("{b}-{a}")])
    })
}

use lazy_static::lazy_static;
lazy_static! {
    static ref BAKED_MINUTE_FMTS: Vec<Cow<'static, str>> = {
        combine(&DateSpecificity::DAY_FMTS, &DateSpecificity::MINUTE_FMTS)
            .map(|s| s.into())
            .collect()
        //DateSpecificity::DAY_FMTS
        //    .iter()
        //    .flat_map(|fmt| {
        //        DateSpecificity::MINUTE_FMTS
        //            .iter()
        //            .flat_map(move |minute| [format!("{fmt}-{minute}"), format!("{minute}-{fmt}")])
        //    })
        //    .map(|s| s.into())
        //    .collect()
    };
    static ref BAKED_SECOND_FMTS: Vec<Cow<'static, str>> = {
        combine(&DateSpecificity::DAY_FMTS,&                DateSpecificity::SECOND_FMTS)

            .map(|s| s.into())
            .collect()
    };
    static ref BAKED_MILLI_FMTS: Vec<Cow<'static, str>> = {
combine(&DateSpecificity::DAY_FMTS,&                DateSpecificity::MILLI_FMTS)

            .map(|s| s.into())
            .collect()

    };
}

#[derive(Copy, Clone)]
pub enum DateMemo<'a> {
    Simple(usize),
    Complex(&'a Cow<'a, str>),
}
impl<'a> DateMemo<'a> {
    pub fn simple<const N: usize>(self, fmts: [&'static str; N]) -> Option<&'static str> {
        match self {
            DateMemo::Simple(idx) => fmts.get(idx).copied(),
            DateMemo::Complex(_) => None,
        }
    }
    pub fn complex(self) -> Option<&'a Cow<'a, str>> {
        match self {
            DateMemo::Simple(_) => None,
            DateMemo::Complex(str) => Some(str),
        }
    }
}
impl<'a> Into<DateMemo<'a>> for usize {
    fn into(self) -> DateMemo<'a> {
        DateMemo::Simple(self)
    }
}
impl<'a> Into<DateMemo<'a>> for &'a Cow<'a, str> {
    fn into(self) -> DateMemo<'a> {
        DateMemo::Complex(self)
    }
}

impl DateSpecificity {
    // this is awful, we need notebook/csv level localization so we don't need to make assumptions
    // in ambiguous situations (01/04/1999 vs 04/01/1999)
    const DAY_FMTS: [&'static str; 12] = [
        "%Y-%m-%d", "%Y-%m-%e", "%Y-%B-%d", "%Y-%B-%e", // y/m/d
        "%m-%d-%Y", "%m-%e-%Y", "%B-%d-%Y", "%B-%e-%Y", // m/d/y
        "%d-%m-%Y", "%e-%m-%Y", "%d-%B-%Y", "%e-%B-%Y", // d/m/y
    ];
    const MINUTE_FMTS: [&'static str; 8] = [
        "%H:%M", "%k:%m", "%H%M", "%k%m", // 24 hr
        "%I:%M-%P", "%l:%m-%P", "%I%M-%P", "%l%m-%P", // 12 hr
    ];
    const SECOND_FMTS: [&'static str; 8] = [
        "%H:%M:%S",
        "%k:%m:%S",
        "%H%M%S",
        "%k%m%S", // 24 hr
        "%I:%M:%S-%P",
        "%l:%m:%S-%P",
        "%I%M%S-%P",
        "%l%m%S-%P", // 12 hr
    ];
    const MILLI_FMTS: [&'static str; 8] = [
        "%H:%M:%S%.f",
        "%k:%m:%S%.f",
        "%H%M%S%.f",
        "%k%m%S%.f", // 24 hr
        "%I:%M:%S%.f-%P",
        "%l:%m:%S%.f-%P",
        "%I%M%S%.f-%P",
        "%l%m%S%.f-%P", // 12 hr
    ];
    pub fn parse_str<'a, S: AsRef<str>>(
        &'a self,
        str: S,
        memo: Option<DateMemo<'a>>,
    ) -> Result<(NaiveDateTime, Option<DateMemo<'a>>), DateParseError> {
        let str = str.as_ref().trim();
        match self {
            DateSpecificity::Month => self.parse_month(str).map(|d| (d, None)),
            DateSpecificity::Day => {
                let str = normalize(str).collect::<Vec<_>>().join("-");
                dbg!(&str);
                if let Some(fmt) = memo.and_then(|fmt| fmt.simple(Self::DAY_FMTS)) {
                    if let Ok(date) = NaiveDate::parse_from_str(&str, &fmt) {
                        return Ok((date.into(), memo));
                    }
                }
                Self::DAY_FMTS
                    .iter()
                    .enumerate()
                    .find_map(|(i, fmt)| {
                        NaiveDate::parse_from_str(&str, fmt)
                            .ok()
                            .map(|d| (d.into(), Some(DateMemo::Simple(i))))
                    })
                    .ok_or_else(|| DateParseError::InvalidInput(*self, None))
            }
            DateSpecificity::Hour => {
                let time = str
                    .split("T")
                    .map(normalize)
                    .map(|it| it.collect::<Vec<_>>())
                    .collect::<Vec<_>>();
                if time.len() > 2 {
                    return Err(DateParseError::InvalidInput(
                        *self,
                        Some("ambiguous time! (too many 'T's)"),
                    ));
                } else if time.len() < 2 {
                    return Err(DateParseError::InvalidInput(
                        *self,
                        Some("could not find hour! (must be preceeded by 'T')"),
                    ));
                }

                dbg!(&time);
                let mut date_attempts = Vec::with_capacity(4);

                for (i, time) in time.iter().enumerate() {
                    let time = match i {
                        1 => &time[1..],
                        _ => &time,
                    };
                    if time.len() >= 3 {
                        date_attempts.push(time[..3].join("-"));
                        date_attempts.push(time[time.len() - 3..].join("-"));
                    }
                }
                dbg!(&date_attempts);

                let is_pm = time[1].iter().find(|s| s.to_lowercase() == "pm").is_some();

                let hour = time[1]
                    .first()
                    .map(|hour| {
                        u32::from_str_radix(hour, 10)
                            .map(|hour| match is_pm {
                                true => hour + 12,
                                false => hour,
                            })
                            .map_err(|_| {
                                DateParseError::InvalidInput(
                                    *self,
                                    Some("invalid hour following 'T'"),
                                )
                            })
                    })
                    .ok_or_else(|| {
                        DateParseError::InvalidInput(*self, Some("could not find hour"))
                    })?;

                dbg!(&hour);

                let fmts = memo.and_then(|memo| memo.simple(Self::DAY_FMTS).map(|f| [f]));
                let fmts = match &fmts {
                    Some(f) => f.as_slice(),
                    None => Self::DAY_FMTS.as_slice(),
                };

                let (ts, new_memo) = fmts
                    .iter()
                    .enumerate()
                    .find_map(|(i, fmt)| {
                        dbg!(&fmt);
                        for j in 0..=1 {
                            let src = &date_attempts[j];
                            dbg!(src);
                            if let Ok(res) = NaiveDate::parse_from_str(src, &fmt) {
                                return Some((res, Some(DateMemo::Simple(i))));
                            }
                        }
                        None
                    })
                    .ok_or_else(|| DateParseError::InvalidInput(*self, None))?;

                let ts = ts
                    .and_hms_opt(hour?, 0, 0)
                    .ok_or_else(|| DateParseError::InvalidInput(*self, Some("invalid hour!")))?;
                Ok((ts, memo.or(new_memo)))
            }
            DateSpecificity::Minute => {
                let str = normalize(str).collect::<Vec<_>>().join("-");
                dbg!(&str);

                BAKED_MINUTE_FMTS
                    .iter()
                    .enumerate()
                    .find_map(|(i, fmt)| {
                        NaiveDateTime::parse_from_str(&str, &fmt)
                            .ok()
                            .map(|ts| (ts, Some(DateMemo::Simple(i))))
                    })
                    .ok_or_else(|| DateParseError::InvalidInput(*self, None))
                    .map(|(ts, new_memo)| (ts, memo.or(new_memo)))
            }
            DateSpecificity::Second => {
                let str = normalize(str).collect::<Vec<_>>().join("-");
                dbg!(&str);

                // FIXME: this needs urgent lazy_static'ing
                BAKED_SECOND_FMTS
                    .iter()
                    .enumerate()
                    .find_map(|(i, fmt)| {
                        NaiveDateTime::parse_from_str(&str, &fmt)
                            .ok()
                            .map(|ts| (ts, Some(DateMemo::Simple(i))))
                    })
                    .ok_or_else(|| DateParseError::InvalidInput(*self, None))
                    .map(|(ts, new_memo)| (ts, memo.or(new_memo)))
            }
            DateSpecificity::Millisecond => {
                let str = normalize(str).collect::<Vec<_>>().join("-");
                dbg!(&str);

                // FIXME: this needs urgent lazy_static'ing
                BAKED_MILLI_FMTS
                    .iter()
                    .enumerate()
                    .find_map(|(i, fmt)| {
                        NaiveDateTime::parse_from_str(&str, &fmt)
                            .ok()
                            .map(|ts| (ts, Some(DateMemo::Simple(i))))
                    })
                    .ok_or_else(|| DateParseError::InvalidInput(*self, None))
                    .map(|(ts, new_memo)| (ts, memo.or(new_memo)))
            }
            _ => Err(DateParseError::InvalidInput(*self, Some("unsupported"))),
        }
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;

    use super::*;
    #[test]
    fn test_month_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01).unwrap()];
            let fmts = ["%m-%Y", "%B %Y", "%B/%Y", "%b-%Y", "%Y    %m"];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(DateSpecificity::Month.parse_str(&str, None)?.0, date.into());
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("{act}");
        }
        res.unwrap();
    }
    #[test]
    fn test_day_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01).unwrap()];
            let fmts = [
                "%m-%d-%Y",
                "%B %d %Y",
                "%d %B/%Y",
                "%b-%d/%Y",
                "  %Y  %m    %d",
            ];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(DateSpecificity::Day.parse_str(&str, None)?.0, date.into());
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("\n{act}\n");
        }
        res.unwrap();
    }
    #[test]
    fn test_hour_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01)
                .unwrap()
                .and_hms_opt(15, 00, 00)
                .unwrap()];
            let fmts = [
                "%m-%d-%YT%H",
                "%B %d %Y T %I %P",
                "T%H %d %B/%Y",
                "T%k %b-%d/%Y",
                "T%I %p       %Y %m   %d",
            ];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(DateSpecificity::Hour.parse_str(&str, None)?.0, date.into());
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("\n{act}\n");
        }
        res.unwrap();
    }
    #[test]
    fn test_minute_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01)
                .unwrap()
                .and_hms_opt(15, 30, 00)
                .unwrap()];
            let fmts = [
                "%m-%d-%Y %H:%M",
                "%B %d %Y %I:%M %P",
                "%H%M %d %B/%Y",
                "%k:%M %b-%d/%Y",
                "%I%M %p %Y    %m    %d",
            ];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(
                        DateSpecificity::Minute.parse_str(&str, None)?.0,
                        date.into()
                    );
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("\n{act}\n");
        }
        res.unwrap();
    }
    #[test]
    fn test_second_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01)
                .unwrap()
                .and_hms_milli_opt(15, 30, 59, 0)
                .unwrap()];
            let fmts = [
                "%m-%d-%Y %H:%M:%S",
                "%B %d %Y %I:%M:%S %P",
                "%H%M%S  %B %d/%Y",
                "%k:%M:%S %b-%d/%Y",
                "%I%M%S %p %Y    %m    %d",
            ];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(
                        DateSpecificity::Second.parse_str(&str, None)?.0,
                        date.into()
                    );
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("\n{act}\n");
        }
        res.unwrap();
    }
    #[test]
    fn test_millisecond_specific_parsing() {
        let act = || {
            let dates = [NaiveDate::from_ymd_opt(2001, 07, 01)
                .unwrap()
                .and_hms_milli_opt(15, 30, 59, 500)
                .unwrap()];
            let fmts = [
                "%m-%d-%Y %H:%M:%S%.f",
                "%B %d %Y %I:%M:%S%.f %P",
                "%H%M%S%.f %d %B/%Y",
                "%k:%M:%S%.f %b-%d/%Y",
                "%I%M%S%.f %p %Y    %m    %d",
            ];
            for date in dates {
                for fmt in fmts {
                    let str = date.format(fmt).to_string();
                    dbg!(&str);
                    assert_eq!(
                        DateSpecificity::Millisecond.parse_str(&str, None)?.0,
                        date.into()
                    );
                }
            }
            Ok::<_, DateParseError>(())
        };
        let res = act();
        if let Err(ref act) = res {
            eprintln!("\n{act}\n");
        }
        res.unwrap();
    }
}
