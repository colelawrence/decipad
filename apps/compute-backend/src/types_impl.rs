use std::{
    cmp::min,
    ops::{Add, Div, Mul, Sub},
};

/* ----Implements easy to use zero (mostly good for summing and similar)----  */
use num::{
    integer::{gcd, lcm},
    Zero,
};

use crate::types::{DeciCommon, DeciFloat, DeciFrac, DeciValue, NCol};

///
/// This file contains the implementation functions for Rust primitives
/// that represent DeciValues in Rustland.
///

impl Zero for DeciFloat {
    fn zero() -> DeciFloat {
        DeciFloat {
            val: 0.0,
            inf: false,
            und: false,
        }
    }

    fn is_zero(&self) -> bool {
        if self.val == 0.0 && !self.inf && !self.und {
            return true;
        }
        return false;
    }
}

impl Zero for DeciFrac {
    fn zero() -> DeciFrac {
        DeciFrac {
            n: 0,
            d: 1,
            inf: false,
            und: false,
        }
    }

    fn is_zero(&self) -> bool {
        if self.n == 0 && self.d != 0 && !self.inf && !self.und {
            return true;
        }
        return false;
    }
}

/* ----Implements DeciCommon for DeciFloat and DeciFrac (Trait mainly to ensure functions that could get used on either are implemented)---- */
impl DeciCommon for DeciFloat {
    fn get_frac(&self) -> (i64, i64) {
        if self.val == 0.0 {
            return (0, 1);
        }

        let mut exponent = 0;
        let mut fraction = self.val;

        while fraction.fract() != 0.0 {
            fraction *= 2.0;
            exponent += 1;
        }

        (fraction as i64, 1 << exponent)
    }

    fn get_float(&self) -> f64 {
        self.val
    }

    fn reduce(&mut self) {}

    fn to_frac(&self) -> DeciFrac {
        let (n, d) = self.get_frac();
        DeciFrac {
            n,
            d,
            inf: self.inf,
            und: self.und,
        }
    }

    fn to_float(&self) -> DeciFloat {
        *self
    }
}

impl DeciCommon for DeciFrac {
    fn get_frac(&self) -> (i64, i64) {
        (self.n, self.d)
    }

    fn get_float(&self) -> f64 {
        self.n as f64 / self.d as f64
    }

    fn reduce(&mut self) {
        let gcd = gcd(self.n.abs() as u64, self.d as u64);
        self.n = self.n / gcd as i64;
        self.d = self.d / gcd as i64;
    }

    fn to_frac(&self) -> DeciFrac {
        *self
    }

    fn to_float(&self) -> DeciFloat {
        DeciFloat {
            val: self.get_float(),
            inf: self.inf,
            und: self.und,
        }
    }
}

/* ----Implements basic arithmetic functions for DeciFloat and DeciFrac---- */

impl Add for DeciFloat {
    type Output = DeciFloat;

