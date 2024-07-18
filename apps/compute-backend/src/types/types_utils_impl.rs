use super::types::{DeciFloat, DeciFrac, DeciValue, NCol};
use js_sys::{Array, Object};
use std::{cmp::Ordering, iter::FromIterator};
use wasm_bindgen::JsValue;

impl Ord for DeciFloat {
    fn cmp(&self, other: &Self) -> Ordering {
        let are_both_defined = !self.inf && !other.inf && !self.und && !other.und;

        if are_both_defined {
            if self.val == other.val {
                Ordering::Equal
            } else if self.val < other.val {
                Ordering::Less
            } else {
                Ordering::Greater
            }
        } else {
            // what should we do here?
            Ordering::Equal
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
            DeciValue::BooleanColumn(_a) => None,
            DeciValue::StringColumn(_a) => None,
        }
    }

    pub fn gt_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.gt_num(val)),
            DeciValue::BooleanColumn(_a) => None,
            DeciValue::StringColumn(_a) => None,
        }
    }

    pub fn ge_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.ge_num(val)),
            DeciValue::BooleanColumn(_a) => None,
            DeciValue::StringColumn(_a) => None,
        }
    }

    pub fn lt_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.lt_num(val)),
            DeciValue::BooleanColumn(_a) => None,
            DeciValue::StringColumn(_a) => None,
        }
    }

    pub fn le_num(&self, val: DeciFrac) -> Option<Vec<bool>> {
        match self {
            DeciValue::NumberColumn(a) => Some(a.le_num(val)),
            DeciValue::BooleanColumn(_a) => None,
            DeciValue::StringColumn(_a) => None,
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

    pub fn to_js_val(self) -> Object {
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
