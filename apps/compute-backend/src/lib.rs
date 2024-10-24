mod infer;
mod parse;
mod types;
mod value;

use deci_result::{deserialize_result, serialize_result};
use import::{Csv, ImportOptions, Importer};
use js_sys::{self, BigUint64Array, Uint8Array};
use js_sys::{BigInt64Array, Object};
use rand::rngs::OsRng;
use rand_unique::{RandomSequence, RandomSequenceBuilder};
use std::collections::HashMap;
use types::types::{DeciResult, DeciType};
use value::sorted_column::SortedColumn;
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::wasm_bindgen_test_configure;
pub mod deci_result;
pub mod import;
#[cfg(test)]
pub mod tests;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen]
pub fn console_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[macro_export]
macro_rules! log{
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
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

#[wasm_bindgen]
pub struct ComputeBackend {
    values: HashMap<String, DeciResult>,
    sequence: RandomSequence<u64>,
}

#[wasm_bindgen]
impl ComputeBackend {
    pub fn insert_number_column_frac(
        &mut self,
        id: String,
        nums: &BigInt64Array,
        dens: &BigInt64Array,
    ) {
        let nums_n = nums.to_vec();
        let dens_n = dens.to_vec();

        self.values.insert(
            id,
            DeciResult::Column(
                nums_n
                    .iter()
                    .zip(dens_n.iter())
                    .map(|(n, d)| DeciResult::Fraction(*n, *d))
                    .collect(),
            ),
        );
    }
}

pub fn create_serialized_result(type_array: Vec<u64>, data: Vec<u8>) -> Object {
    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value);
    }

    let data_array_js = Uint8Array::new_with_length(data.len() as u32);
    data_array_js.copy_from(&data);

    let objout = js_sys::Object::new();
    js_sys::Reflect::set(&objout, &"type".into(), &JsValue::from(type_array_js))
        .expect("set type buffer");
    js_sys::Reflect::set(&objout, &"data".into(), &JsValue::from(data_array_js))
        .expect("set data buffer");

    objout
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

    pub fn bench_serialize_nothing(&self) {
        DeciResult::Boolean(true);
    }

    pub fn bench_serialize_boolean(&self) {
        serialize_result(DeciResult::Boolean(true)); // I want to move the initialisation of DeciResult::Boolean out of the function
    }

    pub fn bench_serialize_number(&self) {
        serialize_result(DeciResult::Fraction(1, 2));
    }

    pub fn bench_serialize_string(&self) {
        serialize_result(DeciResult::String("hello".to_string()));
    }

    pub fn bench_serialize_bool_col(&self) {
        serialize_result(DeciResult::Column(vec![DeciResult::Boolean(true); 10_000]));
    }

    pub fn bench_serialize_num_col(&self) {
        serialize_result(DeciResult::Column(vec![DeciResult::Fraction(1, 2); 10_000]));
    }

    pub fn bench_serialize_string_col(&self) {
        serialize_result(DeciResult::Column(vec![
            DeciResult::String(
                "hello".to_string()
            );
            10_000
        ]));
    }

    pub fn bench_deserialize_nothing(&self) {}

    pub fn bench_deserialize_bool(&self) {
        let serialized = create_serialized_result(vec![0, 0, 1], vec![0]);
        deserialize_result(serialized).unwrap();
    }

    pub fn bench_deserialize_number(&self) {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
        );
        deserialize_result(serialized).unwrap();
    }

    pub fn bench_deserialize_string(&self) {
        let serialized = create_serialized_result(vec![3, 0, 13], b"Hello, world!".to_vec());
        deserialize_result(serialized).unwrap();
    }

    pub fn bench_deserialize_bool_col(&self) {
        // A lot of our benchmarking may just be testing how quickly Rust can make this...
        let type_vec: Vec<u64> = vec![4, 1, 4]
            .into_iter()
            .chain((0..10_000).flat_map(|i| vec![0, i, 1]))
            .collect();
        let serialized = create_serialized_result(type_vec, vec![1; 10_000]);
        deserialize_result(serialized).unwrap();
    }

    pub fn bench_deserialize_num_col(&self) {
        let type_vec: Vec<u64> = vec![4, 1, 3]
            .into_iter()
            .chain((0..10_000).flat_map(|i| vec![1, i, 16]))
            .collect();
        let data = vec![1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0].repeat(10_000);
        let serialized = create_serialized_result(type_vec, data);
        deserialize_result(serialized).unwrap();
    }

    pub fn bench_deserialize_string_col(&self) {
        let type_vec: Vec<u64> = vec![4, 1, 3]
            .into_iter()
            .chain((0..10_000).flat_map(|i| vec![3, i * 5, 5]))
            .collect();
        let data = b"hello".to_vec();
        let serialized = create_serialized_result(type_vec, data);
        deserialize_result(serialized).unwrap();
    }

    /*
     * Takes the raw string of CSV, coherses it and stores the type in WASM.
     * It then returns the IDs of the columns or an error.
     */

    pub fn get_slice(&mut self, id: String, start: i64, end: i64) -> Option<Object> {
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

        assert!(start_usize <= end_usize);

        Some(serialize_result(DeciResult::Column(
            number_column[start_usize..end_usize].to_vec(),
        )))
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

    fn get_value(&self, id: String) -> Result<DeciResult, ComputeErrors> {
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
    pub fn sum(&self, id: String) -> Object {
        let column: DeciResult = self.get_value(id).expect("should have ID in values");

        serialize_result(column.sum_frac())
    }

    pub fn min(&self, id: String) -> Object {
        let column: DeciResult = self.get_value(id).expect("should have ID in values");

        serialize_result(column.min_val())
    }

    pub fn max(&self, id: String) -> Object {
        let column: DeciResult = self.get_value(id).expect("should have ID in values");

        serialize_result(column.max_val())
    }

    pub fn average(&self, id: String) -> Object {
        let column: DeciResult = self.get_value(id).expect("should have ID in values");

        serialize_result(column.mean())
    }

    pub fn median(&self, id: String) -> Object {
        let column: DeciResult = self.get_value(id).expect("should have ID in values");

        let mut s = SortedColumn::new(column);
        s.sort_and_save();
        serialize_result(s.median())
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
    println!("{}", my_deci.mask_with(my_deci.lt_num(5.0)).get_string());
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
