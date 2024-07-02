use std::{
    cmp::min,
    iter::FromIterator,
    ops::{Add, Div, Mul, Sub},
};

/* ----Implements easy to use zero (mostly good for summing and similar)----  */
use num::{
    integer::{gcd, lcm},
    Zero,
};

use conv::ApproxInto;
use wasm_bindgen::JsValue;

use crate::types::{DeciCommon, DeciFloat, DeciFrac, DeciValue, NCol};

use js_sys::{Array, Object};

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

impl<T> Add<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFrac;

    fn add(self, other: T) -> DeciFrac {
        let val = DeciFloat {
            val: other.approx_into().unwrap(),
            inf: false,
            und: false,
        };
        self + val
    }
}

impl<T> Add<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFloat;

    fn add(self, other: T) -> DeciFloat {
        DeciFloat {
            val: self.val + other.approx_into().unwrap(),
            inf: self.inf,
            und: self.und,
        }
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

impl Sub<DeciFrac> for DeciFloat {
    type Output = DeciFrac;

    fn sub(self, other: DeciFrac) -> DeciFrac {
        self.to_frac() - other
    }
}

impl Sub<DeciFloat> for DeciFrac {
    type Output = DeciFrac;

    fn sub(self, other: DeciFloat) -> DeciFrac {
        self - other.to_frac()
    }
}

impl<T> Sub<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFrac;

    fn sub(self, other: T) -> DeciFrac {
        let val = DeciFloat {
            val: other.approx_into().unwrap(),
            inf: false,
            und: false,
        };
        self - val
    }
}

impl<T> Sub<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFloat;

    fn sub(self, other: T) -> DeciFloat {
        DeciFloat {
            val: self.val - other.approx_into().unwrap(),
            inf: self.inf,
            und: self.und,
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

impl Mul<DeciFrac> for DeciFloat {
    type Output = DeciFrac;

    fn mul(self, other: DeciFrac) -> DeciFrac {
        other * self.to_frac()
    }
}

impl Mul<DeciFloat> for DeciFrac {
    type Output = DeciFrac;

    fn mul(self, other: DeciFloat) -> DeciFrac {
        self * other.to_frac()
    }
}

impl<T> Mul<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFrac;
    fn mul(self, other: T) -> DeciFrac {
        let val = DeciFloat {
            val: other.approx_into().unwrap(),
            inf: false,
            und: false,
        };
        self * val
    }
}

impl<T> Mul<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFloat;

    fn mul(self, other: T) -> DeciFloat {
        DeciFloat {
            val: self.val * other.approx_into().unwrap(),
            inf: self.inf,
            und: self.und,
        }
    }
}

impl Div for DeciFloat {
    type Output = DeciFloat;

    fn div(self, other: DeciFloat) -> DeciFloat {
        DeciFloat {
            val: if other.val != 0.0 && !other.inf && !other.und {
                self.val / other.val
            } else {
                0.0
            },
            inf: self.inf || other.val == 0.0,
            und: self.und || other.inf || other.und,
        }
    }
}

impl Div for DeciFrac {
    type Output = DeciFrac;

    fn div(self, other: DeciFrac) -> DeciFrac {
        DeciFrac {
            n: self.n * other.d,
            d: other.n * self.d,
            inf: self.inf || other.d == 0,
            und: self.und || other.und,
        }
    }
}

impl Div<DeciFrac> for DeciFloat {
    type Output = DeciFrac;

    fn div(self, other: DeciFrac) -> DeciFrac {
        self.to_frac() / other
    }
}

impl Div<DeciFloat> for DeciFrac {
    type Output = DeciFrac;

    fn div(self, other: DeciFloat) -> DeciFrac {
        self / other.to_frac()
    }
}

impl<T> Div<T> for DeciFrac
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFrac;

    fn div(self, other: T) -> DeciFrac {
        let val = DeciFloat {
            val: other.approx_into().unwrap(),
            inf: false,
            und: false,
        };
        self / val
    }
}

impl<T> Div<T> for DeciFloat
where
    T: ApproxInto<f64> + Copy,
{
    type Output = DeciFloat;

    fn div(self, other: T) -> DeciFloat {
        DeciFloat {
            val: self.val / other.approx_into().unwrap(),
            inf: self.inf,
            und: self.und,
        }
    }
}

