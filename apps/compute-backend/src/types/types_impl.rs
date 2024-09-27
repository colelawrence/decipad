use js_sys::Math::round;
use num_bigint::BigInt;
use std::ops::{Add, Div, Mul, Sub};

/* ----Implements easy to use zero (mostly good for summing and similar)----  */
use num::{
    abs,
    integer::{gcd, lcm},
    FromPrimitive, ToPrimitive,
};

use conv::ApproxInto;

use super::types::{DateSpecificity, DeciResult};

///
/// This file contains the implementation functions for Rust primitives
/// that represent DeciValues in Rustland.
///

// --Constructors--
/*
fn biggcd(a: &BigInt, b: &BigInt) -> BigInt {

}
fn biglcm(a: &BigInt, b: &BigInt) -> BigInt {
  (a * b) / gcd(a, b)
}
*/
impl DeciResult {
    pub fn new_frac(n: i64, d: i64) -> DeciResult {
        let g = gcd(n, d);
        let (mut red_n, mut red_d) = (n / g, d / g);
        if 100 % red_d == 0 {
            red_n = 100 * red_n / red_d;
            red_d = 100;
        }
        DeciResult::Fraction(red_n, red_d)
    }
}

// -- Reducers--
impl DeciResult {
    pub fn mean(&self) -> DeciResult {
        match self {
            DeciResult::Column(items) => match items[0] {
                DeciResult::Column(_) => {
                    return DeciResult::Column(items.iter().map(|x| x.mean()).collect());
                }
                _ => {
                    return self.sum_frac() * DeciResult::Fraction(1, self.len() as i64);
                }
            },
            _ => panic!("Can't take mean of a non-column"),
        }
    }

    pub fn min_val(&self) -> DeciResult {
        match self {
            DeciResult::Column(items) => match items[0] {
                DeciResult::Column(_) => {
                    return DeciResult::Column(items.iter().map(|x| x.min_val()).collect());
                }
                _ => {
                    let mut minval = &items[0];
                    for item in items.iter().skip(1) {
                        if *item < *minval {
                            minval = item;
                        }
                    }
                    minval.clone()
                }
            },
            _ => panic!("Can't take min of a non-column"),
        }
    }

    pub fn max_val(&self) -> DeciResult {
        match self {
            DeciResult::Column(items) => match items[0] {
                DeciResult::Column(_) => {
                    return DeciResult::Column(items.iter().map(|x| x.max_val()).collect());
                }
                _ => {
                    let mut maxval = &items[0];
                    for item in items.iter().skip(1) {
                        if *item > *maxval {
                            maxval = item;
                        }
                    }
                    maxval.clone()
                }
            },
            _ => panic!("Can't take max of a non-column"),
        }
    }

    pub fn range(&self) -> DeciResult {
        self.max_val() - self.min_val()
    }
}

// -- Getters --
impl DeciResult {
    pub fn get_frac(&self) -> (i64, i64) {
        let frac = self.to_frac();
        match frac {
            DeciResult::Fraction(n, d) => (n, d),
            _ => panic!("Unreachable type error"),
        }
    }

    pub fn get_string(&self) -> String {
        match self {
            DeciResult::String(s) => s.to_string(),
            DeciResult::ArbitraryFraction(n, d) => format!("{}/{}", *n, *d),
            DeciResult::Fraction(n, d) => format!("{}/{}", *n, *d),
            DeciResult::Boolean(b) => b.to_string(),
            DeciResult::Column(items) => format!(
                "[{}]",
                items
                    .iter()
                    .map(|x| x.get_string())
                    .collect::<Vec<String>>()
                    .join(", ")
            ),
            DeciResult::Date(date, specificity) => match specificity {
                DateSpecificity::None => date.unwrap().format("%Y-%m-%d %H:%M:%S.%f").to_string(),
                DateSpecificity::Year => date.unwrap().format("%Y").to_string(),
                DateSpecificity::Quarter => date.unwrap().format("%Y-%m").to_string(),
                DateSpecificity::Month => date.unwrap().format("%Y-%m-%d").to_string(),
                DateSpecificity::Day => date.unwrap().format("%Y-%m-%d").to_string(),
                DateSpecificity::Hour => date.unwrap().format("%Y-%m-%d %H").to_string(),
                DateSpecificity::Minute => date.unwrap().format("%Y-%m-%d %H:%M").to_string(),
                DateSpecificity::Second => date.unwrap().format("%Y-%m-%d %H:%M:%S").to_string(),
                DateSpecificity::Millisecond => {
                    date.unwrap().format("%Y-%m-%d %H:%M:%S.%f").to_string()
                }
            },
            DeciResult::Table(table) => format!("{:?}", table),
            DeciResult::Tree(tree) => format!("{:?}", tree),
            DeciResult::Range(range) => format!("{:?}", range),
            DeciResult::Row(row) => format!("{:?}", row),
            DeciResult::TypeError => format!("{:?}", self),
            DeciResult::Pending => format!("{:?}", self),
        }
    }

