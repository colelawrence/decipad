use super::types::DeciResult;
use num::Zero;
use num_bigint::BigInt;

impl Zero for DeciResult {
    fn zero() -> DeciResult {
        DeciResult::Fraction(0, 1)
    }

    fn is_zero(&self) -> bool {
        match self {
            DeciResult::Boolean(a) => !*a,
            DeciResult::String(_) => false,
            DeciResult::ArbitraryFraction(n, d) => *n == BigInt::ZERO && *d != BigInt::ZERO,
            DeciResult::Fraction(n, d) => *n == 0 && *d != 0,
            DeciResult::Column(_) => false,
            DeciResult::Date(_, _) => false,
            DeciResult::Table(_) => false,
            DeciResult::Range(_) => false,
            DeciResult::Row(_) => false,
            DeciResult::TypeError => false,
            DeciResult::Pending => false,
            DeciResult::Tree(_) => false,
        }
    }
}
