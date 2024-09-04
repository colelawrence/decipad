mod infer;
mod parse;
mod types;
mod value;

use infer::infer_columns;

use deci_result::{deserialize_result, serialize_result};
use js_sys;
use js_sys::Float64Array;
use js_sys::{BigInt64Array, Object};
use parse::csv_to_parsed;
use rand::rngs::OsRng;
use rand_unique::{RandomSequence, RandomSequenceBuilder};
use wasm_bindgen_test::{wasm_bindgen_test, wasm_bindgen_test_configure};
use std::collections::HashMap;
use types::types::{DeciResult, DeciType};
use value::sorted_column::SortedColumn;
use wasm_bindgen::prelude::*;
pub mod deci_result;

wasm_bindgen_test_configure!(run_in_browser);

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
    sequence: RandomSequence<u64>,
}

///
/// Utility functions to inject values into RustLand.
///
///
#[wasm_bindgen_test]
pub fn test_csv_in() {
  let mut a = ComputeBackend::new();
  let csv = "c1, c2, c3, c4
        7, 2, 5, 3
        6, 6, 7, 1
        1, 7, 3, 4
        2, 1, 2, 2";
  let serialized_keys = a.read_csv_in(csv.to_string(), true);
  let deserialized_keys = deserialize_result(serialized_keys).unwrap();
  log(deserialized_keys.get_string().as_str());
  for (key, value) in a.values.clone() {
    log(format!("{}: {}", key, value.get_string()).as_str());
  }
  let keystr = &deserialized_keys.as_column()[0].as_column()[1].get_string();
  log(format!("{}", a.sum(keystr.clone())).as_str());
  assert_eq!(a.sum(keystr.clone()), 16.0);
}

#[wasm_bindgen]
impl ComputeBackend {
    pub fn read_csv_in(&mut self, csv: String, is_first_header_row: bool) -> Object {
        let (col_names, csv_cols) = internal_parse_csv(&csv, is_first_header_row).unwrap();
        let mut colKeys = vec![];
        for (col, i) in csv_cols.into_iter().zip(0..col_names.len()) {
            let current_key = self.sequence.next().unwrap().to_string();
            colKeys.push(DeciResult::Column(vec![
                DeciResult::String(col_names[i].clone()),
                DeciResult::String(current_key.clone()),
            ]));
            self.values.insert(current_key, col);
        }
        return serialize_result(DeciResult::Column(colKeys));
    }

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
        let config = RandomSequenceBuilder::<u64>::rand(&mut OsRng);

        ComputeBackend {
            values: HashMap::new(),
            sequence: config.into_iter(),
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

    // no floats here.
    // +-Infinity = +-1/0
    // Undefined = 0/0

    pub fn sum_result_fraction_column(&self, result: js_sys::Object) -> Object {
        let res = deserialize_result(result).unwrap();
        serialize_result(res.sum_frac())
    }

    pub fn sumif_result_fraction_column(
        &self,
        result: js_sys::Object,
        mask: js_sys::Object,
    ) -> Object {
        let res = deserialize_result(result).unwrap();
        let boolmask = deserialize_result(mask).unwrap();
        serialize_result(res.mask_with(boolmask).sum_frac())
    }

    pub fn min_result_fraction_column(&self, result: js_sys::Object) -> Object {
        let res = deserialize_result(result).unwrap();
        serialize_result(res.min_val())
    }

    pub fn max_result_fraction_column(&self, result: js_sys::Object) -> Object {
        let res = deserialize_result(result).unwrap();
        serialize_result(res.max_val())
    }

    pub fn mean_result_fraction_column(&self, result: js_sys::Object) -> Object {
        let res = deserialize_result(result).unwrap();
        serialize_result(res.mean())
    }

    pub fn median_result_fraction_column(&self, result: js_sys::Object) -> Object {
        let res = deserialize_result(result).unwrap();
        let mut s = SortedColumn::new(res);
        s.sort_and_save();
        serialize_result(s.median())
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
