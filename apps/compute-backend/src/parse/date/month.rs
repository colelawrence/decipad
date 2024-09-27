use super::*;

impl DateSpecificity {
    pub(super) fn parse_month<S: AsRef<str>>(
        &self,
        str: S,
    ) -> Result<chrono::NaiveDateTime, DateParseError> {
        let str = str.as_ref();
        let parts = str
            .split(['/', '-', ' '])
            .map(|part| part.trim())
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>();
        if parts.len() != 2 {
            return Err(DateParseError::InvalidInput(
                *self,
                Some("not enough parts"),
            ));
        }
        // first we look for the year (YYYY)
        let Some((year_idx, year)) = parts
            .iter()
            .enumerate()
            .filter(|(_, s)| s.len() == 4)
            .find_map(|(i, part)| i32::from_str_radix(part, 10).ok().map(|year| (i, year)))
        else {
            return Err(DateParseError::InvalidInput(
                *self,
                Some("could not find year"),
            ));
        };
        dbg!(year, year_idx);
        // whatever is left should be the month
        let month = parts
            .get(match year_idx {
                0 => 1,
                1 => 0,
                _ => {
                    return Err(DateParseError::InvalidInput(
                        *self,
                        Some("could not find month - too ambiguous"),
                    ))
                }
            })
            .ok_or(DateParseError::InvalidInput(
                *self,
                Some("could not find month"),
            ))?;
        dbg!(month);

        let month = u8::from_str_radix(month, 10)
            // first we try parse the month as a number
            .map(|m| {
                dbg!("got month u8", m);
                Month::try_from(m).map_err(|e| e.into())
            })
            // otherwise we try parse it as a month string ("June", etc.)
            .unwrap_or_else(|_| {
                month
                    .parse::<Month>()
                    .map_err(|e| Into::<DateParseError>::into(e))
            })?;
        // then we check that the final month/year is possible
        let mut parsed = Parsed::new();
        parsed.set_day(1)?;
        parsed.set_year(year as _)?;
        parsed.set_month(month.number_from_month() as _)?;
        return Ok(parsed.to_naive_date()?.into());
    }
}