    fn add(self, other: DeciFloat) -> DeciFloat {
        DeciFloat {
            val: self.val + other.val,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Add for DeciFrac {
    type Output = DeciFrac;

    fn add(self, other: DeciFrac) -> DeciFrac {
        let denlcm = lcm(self.d, other.d);
        DeciFrac {
            n: (self.n * denlcm / self.d) + (other.n * denlcm / other.d),
            d: denlcm,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Add<DeciFrac> for DeciFloat {
    type Output = DeciFrac;

    fn add(self, other: DeciFrac) -> DeciFrac {
        other + self.to_frac()
    }
}

impl Add<DeciFloat> for DeciFrac {
    type Output = DeciFrac;

    fn add(self, other: DeciFloat) -> DeciFrac {
        self + other.to_frac()
    }
}

impl Sub for DeciFloat {
    type Output = DeciFloat;

    fn sub(self, other: DeciFloat) -> DeciFloat {
        DeciFloat {
            val: self.val - other.val,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Sub for DeciFrac {
    type Output = DeciFrac;

    fn sub(self, other: DeciFrac) -> DeciFrac {
        let denlcm = lcm(self.d, other.d);
        DeciFrac {
            n: (self.n * denlcm / self.d) - (other.n * denlcm / other.d),
            d: denlcm,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Mul for DeciFloat {
    type Output = DeciFloat;

    fn mul(self, other: DeciFloat) -> DeciFloat {
        DeciFloat {
            val: self.val * other.val,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Mul for DeciFrac {
    type Output = DeciFrac;

    fn mul(self, other: DeciFrac) -> DeciFrac {
        DeciFrac {
            n: self.n * other.n,
            d: self.d * other.d,
            inf: self.inf || other.inf,
            und: self.und || other.und,
        }
    }
}

impl Div for DeciFloat {
    type Output = DeciFloat;

    fn div(self, other: DeciFloat) -> DeciFloat {
        DeciFloat {
            val: if other.val != 0.0 {
                self.val / other.val
            } else {
                0.0
            },
            inf: self.inf,
            und: self.und || other.inf || other.und || other.val == 0.0,
        }
    }
}

impl NCol {
    pub fn from_frac(nums: Vec<i64>, dens: Vec<i64>) -> Option<NCol> {
        let mut fracs = vec![];
        if nums.len() == dens.len() {
            for (n, d) in nums.iter().zip(dens.iter()) {
                fracs.push(DeciFrac {
                    n: *n,
                    d: *d,
                    inf: false,
                    und: false,
                });
            }
            return Some(NCol::FracCol(fracs));
        }
        None
    }

    pub fn from_float(nums: Vec<f64>) -> NCol {
        let mut floats = vec![];
        for n in nums.iter() {
            floats.push(DeciFloat {
                val: *n,
                inf: false,
                und: false,
            });
        }
        NCol::FloatCol(floats)
    }

    pub fn from_decifrac(fracs: Vec<DeciFrac>) -> NCol {
        NCol::FracCol(fracs)
    }

    pub fn from_decifloat(floats: Vec<DeciFloat>) -> NCol {
        NCol::FloatCol(floats)
    }

    pub fn to_float(&self) -> NCol {
        match self {
            NCol::FloatCol(a) => NCol::from_decifloat(a.to_vec()),
            NCol::FracCol(a) => NCol::from_decifloat(a.iter().map(|x| x.to_float()).collect()),
        }
    }

    pub fn to_frac(&self) -> NCol {
        match self {
            NCol::FloatCol(a) => NCol::from_decifrac(a.iter().map(|x| x.to_frac()).collect()),
            NCol::FracCol(a) => NCol::from_decifrac(a.to_vec()),
        }
    }

    pub fn sum_float(&self) -> DeciFloat {
        match self {
            NCol::FloatCol(a) => {
                let mut sum = DeciFloat::zero();
                for val in a.iter() {
                    sum = sum + *val;
                }
                sum
            }
            NCol::FracCol(a) => {
                let mut sum = DeciFloat::zero();
                for val in a.iter() {
                    sum = sum + val.to_float();
                }
                sum
            }
        }
    }

    pub fn sum_frac(&self) -> DeciFrac {
        match self {
            NCol::FloatCol(a) => {
                let mut sum = DeciFloat::zero();
                for val in a.iter() {
                    sum = sum + *val;
                }
                sum.to_frac()
            }
            NCol::FracCol(a) => {
                let mut sum = DeciFrac::zero();
                for val in a.iter() {
                    sum = sum + *val;
                }
                sum
            }
        }
    }

    pub fn len(&self) -> usize {
        match self {
            NCol::FloatCol(a) => a.len(),
            NCol::FracCol(a) => a.len(),
        }
    }

    pub fn get_slice(&self, start: usize, end: usize) -> NCol {
        match self {
            NCol::FloatCol(a) => NCol::from_decifloat(a[start..end].to_vec()),
            NCol::FracCol(a) => NCol::from_decifrac(a[start..end].to_vec()),
        }
    }

    pub fn to_vec_frac(&self) -> Vec<(i64, i64)> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| x.get_frac()).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| x.get_frac()).collect(),
        }
    }

    pub fn to_vec_float(&self) -> Vec<f64> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| x.get_float()).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| x.get_float()).collect(),
        }
    }
}

impl Add for NCol {
    type Output = NCol;

    fn add(self, other: NCol) -> NCol {
        match (self, other) {
            (NCol::FloatCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifloat(tuples.map(|(a, b)| *a + *b).collect())
            }
            (NCol::FracCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a + *b).collect())
            }
            (NCol::FloatCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a + *b).collect())
            }
            (NCol::FracCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a + *b).collect())
            }
        }
    }
}

impl DeciValue {
    pub fn from_floats(floats: Vec<f64>) -> DeciValue {
        DeciValue::NumberColumn(NCol::from_float(floats))
    }

    pub fn from_fracs(nums: Vec<i64>, dens: Vec<i64>) -> DeciValue {
        DeciValue::NumberColumn(NCol::from_frac(nums, dens).unwrap())
    }
}
