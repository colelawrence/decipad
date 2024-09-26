// #![cfg(target_arch = "wasm32")]
extern crate wasm_bindgen_test;
use crate::types::DeciResult;
use js_sys::{BigUint64Array, Object, Uint8Array};
use wasm_bindgen::prelude::*;
#[cfg(test)]

mod serialize_result_tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_serialize_true() {
        let result = serialize_result(DeciResult::Boolean(true)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![0, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![1]);
    }
}
