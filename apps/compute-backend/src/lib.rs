mod infer;
mod parse;
pub mod tests;
mod types;
mod value;

use infer::infer_columns;

use deci_result::{deserialize_result, serialize_result, SerializedResult};
use js_sys;
use js_sys::Float64Array;
use js_sys::{BigInt64Array, Object};
use num::integer::lcm;
use parse::csv_to_parsed;
use std::collections::HashMap;
use types::types::{DeciResult, DeciType};
use wasm_bindgen::prelude::*;
pub mod deci_result;

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
) -> Result<(Vec<String>, Vec<DeciResult>), ComputeErrors> {
    let parsed_csv = csv_to_parsed(&csv, is_first_header_row);
    let inferred_columns = infer_columns(&parsed_csv).expect("could not parse");

    let mut injected_result_names: Vec<String> = Vec::new();
    let mut injested_result: Vec<DeciResult> = Vec::new();

    for (index, col) in parsed_csv.iter().enumerate() {
        let inferred_column_type = &inferred_columns[index];

        let cohersed_column = match inferred_column_type {
            DeciType::String => DeciResult::Column(
                col.value
                    .iter()
                    .map(|x| DeciResult::String(x.to_string()))
                    .collect(),
            ),
            DeciType::Number => DeciResult::Column(
                col.value
                    .iter()
                    .map(|value| {
                        DeciResult::Float(
                            value.parse::<f64>().expect("could not parse inferred col"),
                        )
                    })
                    .collect(),
            ),
            DeciType::Boolean => DeciResult::Column(
                col.value
                    .iter()
                    .map(|value| {
                        DeciResult::Boolean(
                            value
                                .to_lowercase()
                                .parse::<bool>()
                                .expect("could not parse inferred col"),
                        )
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
pub fn parse_csv(csv: String, is_first_header_row: bool) -> Object {
    let (column_names, csv_columns) = internal_parse_csv(&csv, is_first_header_row).unwrap();

    serialize_result(DeciResult::Column(csv_columns))
}
#[wasm_bindgen]
pub struct ComputeBackend {
    values: HashMap<String, DeciResult>,
}

///
/// Utility functions to inject values into RustLand.
///

#[wasm_bindgen]
impl ComputeBackend {
    pub fn insert_number_column_float(&mut self, id: String, value: &Float64Array) {
        let numbers = value.to_vec();

        self.values.insert(
            id,
            DeciResult::Column(numbers.iter().map(|x| DeciResult::Float(*x)).collect()),
        );
    }

    pub fn insert_number_column_frac(
        &mut self,
        id: String,
        nums: &BigInt64Array,
        dens: &BigInt64Array,
    ) {
        let numsN = nums.to_vec();
        let densN = dens.to_vec();

        self.values.insert(
            id,
            DeciResult::Column(
                numsN
                    .iter()
                    .zip(densN.iter())
                    .map(|(n, d)| DeciResult::Fraction(*n, *d))
                    .collect(),
            ),
        );
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

    /*
     * Takes the raw string of CSV, coherses it and stores the type in WASM.
     * It then returns the IDs of the columns or an error.
     */

    pub fn get_slice(&mut self, id: String, start: i64, end: i64) -> Option<Vec<f64>> {
        let column = self.values.get(&id)?;
        let number_column = match column {
            DeciResult::Column(col) => col,
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
            number_column[start_usize..end_usize]
                .iter()
                .map(|x| x.get_float())
                .collect(),
        )
    }

    /*
     * for strings
     */
    pub fn get_slice_string(&mut self, id: String, start: i64, end: i64) -> Option<Vec<String>> {
        let column = self.values.get(&id)?;
        let number_column = match column {
            DeciResult::Column(col) => col,
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
            number_column[start_usize..end_usize]
                .iter()
                .map(|x| x.get_string())
                .collect(),
        )
    }

    fn get_value(&mut self, id: String) -> Result<DeciResult, ComputeErrors> {
        match self.values.get(&id) {
            Some(v) => Ok(v.clone()),
            None => Err(ComputeErrors::UnknownId),
        }
    }

    /**
     * Returns the sum of internal column values,
     * and returns a regular JSNumber (f64).
     *
     * @throws Rust Result are exceptions in JS.
     */
    pub fn sum(&mut self, id: String) -> f64 {
        let column: DeciResult = self.get_value(id).unwrap();

        column.sum_float().get_float()
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

    pub fn sum_result_fraction_column(&self, result: js_sys::Object) -> f64 {
        let res = deserialize_result(result).unwrap();
        res.sum_frac().get_float()
    }

    pub fn min_result_fraction_column(&self, result: js_sys::Object) -> f64 {
        let res = deserialize_result(result).unwrap();
        res.min_val().get_float()
    }

    pub fn max_result_fraction_column(&self, result: js_sys::Object) -> f64 {
        let res = deserialize_result(result).unwrap();
        res.max_val().get_float()
    }

    pub fn mean_result_fraction_column(&self, result: js_sys::Object) -> f64 {
        let res = deserialize_result(result).unwrap();
        res.mean().get_float()
    }

    pub fn test_deserialization(&mut self, result: js_sys::Object) -> bool {
        let res = deserialize_result(result);
        log(&format!("{:?}", res));
        return true;
    }

    pub fn gt_mask(&mut self, id: String, n: i64, d: i64) -> Object {
        let column: DeciResult = self.get_value(id).unwrap();
        let out;
        match column.gt_num(DeciResult::Fraction(n, d)) {
            DeciResult::Column(items) => out = column.mask_with(DeciResult::Column(items)),
            _ => panic!("Impossible return type"),
        }
        serialize_result(out)
        //out is the value that needs to be passed into the serializer and returned
    }

    pub fn ge_mask(&mut self, id: String, n: i64, d: i64) -> Object {
        let column: DeciResult = self.get_value(id).unwrap();
        let out;
        match column.ge_num(DeciResult::Fraction(n, d)) {
            DeciResult::Column(items) => out = column.mask_with(DeciResult::Column(items)),
            _ => panic!("Impossible return type"),
        }
        serialize_result(out)
        //out is the value that needs to be passed into the serializer and returned
    }

    pub fn lt_mask(&mut self, id: String, n: i64, d: i64) -> Object {
        let column: DeciResult = self.get_value(id).unwrap();
        let out;
        match column.lt_num(DeciResult::Fraction(n, d)) {
            DeciResult::Column(items) => out = column.mask_with(DeciResult::Column(items)),
            _ => panic!("Impossible return type"),
        }
        serialize_result(out)
        //out is the value that needs to be passed into the serializer and returned
    }

    pub fn le_mask(&mut self, id: String, n: i64, d: i64) -> Object {
        let column: DeciResult = self.get_value(id).unwrap();
        let out;
        match column.le_num(DeciResult::Fraction(n, d)) {
            DeciResult::Column(items) => out = column.mask_with(DeciResult::Column(items)),
            _ => panic!("Impossible return type"),
        }
        serialize_result(out)
        //out is the value that needs to be passed into the serializer and returned
    }

    pub fn eq_mask(&mut self, id: String, n: i64, d: i64) -> Object {
        let column: DeciResult = self.get_value(id).unwrap();
        let out;
        match column.eq_num(DeciResult::Fraction(n, d)) {
            DeciResult::Column(items) => out = column.mask_with(DeciResult::Column(items)),
            _ => panic!("Impossible return type"),
        }
        serialize_result(out)
        //out is the value that needs to be passed into the serializer and returned
    }
}

#[test]
fn test_masking() {
    let my_deci = DeciResult::Column(
        [1, 2, 3, 4, 5]
            .map(|x| {
                DeciResult::Column(
                    [x + 0, x + 1, x + 2, x + 3, x + 4]
                        .map(|x| DeciResult::Fraction(x, 1))
                        .to_vec(),
                )
            })
            .to_vec(),
    );
    println!(
        "{}",
        my_deci
            .mask_with(my_deci.lt_num(DeciResult::Float(5.0)))
            .get_string()
    );
}

#[test]
fn test_mean() {
    let my_deci = DeciResult::Column(
        [1, 2, 3, 4, 5]
            .map(|x| {
                DeciResult::Column(
                    [x + 0, x + 1, x + 2, x + 3, x + 4]
                        .map(|x| DeciResult::Fraction(x, 1))
                        .to_vec(),
                )
            })
            .to_vec(),
    );
    println!("{}", my_deci.range().get_string());
}
