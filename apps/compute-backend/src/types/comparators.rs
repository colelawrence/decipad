use super::types::{DeciCommon, DeciFloat, DeciFrac, DeciValue, NCol};
use conv::ApproxInto;
use std::cmp::{PartialEq, PartialOrd};

impl PartialEq for DeciFloat {
    fn eq(&self, other: &DeciFloat) -> bool {
        self.val == other.val && self.inf == other.inf && self.und == other.und
    }
}

impl Eq for DeciFloat {}

impl PartialEq for DeciFrac {
    fn eq(&self, other: &DeciFrac) -> bool {
        self.n as f64 * other.d as f64 / self.d as f64 == other.n as f64
            && self.inf == other.inf
            && self.und == other.und
    }
}

impl Eq for DeciFrac {}

impl PartialEq<DeciFrac> for DeciFloat {
    fn eq(&self, other: &DeciFrac) -> bool {
        *self == other.to_float()
    }
}

impl PartialEq<DeciFloat> for DeciFrac {
    fn eq(&self, other: &DeciFloat) -> bool {
        self.to_float() == *other
    }
}

impl<T> PartialEq<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    fn eq(&self, other: &T) -> bool {
        self.val == other.clone().approx_into().unwrap()
    }
}

impl<T> PartialEq<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    fn eq(&self, other: &T) -> bool {
        self.n as f64 / self.d as f64 == other.clone().approx_into().unwrap()
    }
}

impl PartialOrd for DeciFloat {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match self.val.partial_cmp(&other.val) {
            Some(core::cmp::Ordering::Equal) => {}
            ord => return ord,
        }
        match self.inf.partial_cmp(&other.inf) {
            Some(core::cmp::Ordering::Equal) => {}
            ord => return ord,
        }
        self.und.partial_cmp(&other.und)
    }

    fn lt(&self, other: &DeciFloat) -> bool {
        return self.val < other.val;
    }

    fn le(&self, other: &DeciFloat) -> bool {
        return self.val <= other.val;
    }
    fn gt(&self, other: &DeciFloat) -> bool {
        return self.val > other.val;
    }
    fn ge(&self, other: &DeciFloat) -> bool {
        return self.val >= other.val;
    }
}

impl PartialOrd for DeciFrac {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match self.n.partial_cmp(&other.n) {
            Some(core::cmp::Ordering::Equal) => {}
            ord => return ord,
        }
        match self.d.partial_cmp(&other.d) {
            Some(core::cmp::Ordering::Equal) => {}
            ord => return ord,
        }
        match self.inf.partial_cmp(&other.inf) {
            Some(core::cmp::Ordering::Equal) => {}
            ord => return ord,
        }
        self.und.partial_cmp(&other.und)
    }

    fn lt(&self, other: &DeciFrac) -> bool {
        (self.n as f64 / self.d as f64) < (other.n as f64 / other.d as f64)
    }

    fn le(&self, other: &DeciFrac) -> bool {
        *self < *other || *self == *other
    }
    fn gt(&self, other: &DeciFrac) -> bool {
        self.n as f64 / self.d as f64 > other.n as f64 / other.d as f64
    }
    fn ge(&self, other: &DeciFrac) -> bool {
        *self > *other || *self == *other
    }
}

impl PartialOrd<DeciFrac> for DeciFloat {
    fn partial_cmp(&self, _other: &DeciFrac) -> Option<std::cmp::Ordering> {
        return None;
    }

    fn lt(&self, other: &DeciFrac) -> bool {
        *self < other.to_float()
    }

    fn le(&self, other: &DeciFrac) -> bool {
        *self <= other.to_float()
    }

    fn gt(&self, other: &DeciFrac) -> bool {
        *self > other.to_float()
    }

    fn ge(&self, other: &DeciFrac) -> bool {
        *self >= other.to_float()
    }
}

impl PartialOrd<DeciFloat> for DeciFrac {
    fn partial_cmp(&self, _other: &DeciFloat) -> Option<std::cmp::Ordering> {
        return None;
    }

    fn lt(&self, other: &DeciFloat) -> bool {
        self.to_float() < *other
    }

    fn le(&self, other: &DeciFloat) -> bool {
        self.to_float() <= *other
    }

    fn gt(&self, other: &DeciFloat) -> bool {
        self.to_float() > *other
    }

    fn ge(&self, other: &DeciFloat) -> bool {
        self.to_float() >= *other
    }
}

impl<T> PartialOrd<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    fn partial_cmp(&self, _other: &T) -> Option<std::cmp::Ordering> {
        return None;
    }

    fn lt(&self, other: &T) -> bool {
        self.to_float().val < other.clone().approx_into().unwrap()
    }

    fn le(&self, other: &T) -> bool {
        self.to_float().val <= other.clone().approx_into().unwrap()
    }

    fn gt(&self, other: &T) -> bool {
        self.to_float().val > other.clone().approx_into().unwrap()
    }

    fn ge(&self, other: &T) -> bool {
        self.to_float().val >= other.clone().approx_into().unwrap()
    }
}

impl<T> PartialOrd<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    fn partial_cmp(&self, _other: &T) -> Option<std::cmp::Ordering> {
        return None;
    }

    fn lt(&self, other: &T) -> bool {
        self.val < other.clone().approx_into().unwrap()
    }

    fn le(&self, other: &T) -> bool {
        self.val <= other.clone().approx_into().unwrap()
    }

    fn gt(&self, other: &T) -> bool {
        self.val > other.clone().approx_into().unwrap()
    }

    fn ge(&self, other: &T) -> bool {
        self.val >= other.clone().approx_into().unwrap()
    }
}

impl PartialEq for NCol {
    fn eq(&self, other: &NCol) -> bool {
        match (self, other) {
            (NCol::FloatCol(a), NCol::FloatCol(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| *a == *b).all(|x| x)
            }
            (NCol::FracCol(a), NCol::FracCol(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| *a == *b).all(|x| x)
            }
            (NCol::FloatCol(a), NCol::FracCol(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| *a == *b).all(|x| x)
            }
            (NCol::FracCol(a), NCol::FloatCol(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| *a == *b).all(|x| x)
            }
        }
    }
}

impl PartialEq for DeciValue {
    fn eq(&self, other: &DeciValue) -> bool {
        match (self, other) {
            (DeciValue::NumberColumn(a), DeciValue::NumberColumn(b)) => a == b,
            (DeciValue::NumberColumn(a), DeciValue::BooleanColumn(b)) => {
                *a == NCol::from_float(b.iter().map(|x| if *x { 1.0 } else { 0.0 }).collect())
            }
            (DeciValue::BooleanColumn(a), DeciValue::NumberColumn(b)) => {
                *b == NCol::from_float(a.iter().map(|x| if *x { 1.0 } else { 0.0 }).collect())
            }
            (DeciValue::BooleanColumn(a), DeciValue::BooleanColumn(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| *a == *b).all(|x| x)
            }
            (DeciValue::StringColumn(a), DeciValue::StringColumn(b)) => {
                a.iter().zip(b.iter()).map(|(a, b)| a == b).all(|x| x)
            }
            _ => false,
        }
    }
}