impl NCol {
    pub fn from_frac(nums: Vec<i64>, dens: Vec<i64>) -> NCol {
        assert_eq!(nums.len(), dens.len());

        let mut fracs = vec![];
        for (n, d) in nums.iter().zip(dens.iter()) {
            fracs.push(DeciFrac {
                n: *n,
                d: *d,
                inf: false,
                und: false,
            });
        }
        NCol::FracCol(fracs)
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

    pub fn min_frac(&self) -> Vec<i64> {
        match self {
            NCol::FracCol(a) => {
                let mut minfrac = a[0];
                for frac in a.iter().skip(1) {
                    if *frac < minfrac {
                        minfrac = *frac;
                    }
                }
                vec![minfrac.n, minfrac.d]
            }
            NCol::FloatCol(a) => {
                let mut minval = a[0];
                for val in a.iter().skip(1) {
                    if *val < minval {
                        minval = *val;
                    }
                }
                let minfrac = minval.to_frac();
                vec![minfrac.n, minfrac.d]
            }
        }
    }

    pub fn max_frac(&self) -> Vec<i64> {
        match self {
            NCol::FracCol(a) => {
                let mut maxfrac = a[0];
                for frac in a.iter().skip(1) {
                    if *frac > maxfrac {
                        maxfrac = *frac;
                    }
                }
                vec![maxfrac.n, maxfrac.d]
            }
            NCol::FloatCol(a) => {
                let mut maxval = a[0];
                for val in a.iter().skip(1) {
                    if *val > maxval {
                        maxval = *val;
                    }
                }
                let maxfrac = maxval.to_frac();
                vec![maxfrac.n, maxfrac.d]
            }
        }
    }

    pub fn eq_num(&self, num: DeciFrac) -> Vec<bool> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| *x == num).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| *x == num).collect(),
        }
    }

    pub fn gt_num(&self, num: DeciFrac) -> Vec<bool> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| *x > num).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| *x > num).collect(),
        }
    }
    pub fn ge_num(&self, num: DeciFrac) -> Vec<bool> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| *x >= num).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| *x >= num).collect(),
        }
    }
    pub fn lt_num(&self, num: DeciFrac) -> Vec<bool> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| *x < num).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| *x < num).collect(),
        }
    }
    pub fn le_num(&self, num: DeciFrac) -> Vec<bool> {
        match self {
            NCol::FracCol(a) => a.iter().map(|x| *x <= num).collect(),
            NCol::FloatCol(a) => a.iter().map(|x| *x <= num).collect(),
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

impl Sub for NCol {
    type Output = NCol;

    fn sub(self, other: NCol) -> NCol {
        match (self, other) {
            (NCol::FloatCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifloat(tuples.map(|(a, b)| *a - *b).collect())
            }
            (NCol::FracCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a - *b).collect())
            }
            (NCol::FloatCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a - *b).collect())
            }
            (NCol::FracCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a - *b).collect())
            }
        }
    }
}

impl Mul for NCol {
    type Output = NCol;

    fn mul(self, other: NCol) -> NCol {
        match (self, other) {
            (NCol::FloatCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifloat(tuples.map(|(a, b)| *a * *b).collect())
            }
            (NCol::FracCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a * *b).collect())
            }
            (NCol::FloatCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a * *b).collect())
            }
            (NCol::FracCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a * *b).collect())
            }
        }
    }
}

impl Div for NCol {
    type Output = NCol;

    fn div(self, other: NCol) -> NCol {
        match (self, other) {
            (NCol::FloatCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifloat(tuples.map(|(a, b)| *a / *b).collect())
            }
            (NCol::FracCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a / *b).collect())
            }
            (NCol::FloatCol(a), NCol::FracCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a / *b).collect())
            }
            (NCol::FracCol(a), NCol::FloatCol(b)) => {
                let num: usize = min(a.len(), b.len());
                let tuples = a[0..num].iter().zip(b[0..num].iter());
                NCol::from_decifrac(tuples.map(|(a, b)| *a / *b).collect())
            }
        }
    }
}

impl<T> Add<T> for NCol
where
    T: ApproxInto<f64> + Copy,
{
    type Output = NCol;

    fn add(self, other: T) -> NCol {
        match self {
            NCol::FloatCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifloat(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    };
                    num
                ]);
                NCol::from_decifloat(col) + v
            }
            NCol::FracCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifrac(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    }
                    .to_frac();
                    num
                ]);
                NCol::from_decifrac(col) + v
            }
        }
    }
}

