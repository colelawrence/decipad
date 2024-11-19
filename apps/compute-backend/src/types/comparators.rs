use super::types::DeciResult;

use std::cmp::{PartialEq, PartialOrd};

impl PartialEq for DeciResult {
    fn eq(&self, other: &DeciResult) -> bool {
        match (self, other) {
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => *n1 * *d2 == *n2 * *d1,
            (DeciResult::Fraction(_n1, _d1), DeciResult::ArbitraryFraction(_n2, _d2)) => {
                &self.to_arb() == other
            }
            (DeciResult::ArbitraryFraction(_n1, _d1), DeciResult::Fraction(_n2, _d2)) => {
                self == &other.to_arb()
            }
            (DeciResult::ArbitraryFraction(n1, d1), DeciResult::ArbitraryFraction(n2, d2)) => {
                n1 * d2 == n2 * d1
            }
            (DeciResult::Boolean(b1), DeciResult::Boolean(b2)) => *b1 == *b2,
            (DeciResult::String(s1), DeciResult::String(s2)) => *s1 == *s2,
            (DeciResult::Column(items1), DeciResult::Column(items2)) => items1
                .iter()
                .zip(items2.iter())
                .map(|(a, b)| *a == *b)
                .all(|x| x),
            (DeciResult::Pending, DeciResult::Pending) => true, // Add this line
            (DeciResult::TypeError, DeciResult::TypeError) => true,
            (DeciResult::Date(d1), DeciResult::Date(d2)) => d1 == d2,
            (DeciResult::Table(t1), DeciResult::Table(t2)) => t1 == t2,
            (DeciResult::Range(r1), DeciResult::Range(r2)) => r1 == r2,
            (DeciResult::Row(r1), DeciResult::Row(r2)) => r1 == r2,
            (
                DeciResult::Function {
                    name: name_a,
                    argument_names: argument_names_a,
                    body: body_a,
                },
                DeciResult::Function {
                    name: name_b,
                    argument_names: argument_names_b,
                    body: body_b,
                },
            ) => name_a == name_b && argument_names_a == argument_names_b && body_a == body_b,
            _ => false,
        }
    }
}

impl Eq for DeciResult {}

impl PartialOrd for DeciResult {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for DeciResult {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        match (self, other) {
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => {
                (*n1 * *d2).cmp(&(*n2 * *d1))
            }
            (DeciResult::Fraction(_n1, _d1), DeciResult::ArbitraryFraction(_n2, _d2)) => {
                self.to_arb().cmp(other)
            }
            (DeciResult::ArbitraryFraction(_n1, _d1), DeciResult::Fraction(_n2, _d2)) => {
                self.cmp(&other.to_arb())
            }
            (DeciResult::ArbitraryFraction(n1, d1), DeciResult::ArbitraryFraction(n2, d2)) => {
                (n1 * d2).cmp(&(n2 * d1))
            }
            (DeciResult::String(s1), DeciResult::String(s2)) => s1.cmp(s2),
            (DeciResult::Boolean(b1), DeciResult::Boolean(b2)) => b1.cmp(b2),
            (DeciResult::Date(d1), DeciResult::Date(d2)) => d1.cmp(d2),
            _ => std::cmp::Ordering::Less,
        }
    }
}