    pub fn reduce(&mut self) {
        match self {
            DeciResult::Fraction(n, d) => {
                let gcd = gcd(n.abs() as u64, *d as u64);
                let mut neg = 1;
                if *n < 0 {
                    neg = -1;
                }
                *n = neg * *n / gcd as i64;
                *d = *d / gcd as i64;
            }
            DeciResult::ArbitraryFraction(n, d) => {
                let gcd = gcd(abs(n.clone()), d.clone());
                let mut neg = BigInt::from(1);
                if n.clone() < BigInt::ZERO {
                    neg = -neg;
                }
                *n = neg * n.clone() / &gcd;
                *d = d.clone() / gcd;
            }
            DeciResult::Column(items) => {
                for item in items.iter_mut() {
                    item.reduce();
                }
            }
            _ => (),
        }
    }

    pub fn to_frac(&self) -> DeciResult {
        match self {
            DeciResult::Fraction(n, d) => DeciResult::Fraction(*n, *d),
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.to_frac()).collect())
            }
            _ => panic!("Cannot convert type to frac"),
        }
    }

    pub fn to_arb(&self) -> DeciResult {
        match self {
            DeciResult::Fraction(n, d) => DeciResult::ArbitraryFraction(
                BigInt::from_i64(*n).unwrap(),
                BigInt::from_i64(*d).unwrap(),
            ),
            DeciResult::ArbitraryFraction(_n, _d) => self.clone(),
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.to_arb()).collect())
            }
            _ => panic!("Cannot convert type to arbitrary"),
        }
    }

    pub fn negate(&self) -> DeciResult {
        match self {
            DeciResult::ArbitraryFraction(n, d) => {
                DeciResult::ArbitraryFraction(-n.clone(), d.clone())
            }
            DeciResult::Fraction(n, d) => DeciResult::Fraction(-*n, *d),
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.negate()).collect())
            }
            DeciResult::String(s) => DeciResult::String(s.chars().rev().collect::<String>()),
            DeciResult::Boolean(b) => DeciResult::Boolean(!b),
            _ => panic!("Cannot negate this type"),
        }
    }

    pub fn reciprocal(&self) -> DeciResult {
        match self {
            DeciResult::Fraction(n, d) => DeciResult::Fraction(*d, *n),
            DeciResult::ArbitraryFraction(n, d) => {
                DeciResult::ArbitraryFraction(d.clone(), n.clone())
            }
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.reciprocal()).collect())
            }
            _ => panic!("Cannot take reciprocal of this item"),
        }
    }
}

impl Add for DeciResult {
    type Output = DeciResult;
    fn add(self, other: DeciResult) -> DeciResult {
        &self + &other
    }
}

impl<'a, 'b> Add<&'b DeciResult> for &'a DeciResult {
    type Output = DeciResult;

