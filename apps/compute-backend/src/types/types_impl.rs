use std::ops::{Add, Div, Mul, Sub};

/* ----Implements easy to use zero (mostly good for summing and similar)----  */
use num::{
    integer::{gcd, lcm},
    Zero,
};

use conv::ApproxInto;

use super::types::{DateSpecificity, DeciResult};

///
/// This file contains the implementation functions for Rust primitives
/// that represent DeciValues in Rustland.
///

// --Constructors--
impl DeciResult {
    pub fn new_frac(n: i64, d: i64) -> DeciResult {
        let g = gcd(n, d);
        let (mut redN, mut redD) = (n / g, d / g);
        if 100 % redD == 0 {
            redN = 100 * redN / redD;
            redD = 100;
        }
        DeciResult::Fraction(redN, redD)
    }

    pub fn new_float(f: f64) -> DeciResult {
        if (f * 100.0).fract() == 0.0 {
            DeciResult::Fraction((f * 100.0) as i64, 100)
        } else {
            DeciResult::Float(f)
        }
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

    pub fn get_float(&self) -> f64 {
        match self.to_float() {
            DeciResult::Float(a) => a,
            _ => panic!("Unreachable type error"),
        }
    }

    pub fn get_string(&self) -> String {
        match self {
            DeciResult::String(s) => s.to_string(),
            DeciResult::Float(f) => f.to_string(),
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
                DateSpecificity::Millisecond => date.unwrap().format("%Y-%m-%d %H:%M:%S.%f").to_string(),
            },
            DeciResult::Table(table) => format!("{:?}", table),
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
            DeciResult::Float(a) => {
                if *a == 0.0 {
                    return DeciResult::Fraction(0, 1);
                }

                let mut exp = 0;
                let mut frac = *a;

                while frac.fract() != 0.0 {
                    frac *= 2.0;
                    exp += 1;
                }

                DeciResult::Fraction(frac as i64, 1 << exp)
            }
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.to_frac()).collect())
            }
            _ => panic!("Cannot convert type to frac"),
        }
    }

    pub fn to_float(&self) -> DeciResult {
        match self {
            DeciResult::Fraction(n, d) => DeciResult::Float(*n as f64 / *d as f64),
            DeciResult::Float(a) => DeciResult::Float(*a),
            DeciResult::Column(items) => {
                DeciResult::Column(items.iter().map(|x| x.to_float()).collect())
            }
            _ => panic!("Cannot convert type to float"),
        }
    }

    pub fn negate(&self) -> DeciResult {
        match self {
            DeciResult::Float(a) => DeciResult::Float(-*a),
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
            DeciResult::Float(a) => DeciResult::Float(1.0 / *a),
            DeciResult::Fraction(n, d) => DeciResult::Fraction(*d, *n),
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
        match (self, other) {
            (DeciResult::Float(a), DeciResult::Float(b)) => DeciResult::Float(a + b),
            (DeciResult::Float(a), DeciResult::Fraction(n, d)) => {
                DeciResult::Float(a) + DeciResult::Fraction(n, d).to_float()
            }
            (DeciResult::Float(a), DeciResult::Column(items)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() + DeciResult::Float(a))
                    .collect(),
            ),

            (DeciResult::Fraction(n, d), DeciResult::Float(a)) => {
                DeciResult::Fraction(n, d).to_float() + DeciResult::Float(a)
            }
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => {
                if d1 == d2 {
                    let n = n1.checked_add(n2);
                    match n {
                        Some(num) => return DeciResult::Fraction(num, d1),
                        None => {
                            return DeciResult::Float(
                                (n1 as f64 / d1 as f64) + (n2 as f64 / d2 as f64),
                            );
                        }
                    }
                }

                let mylcm = lcm(d1, d2);
                let nLeft = n1.checked_mul(mylcm / d1);
                let nRight = n2.checked_mul(mylcm / d2);
                let n;

                match (nLeft, nRight) {
                    (Some(l), Some(r)) => {
                        n = (l).checked_add(r);
                    }
                    _ => {
                        let g1 = gcd(n1, d1);
                        let g2 = gcd(n2, d2);
                        if g1 > 1 || g2 > 1 {
                            return DeciResult::Fraction(n1 / g1, d1 / g1)
                                + DeciResult::Fraction(n2 / g2, d2 / g2);
                        } else {
                            return DeciResult::Fraction(n1, d1).to_float()
                                + DeciResult::Fraction(n2, d2).to_float();
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
                        let g1 = gcd(n1, d1);
                        let g2 = gcd(n2, d2);
                        if g1 > 1 || g2 > 1 {
                            return DeciResult::Fraction(n1 / g1, d1 / g1)
                                + DeciResult::Fraction(n2 / g2, d2 / g2);
                        } else {
                            return DeciResult::Fraction(n1, d1).to_float()
                                + DeciResult::Fraction(n2, d2).to_float();
                        }
                    }
                }
            }
            (DeciResult::Fraction(n, d), DeciResult::Column(items)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() + DeciResult::Fraction(n, d))
                    .collect(),
            ),

            (DeciResult::Column(items), DeciResult::Float(a)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() + DeciResult::Float(a))
                    .collect(),
            ),
            (DeciResult::Column(items), DeciResult::Fraction(n, d)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() + DeciResult::Fraction(n, d))
                    .collect(),
            ),
            (DeciResult::Column(items1), DeciResult::Column(items2)) => DeciResult::Column(
                items1
                    .iter()
                    .zip(items2.iter())
                    .map(|(a, b)| a.clone() + b.clone())
                    .collect(),
            ),
            _ => panic!("Cannot add these types"),
        }
    }
}