impl<T> Sub<T> for NCol
where
    T: ApproxInto<f64> + Copy,
{
    type Output = NCol;

    fn sub(self, other: T) -> NCol {
        match self {
            NCol::FloatCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifloat(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    };
                    num
                ]);
                NCol::from_decifloat(col) - v
            }
            NCol::FracCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifrac(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    }
                    .to_frac();
                    num
                ]);
                NCol::from_decifrac(col) - v
            }
        }
    }
}

impl<T> Mul<T> for NCol
where
    T: ApproxInto<f64> + Copy,
{
    type Output = NCol;

    fn mul(self, other: T) -> NCol {
        match self {
            NCol::FloatCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifloat(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    };
                    num
                ]);
                NCol::from_decifloat(col) * v
            }
            NCol::FracCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifrac(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    }
                    .to_frac();
                    num
                ]);
                NCol::from_decifrac(col) * v
            }
        }
    }
}

impl<T> Div<T> for NCol
where
    T: ApproxInto<f64> + Copy,
{
    type Output = NCol;

    fn div(self, other: T) -> NCol {
        match self {
            NCol::FloatCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifloat(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    };
                    num
                ]);
                NCol::from_decifloat(col) / v
            }
            NCol::FracCol(col) => {
                let num: usize = col.len();
                let v = NCol::from_decifrac(vec![
                    DeciFloat {
                        val: other.approx_into().unwrap(),
                        inf: false,
                        und: false
                    }
                    .to_frac();
                    num
                ]);
                NCol::from_decifrac(col) / v
            }
        }
    }
}

impl DeciValue {
    pub fn from_floats(floats: Vec<f64>) -> DeciValue {
        DeciValue::NumberColumn(NCol::from_float(floats))
    }

    pub fn from_fracs(nums: Vec<i64>, dens: Vec<i64>) -> DeciValue {
        DeciValue::NumberColumn(NCol::from_frac(nums, dens))
    }

    pub fn len(&self) -> usize {
        match self {
            DeciValue::NumberColumn(a) => a.len(),
            DeciValue::BooleanColumn(a) => a.len(),
            DeciValue::StringColumn(a) => a.len(),
        }
    }

    pub fn eq_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.eq_num(val)),
            DeciValue::BooleanColumn(a) => None,
            DeciValue::StringColumn(a) => None,
        }
    }

    pub fn gt_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.gt_num(val)),
            DeciValue::BooleanColumn(a) => None,
            DeciValue::StringColumn(a) => None,
        }
    }

    pub fn ge_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.ge_num(val)),
            DeciValue::BooleanColumn(a) => None,
            DeciValue::StringColumn(a) => None,
        }
    }

    pub fn lt_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.lt_num(val)),
            DeciValue::BooleanColumn(a) => None,
            DeciValue::StringColumn(a) => None,
        }
    }

    pub fn le_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.le_num(val)),
            DeciValue::BooleanColumn(a) => None,
            DeciValue::StringColumn(a) => None,
        }
    }

    pub fn mask_with(&self, other: DeciValue) -> Option<DeciValue> {
        match (self, other) {
            (DeciValue::NumberColumn(v), DeciValue::BooleanColumn(m)) => match v {
                NCol::FracCol(f) => Some(DeciValue::NumberColumn(NCol::from_decifrac(
                    f.iter()
                        .zip(m.iter())
                        .filter_map(|(val, mask)| if *mask { Some(*val) } else { None })
                        .collect(),
                ))),
                NCol::FloatCol(f) => Some(DeciValue::NumberColumn(NCol::from_decifloat(
                    f.iter()
                        .zip(m.iter())
                        .filter_map(|(val, mask)| if *mask { Some(*val) } else { None })
                        .collect(),
                ))),
            },
            (DeciValue::BooleanColumn(v), DeciValue::BooleanColumn(m)) => {
                Some(DeciValue::BooleanColumn(
                    v.iter()
                        .zip(m.iter())
                        .filter_map(|(val, mask)| if *mask { Some(*val) } else { None })
                        .collect(),
                ))
            }
            (DeciValue::StringColumn(v), DeciValue::BooleanColumn(m)) => {
                Some(DeciValue::StringColumn(
                    v.iter()
                        .zip(m.iter())
                        .filter_map(|(val, mask)| if *mask { Some(val.clone()) } else { None })
                        .collect(),
                ))
            }
            _ => None,
        }
    }

    pub fn toJsVal(self) -> Object {
        let obj = Object::new();
        match self {
            DeciValue::NumberColumn(ncol) => {
                let fraccol = ncol.to_float();
                match fraccol {
                    NCol::FracCol(fracs) => {
                        let frac = Object::new();
                        _ = js_sys::Reflect::set(
                            &frac,
                            &"num".into(),
                            &Array::from_iter(fracs.iter().map(|x| JsValue::from_f64(x.n as f64))),
                        );
                        _ = js_sys::Reflect::set(
                            &frac,
                            &"den".into(),
                            &Array::from_iter(fracs.iter().map(|x| JsValue::from_f64(x.d as f64))),
                        );
                    }
                    _ => panic!("impossible"),
                }
            }
            DeciValue::BooleanColumn(bcol) => {
                _ = js_sys::Reflect::set(
                    &obj,
                    &"temp".into(),
                    &Array::from_iter(bcol.iter().map(|x| JsValue::from_bool(*x))),
                );
            }
            DeciValue::StringColumn(scol) => {
                _ = js_sys::Reflect::set(
                    &obj,
                    &"temp".into(),
                    &Array::from_iter(scol.iter().map(|x| JsValue::from_str(x))),
                );
            }
        }
        obj
    }
}

