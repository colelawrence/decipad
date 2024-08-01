use conv::ApproxInto;

use super::types::DeciResult;

use std::cmp::{PartialEq, PartialOrd};

impl PartialEq for DeciResult {
    fn eq(&self, other: &DeciResult) -> bool {
        match (self, other) {
            (DeciResult::Float(a), DeciResult::Float(b)) => *a == *b,
            (DeciResult::Float(a), DeciResult::Fraction(n, d)) => {
                DeciResult::Float(*a) == DeciResult::Fraction(*n, *d).to_float()
            }
            (DeciResult::Fraction(n, d), DeciResult::Float(a)) => {
                DeciResult::Float(*a) == DeciResult::Fraction(*n, *d).to_float()
            }
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => *n1 * *d2 == *n2 * *d1,
            (DeciResult::Boolean(b1), DeciResult::Boolean(b2)) => *b1 == *b2,
            (DeciResult::String(s1), DeciResult::String(s2)) => *s1 == *s2,
            (DeciResult::Column(items1), DeciResult::Column(items2)) => items1
                .iter()
                .zip(items2.iter())
                .map(|(a, b)| *a == *b)
                .all(|x| x),
            (DeciResult::Pending, DeciResult::Pending) => true, // Add this line
            (DeciResult::TypeError, DeciResult::TypeError) => true,
            (DeciResult::Date(d1, s1), DeciResult::Date(d2, s2)) => d1 == d2 && s1 == s2,
            (DeciResult::Table(t1), DeciResult::Table(t2)) => t1 == t2,
            (DeciResult::Range(r1), DeciResult::Range(r2)) => r1 == r2,
            (DeciResult::Row(r1), DeciResult::Row(r2)) => r1 == r2,
            _ => false,
        }
    }
}

impl Eq for DeciResult {}

impl<T> PartialEq<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    fn eq(&self, other: &T) -> bool {
        *self == DeciResult::Float(other.clone().approx_into().unwrap())
    }
}

impl PartialOrd for DeciResult {
    fn partial_cmp(&self, _other: &Self) -> Option<std::cmp::Ordering> {
        None
    }

    fn lt(&self, other: &DeciResult) -> bool {
        match (self, other) {
            (DeciResult::Float(a), DeciResult::Float(b)) => *a < *b,
            (DeciResult::Float(a), DeciResult::Fraction(n, d)) => *a < *n as f64 / *d as f64,
            (DeciResult::Fraction(n, d), DeciResult::Float(a)) => (*n as f64 / *d as f64) < *a,
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => *n1 * *d2 < *n2 * *d1,
            (DeciResult::String(s1), DeciResult::String(s2)) => s1 < s2,
            (DeciResult::Boolean(b1), DeciResult::Boolean(b2)) => !*b1 && *b2,
            _ => panic!("Can't compare these types"),
        }
    }

    fn le(&self, other: &DeciResult) -> bool {
        return *self < *other || *self == *other;
    }

    fn gt(&self, other: &DeciResult) -> bool {
        return !(*self <= *other);
    }

    fn ge(&self, other: &DeciResult) -> bool {
        return *self > *other || *self == *other;
    }
}

impl<T> PartialOrd<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    fn partial_cmp(&self, other: &T) -> Option<std::cmp::Ordering> {
        return None;
    }

    fn lt(&self, other: &T) -> bool {
        *self < DeciResult::Float(other.clone().approx_into().unwrap())
    }

    fn le(&self, other: &T) -> bool {
        *self <= DeciResult::Float(other.clone().approx_into().unwrap())
    }

    fn gt(&self, other: &T) -> bool {
        *self > DeciResult::Float(other.clone().approx_into().unwrap())
    }

    fn ge(&self, other: &T) -> bool {
        *self >= DeciResult::Float(other.clone().approx_into().unwrap())
    }
}
