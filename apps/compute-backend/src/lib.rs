use std::collections::HashMap;

use js_sys::Float64Array;
use num::integer::lcm;
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

// Results | Extract into seperate file

pub enum DeciValue {
    NumberColumn(Vec<f64>),
}

#[wasm_bindgen]
pub enum ComputeErrors {
    IncorrectType,
    UnknownId,
}

#[wasm_bindgen]
pub struct ComputeBackend {
    // TODO: Learn about life times for the `str` type.
    values: HashMap<String, DeciValue>,
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

        self.values.insert(id, DeciValue::NumberColumn(numbers));
    }

    pub fn get_slice(&mut self, id: String, start: i64, end: i64) -> Option<Vec<f64>> {
        let column = self.values.get(&id)?;
        let number_column = match column {
            DeciValue::NumberColumn(col) => col,
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
            DeciValue::NumberColumn(number_column) => Ok(number_column.iter().sum()),
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
