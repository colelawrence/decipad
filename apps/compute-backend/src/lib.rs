mod infer;
mod parse;
mod types;

use std::{collections::HashMap, iter::FromIterator};

use crate::types::DeciCommon;
use infer::infer_columns;
use js_sys::{Array, Float64Array, Object};
use num::integer::lcm;
use parse::csv_to_parsed;
use types::{DeciType, NCol};
mod types_impl;

use js_sys::BigInt64Array;
use types::DeciValue;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    log("Hello, compute-backend!");
}

#[wasm_bindgen]
#[derive(Debug)]
pub enum ComputeErrors {
    IncorrectType,
    UnknownId,
    InferError,
}

/*
 * Takes the raw string of CSV, coherses it and stores the type in WASM.
 * It then returns the IDs of the columns or an error.
 */
pub fn internal_parse_csv(
    csv: &String,
    is_first_header_row: bool,
) -> Result<(Vec<String>, Vec<DeciValue>), ComputeErrors> {
    let parsed_csv = csv_to_parsed(&csv, is_first_header_row);
    let inferred_columns = infer_columns(&parsed_csv).expect("could not parse");

    let mut injected_result_names: Vec<String> = Vec::new();
    let mut injested_result: Vec<DeciValue> = Vec::new();

    for (index, col) in parsed_csv.iter().enumerate() {
        let inferred_column_type = &inferred_columns[index];

        let cohersed_column = match inferred_column_type {
            DeciType::String => DeciValue::StringColumn(col.value.to_vec()),
            DeciType::Number => DeciValue::NumberColumn(NCol::from_float(
                col.value
                    .iter()
                    .map(|value| value.parse::<f64>().expect("could not parse inferred col"))
                    .collect(),
            )),
            DeciType::Boolean => DeciValue::BooleanColumn(
                col.value
                    .iter()
                    .map(|value| {
                        value
                            .to_lowercase()
                            .parse::<bool>()
                            .expect("could not parse inferred col")
                    })
                    .collect(),
            ),
            _ => unreachable!(),
        };

        injected_result_names.push(col.name.clone());
        injested_result.push(cohersed_column);
    }

    Ok((injected_result_names, injested_result))
}

#[wasm_bindgen]
pub fn parse_csv(csv: String, is_first_header_row: bool) -> Result<Object, ComputeErrors> {
    let (column_names, csv_columns) = internal_parse_csv(&csv, is_first_header_row)?;

    let column_values = Array::new();

    for col in csv_columns {
        let js_value_arr: Vec<JsValue> = match col {
            DeciValue::NumberColumn(c) => match c {
                NCol::FloatCol(float_col) => {
                    float_col.iter().map(|v| JsValue::from_f64(v.val)).collect()
                }
                _ => unreachable!(),
            },
            DeciValue::BooleanColumn(c) => c.iter().map(|v| JsValue::from_bool(*v)).collect(),
            DeciValue::StringColumn(c) => c.iter().map(|v| JsValue::from_str(v)).collect(),
        };

        column_values.push(&Array::from_iter(js_value_arr.iter()));
    }

    let js_column_names: Vec<JsValue> = column_names.iter().map(|v| JsValue::from_str(v)).collect();

    let obj = Object::new();

    _ = js_sys::Reflect::set(
        &obj,
        &"column_names".into(),
        &Array::from_iter(js_column_names.iter()),
    );

    _ = js_sys::Reflect::set(&obj, &"column_values".into(), &column_values);

    Ok(obj)
}

#[wasm_bindgen]
pub struct ComputeBackend {
    values: HashMap<String, DeciValue>,
}

///
/// Utility functions to inject values into RustLand.
///

#[wasm_bindgen]
impl ComputeBackend {
    pub fn insert_number_column_float(&mut self, id: String, value: &Float64Array) {
        let numbers = value.to_vec();

        self.values.insert(id, DeciValue::from_floats(numbers));
    }

    pub fn insert_number_column_frac(
        &mut self,
        id: String,
        nums: &BigInt64Array,
        dens: &BigInt64Array,
    ) {
        let num = nums.to_vec();
        let den = dens.to_vec();

        self.values.insert(id, DeciValue::from_fracs(num, den));
    }
}

