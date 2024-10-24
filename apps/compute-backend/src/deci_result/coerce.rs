use crate::{
    import::Kind,
    parse::DateMemo,
    types::types::{DateSpecificity, DeciDate, DeciResult, DeciType},
};
use std::str::FromStr;

pub trait Coerce<To> {
    type Error;
    type Memo;
    fn coerce(self) -> Result<To, Self::Error>;
    fn coerce_memo(self, _memo: &'static mut Self::Memo) -> Result<To, Self::Error>
    where
        Self: Sized,
    {
        self.coerce()
    }
}

impl Coerce<String> for bool {
    type Memo = ();
    type Error = ();
    fn coerce(self) -> Result<String, Self::Error> {
        Ok(self.to_string())
    }
}

impl Coerce<f32> for String {
    type Memo = ();
    type Error = std::num::ParseFloatError;
    fn coerce(self) -> Result<f32, Self::Error> {
        number_parse_preprocess(self).parse::<f32>()
    }
}

pub fn number_parse_preprocess<S: AsRef<str>>(str: S) -> String {
    str.as_ref()
        .trim()
        .replace("r$", "")
        .replace("R$", "")
        .replace(['_', ' ', ',', '$', '£', '€'], "")
}

impl Coerce<f64> for String {
    type Memo = ();
    type Error = std::num::ParseFloatError;
    fn coerce(self) -> Result<f64, Self::Error> {
        number_parse_preprocess(self).parse::<f64>()
    }
}

impl Coerce<bool> for String {
    type Memo = ();
    type Error = std::str::ParseBoolError;
    fn coerce(mut self) -> Result<bool, Self::Error> {
        self.make_ascii_lowercase();
        Ok(self.parse::<bool>()?)
    }
}

impl Coerce<DeciDate> for String {
    type Memo = ();
    type Error = ();

    fn coerce(self) -> Result<DeciDate, Self::Error> {
        todo!("guess date specificity");
    }
}

impl<S> Coerce<DeciDate> for (S, DateSpecificity)
where
    S: AsRef<str>,
{
    type Memo = Option<DateMemo<'static>>;
    type Error = ();

    fn coerce(self) -> Result<DeciDate, Self::Error> {
        let (str, specificity) = self;
        specificity
            .parse_str(str, &mut None)
            .map(|date| DeciDate(Some(date), specificity))
            .map_err(|_| ())
    }
    fn coerce_memo(self, memo: &'_ mut Self::Memo) -> Result<DeciDate, Self::Error> {
        let (str, specificity) = self;
        specificity
            .parse_str(str, memo)
            .map(|date| DeciDate(Some(date), specificity))
            .map_err(|_err| ())
    }
}

macro_rules! coerce {
    ($kind:ident, $inner:ident, [$($variant:ident / $deci:ident),*]) => {
        match $kind {
            $(Kind::$variant => Some(DeciResult::$deci($inner.coerce().ok()?)),)*
            _ => None,
        }
    };
}

macro_rules! coerce_via_string {
    ($kind:ident, $inner:ident) => {
        match $kind {
            Kind::Number => todo!(),
            Kind::String => todo!(),
            Kind::Boolean => todo!(),
            Kind::Date => todo!(),
            Kind::Error => todo!(),
        }
    };
}

impl Into<DeciResult> for String {
    fn into(self) -> DeciResult {
        DeciResult::String(self)
    }
}

impl DeciResult {
    pub fn try_coerce(self, to: DeciType) -> Option<DeciResult> {
        if self.deci_type() == Some(to) {
            // just in case we miss self -> self cases further down
            return Some(self);
        }
        match self {
            DeciResult::Boolean(inner) => match to {
                DeciType::Boolean => Some(self),
                DeciType::String => inner.coerce().ok().map(|i| i.into()),
                _ => None,
            },
            DeciResult::String(ref s) => {
                match to {
                    DeciType::Number => fraction::Fraction::from_str(&number_parse_preprocess(s))
                        .map(|f| f.into())
                        .ok(),
                    DeciType::String => Some(self),
                    // the clone here is unavoidable, since str -> bool would need to build a
                    // String for lowercasing anyway
                    DeciType::Boolean => s.clone().coerce().ok().map(|f: bool| f.into()),
                    DeciType::Date { specificity } => (s.as_str(), specificity)
                        .coerce()
                        .ok()
                        .map(|f: DeciDate| f.into()),
                    _ => None,
                }
            }
            DeciResult::Fraction(numer, denom) => {
                let inner = fraction::GenericFraction::new_raw_signed(
                    match numer.is_negative() ^ denom.is_negative() {
                        true => fraction::Sign::Minus,
                        false => fraction::Sign::Plus,
                    },
                    numer.abs() as u64,
                    denom.abs() as u64,
                );
                Some(match to {
                    DeciType::Number => self,
                    DeciType::String => inner.to_string().into(),
                    _ => return None,
                })
            }
            DeciResult::ArbitraryFraction(_, _) => return None,
            DeciResult::Column(_) => return None,
            DeciResult::Date(_date) => return None,
            DeciResult::Range(_) => return None,
            DeciResult::Row(_) => return None,
            _ => return None,
        }
    }
}