impl Add for DeciValue {
    type Output = DeciValue;

    fn add(self, other: DeciValue) -> DeciValue {
        match (self, other) {
            (DeciValue::NumberColumn(a), DeciValue::NumberColumn(b)) => {
                DeciValue::NumberColumn(a + b)
            }
            _ => panic!("Can't add this value"),
        }
    }
}

impl Sub for DeciValue {
    type Output = DeciValue;

    fn sub(self, other: DeciValue) -> DeciValue {
        match (self, other) {
            (DeciValue::NumberColumn(a), DeciValue::NumberColumn(b)) => {
                DeciValue::NumberColumn(a - b)
            }
            _ => panic!("Can't subtract this value"),
        }
    }
}

impl Mul for DeciValue {
    type Output = DeciValue;

    fn mul(self, other: DeciValue) -> DeciValue {
        match (self, other) {
            (DeciValue::NumberColumn(a), DeciValue::NumberColumn(b)) => {
                DeciValue::NumberColumn(a * b)
            }
            _ => panic!("Can't multiply this value"),
        }
    }
}

impl Div for DeciValue {
    type Output = DeciValue;

    fn div(self, other: DeciValue) -> DeciValue {
        match (self, other) {
            (DeciValue::NumberColumn(a), DeciValue::NumberColumn(b)) => {
                DeciValue::NumberColumn(a / b)
            }
            _ => panic!("Can't divide this value"),
        }
    }
}

impl<T> Add<T> for DeciValue
where
    T: ApproxInto<f64>,
{
    type Output = DeciValue;

    fn add(self, other: T) -> DeciValue {
        match self {
            DeciValue::NumberColumn(a) => DeciValue::NumberColumn(a + other.approx_into().unwrap()),
            _ => panic!("Can't add this value"),
        }
    }
}

impl<T> Sub<T> for DeciValue
where
    T: ApproxInto<f64>,
{
    type Output = DeciValue;

    fn sub(self, other: T) -> DeciValue {
        match self {
            DeciValue::NumberColumn(a) => DeciValue::NumberColumn(a - other.approx_into().unwrap()),
            _ => panic!("Can't add this value"),
        }
    }
}

impl<T> Mul<T> for DeciValue
where
    T: ApproxInto<f64>,
{
    type Output = DeciValue;

    fn mul(self, other: T) -> DeciValue {
        match self {
            DeciValue::NumberColumn(a) => DeciValue::NumberColumn(a * other.approx_into().unwrap()),
            _ => panic!("Can't add this value"),
        }
    }
}

impl<T> Div<T> for DeciValue
where
    T: ApproxInto<f64>,
{
    type Output = DeciValue;

    fn div(self, other: T) -> DeciValue {
        match self {
            DeciValue::NumberColumn(a) => DeciValue::NumberColumn(a / other.approx_into().unwrap()),
            _ => panic!("Can't add this value"),
        }
    }
}