#[wasm_bindgen]
impl ComputeBackend {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ComputeBackend {
        ComputeBackend {
            values: HashMap::new(),
        }
    }

    pub fn insert_number_column(&mut self, id: String, value: &Float64Array) {
        let numbers = value.to_vec();

        self.values.insert(id, DeciValue::from_floats(numbers));
    }

    /*
     * only for floats and such
     */
    pub fn get_slice(&mut self, id: String, start: i64, end: i64) -> Option<Vec<f64>> {
        let column = self.values.get(&id)?;
        let number_column = match column {
            DeciValue::NumberColumn(col) => col,
            _ => unreachable!(),
        };

        let end_usize = if end == -1 {
            number_column.len()
        } else {
            end as usize
        };
        let start_usize = start as usize;

        assert!(start_usize < end_usize);

        Some(
            number_column
                .get_slice(start_usize, end_usize)
                .to_vec_float(),
        )
    }

    /*
     * for strings
     */
    pub fn get_slice_string(&mut self, id: String, start: i64, end: i64) -> Option<Vec<String>> {
        let column = self.values.get(&id)?;
        let number_column = match column {
            DeciValue::StringColumn(col) => col,
            _ => unreachable!(),
        };

        let end_usize = if end == -1 {
            number_column.len()
        } else {
            end as usize
        };
        let start_usize = start as usize;

        assert!(start_usize < end_usize);

        Some(number_column[start_usize..end_usize].to_vec())
    }

    fn get_value(&mut self, id: String) -> Result<&DeciValue, ComputeErrors> {
        match self.values.get(&id) {
            Some(v) => Ok(v),
            None => Err(ComputeErrors::UnknownId),
        }
    }

    /**
     * Returns the sum of internal column values,
     * and returns a regular JSNumber (f64).
     *
     * @throws Rust Result are exceptions in JS.
     */
    pub fn sum(&mut self, id: String) -> Result<f64, ComputeErrors> {
        let column = self.get_value(id)?;

        match column {
            DeciValue::NumberColumn(number_column) => Ok(number_column.sum_float().get_float()),
            _ => unreachable!(),
        }
    }

    pub fn sum_from_js(&mut self, value: &Float64Array) -> f64 {
        value.to_vec().iter().sum()
    }

    // no floats here.
    // +-Infinity = +-1/0
    // Undefined = 0/0
    pub fn sum_from_js_frac(&mut self, numerators: &[i64], denominator: &[i64]) -> Vec<i64> {
        let mut my_lcm: i64 = 1;
        for v in denominator.iter() {
            my_lcm = lcm(my_lcm, *v);
        }

        let mut sum: i64 = 0;

        for (index, numerator) in numerators.iter().enumerate() {
            sum += numerator * (my_lcm / denominator[index])
        }

        return vec![sum, my_lcm];
    }
}

#[test]
fn test_inject_csv() {
    let csv = "year,make,model,description,good
        1948,Porsche,356,Luxury sports car,true
        1967,Ford,Mustang fastback 1967,American car,False";

    let (names, res) = internal_parse_csv(&csv.to_string()).expect("to not have errors");

    assert_eq!(names[0], "year");
    assert_eq!(names[1], "make");
    assert_eq!(names[2], "model");
    assert_eq!(names[3], "description");
    assert_eq!(names[4], "good");

    assert_eq!(res[0], DeciValue::from_floats(vec![1948.0, 1967.0]));

    assert_eq!(
        res[1],
        DeciValue::StringColumn(vec!["Porsche".to_string(), "Ford".to_string()])
    );
    assert_eq!(
        res[2],
        DeciValue::StringColumn(vec!["356".to_string(), "Mustang fastback 1967".to_string()])
    );
    assert_eq!(
        res[3],
        DeciValue::StringColumn(vec![
            "Luxury sports car".to_string(),
            "American car".to_string()
        ])
    );
    assert_eq!(res[4], DeciValue::BooleanColumn(vec![true, false]));
}