impl<T> Add<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciResult;

    fn add(self, other: T) -> DeciResult {
        self + DeciResult::Float(other.approx_into().unwrap())
    }
}

impl Sub for DeciResult {
    type Output = DeciResult;

    fn sub(self, other: DeciResult) -> DeciResult {
        self + other.negate()
    }
}

impl<T> Sub<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciResult;

    fn sub(self, other: T) -> DeciResult {
        self - DeciResult::Float(other.approx_into().unwrap())
    }
}

impl Mul for DeciResult {
    type Output = DeciResult;

    fn mul(self, other: DeciResult) -> DeciResult {
        match (self, other) {
            (DeciResult::Float(a), DeciResult::Float(b)) => DeciResult::Float(a * b),
            (DeciResult::Float(a), DeciResult::Fraction(n, d)) => {
                DeciResult::Float(a) * DeciResult::Fraction(n, d).to_float()
            }
            (DeciResult::Float(a), DeciResult::Column(items)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() * DeciResult::Float(a))
                    .collect(),
            ),

            (DeciResult::Fraction(n, d), DeciResult::Float(a)) => {
                DeciResult::Fraction(n, d).to_float() * DeciResult::Float(a)
            }
            (DeciResult::Fraction(n1, d1), DeciResult::Fraction(n2, d2)) => {
                let newnum = n1.checked_mul(n2);
                let newden = d1.checked_mul(d2);
                match (newnum, newden) {
                    (Some(n), Some(d)) => DeciResult::Fraction(n, d),
                    _ => {
                        return DeciResult::Fraction(n1, d1).to_float()
                            * DeciResult::Fraction(n2, d2).to_float();
                    }
                }
            }
            (DeciResult::Fraction(n, d), DeciResult::Column(items)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() * DeciResult::Fraction(n, d))
                    .collect(),
            ),

            (DeciResult::Column(items), DeciResult::Float(a)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() * DeciResult::Float(a))
                    .collect(),
            ),
            (DeciResult::Column(items), DeciResult::Fraction(n, d)) => DeciResult::Column(
                items
                    .iter()
                    .map(|x| x.clone() * DeciResult::Fraction(n, d))
                    .collect(),
            ),
            (DeciResult::Column(items1), DeciResult::Column(items2)) => DeciResult::Column(
                items1
                    .iter()
                    .zip(items2.iter())
                    .map(|(a, b)| a.clone() * b.clone())
                    .collect(),
            ),
            _ => panic!("Cannot multiply these types"),
        }
    }
}

impl<T> Mul<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciResult;
    fn mul(self, other: T) -> DeciResult {
        self * DeciResult::Float(other.approx_into().unwrap())
    }
}

impl Div for DeciResult {
    type Output = DeciResult;

    fn div(self, other: DeciResult) -> DeciResult {
        self * other.reciprocal()
    }
}

impl<T> Div<T> for DeciResult
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciResult;

    fn div(self, other: T) -> DeciResult {
        self / DeciResult::Float(other.approx_into().unwrap())
    }
}
