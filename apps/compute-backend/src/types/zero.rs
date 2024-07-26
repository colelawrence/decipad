use super::types::DeciResult;
use num::Zero;

impl Zero for DeciResult {
    fn zero() -> DeciResult {
        DeciResult::Fraction(0, 1)
    }

    fn is_zero(&self) -> bool {
        match self {
            DeciResult::Boolean(a) => !*a,
            DeciResult::String(_) => false,
            DeciResult::Fraction(n, d) => *n == 0 && *d != 0,
            DeciResult::Float(a) => *a == 0.0,
            DeciResult::Column(_) => false,
        }
    }
}