    fn add(self, other: &'b DeciResult) -> DeciResult {
        match (self, other) {
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => {
                if d1 == d2 {
                    let n = n1.checked_add(*n2);
                    match n {
                        Some(num) => {
                            return DeciResult::Fraction(num, *d1);
                        }
                        None => {
                            return &DeciResult::ArbitraryFraction(
                                BigInt::from_i64(*n1).unwrap(),
                                BigInt::from_i64(*d1).unwrap(),
                            ) + &DeciResult::ArbitraryFraction(
                                BigInt::from_i64(*n2).unwrap(),
                                BigInt::from_i64(*d2).unwrap(),
                            );
                        }
                    }
                }

                let mylcm = lcm(*d1, *d2);
                let n_left = n1.checked_mul(mylcm / d1);
                let n_right = n2.checked_mul(mylcm / d2);
                let n;

                match (n_left, n_right) {
                    (Some(l), Some(r)) => {
                        n = (l).checked_add(r);
                    }
                    _ => {
                        let g1 = gcd(*n1, *d1);
                        let g2 = gcd(*n2, *d2);
                        if g1 > 1 || g2 > 1 {
                            return &DeciResult::Fraction(n1 / g1, d1 / g1)
                                + &DeciResult::Fraction(n2 / g2, d2 / g2);
                        } else {
                            return &self.to_arb() + &other.to_arb();
                        }
                    }
                }
                let den = mylcm;
                match n {
                    Some(a) => {
                        let mygcd = gcd(a, den);
                        return DeciResult::Fraction(a / mygcd, den / mygcd);
                    }
                    None => {
                        let g1 = gcd(*n1, *d1);
                        let g2 = gcd(*n2, *d2);
                        if g1 > 1 || g2 > 1 {
                            return &DeciResult::Fraction(n1 / g1, d1 / g1)
                                + &DeciResult::Fraction(n2 / g2, d2 / g2);
                        } else {
                            return &self.to_arb() + &other.to_arb();
                        }
                    }
                }
            }
            (DeciResult::Fraction(_n1, _d1), DeciResult::ArbitraryFraction(_n2, _d2)) => {
                &self.to_arb() + other
            }
            (DeciResult::Fraction(_n, _d), DeciResult::Column(items)) => {
                DeciResult::Column(items.iter().map(|x| x + self).collect())
            }
            (DeciResult::ArbitraryFraction(_n1, _d1), DeciResult::Fraction(_n2, _d2)) => {
                self + &other.to_arb()
            }
            (DeciResult::ArbitraryFraction(n1, d1), DeciResult::ArbitraryFraction(n2, d2)) => {
                if *d1 == *d2 {
                    let n = n1 + n2;
                    return DeciResult::ArbitraryFraction(n, d1.clone());
                }

                let denlcm = lcm(d1.clone(), d2.clone());
                let num = (&denlcm * n1 / d1) + (&denlcm * n2 / d2);

                return DeciResult::ArbitraryFraction(num, denlcm);
            }
            (DeciResult::ArbitraryFraction(_n, _d), DeciResult::Column(items)) => {
                DeciResult::Column(items.iter().map(|x| x + self).collect())
            }
            (DeciResult::Column(items), DeciResult::Fraction(_n, _d)) => {
                DeciResult::Column(items.iter().map(|x| x + other).collect())
            }
            (DeciResult::Column(items), DeciResult::ArbitraryFraction(_n, _d)) => {
                DeciResult::Column(items.iter().map(|x| x + other).collect())
            }
            (DeciResult::Column(items1), DeciResult::Column(items2)) => DeciResult::Column(
                items1
                    .iter()
                    .zip(items2.iter())
                    .map(|(a, b)| a + b)
                    .collect(),
            ),
            _ => panic!("Cannot add these types"),
        }
    }
}

impl Sub for DeciResult {
    type Output = DeciResult;

    fn sub(self, other: DeciResult) -> DeciResult {
        &self + &other.negate()
    }
}

impl Mul for DeciResult {
    type Output = DeciResult;
    fn mul(self, other: DeciResult) -> DeciResult {
        &self * &other
    }
}

impl<'a, 'b> Mul<&'b DeciResult> for &'a DeciResult {
    type Output = DeciResult;

    fn mul(self, other: &DeciResult) -> DeciResult {
        match (self, other) {
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => {
                let newnum = n1.checked_mul(*n2);
                let newden = d1.checked_mul(*d2);
                match (newnum, newden) {
                    (Some(n), Some(d)) => DeciResult::Fraction(n, d),
                    _ => {
                        return &self.to_arb() * &other.to_arb();
                    }
                }
            }
            (DeciResult::Fraction(_n1, _d1), DeciResult::ArbitraryFraction(_n2, _d2)) => {
                &self.to_arb() * other
            }
            (DeciResult::Fraction(_n, _d), DeciResult::Column(items)) => {
                DeciResult::Column(items.iter().map(|x| x * self).collect())
            }
            (DeciResult::ArbitraryFraction(_n1, _d1), DeciResult::Fraction(_n2, _d2)) => {
                self * &other.to_arb()
            }
            (DeciResult::ArbitraryFraction(n1, d1), DeciResult::ArbitraryFraction(n2, d2)) => {
                DeciResult::ArbitraryFraction(n1 * n2, d1 * d2)
            }
            (DeciResult::Column(items), DeciResult::Fraction(_n, _d)) => {
                DeciResult::Column(items.iter().map(|x| x * other).collect())
            }
            (DeciResult::Column(items), DeciResult::ArbitraryFraction(_n, _d)) => {
                DeciResult::Column(items.iter().map(|x| x * other).collect())
            }
            (DeciResult::Column(items1), DeciResult::Column(items2)) => DeciResult::Column(
                items1
                    .iter()
                    .zip(items2.iter())
                    .map(|(a, b)| a * b)
                    .collect(),
            ),
            _ => panic!("Cannot multiply these types"),
        }
    }
}

impl Div for DeciResult {
    type Output = DeciResult;

    fn div(self, other: DeciResult) -> DeciResult {
        &self * &other.reciprocal()
    }
}
