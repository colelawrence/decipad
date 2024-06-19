//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use compute_backend::ComputeBackend;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn simple_slice() {
    let mut compute = ComputeBackend::new();
    let float_arr = Float64Array::from(vec![1.0, 2.0, 3.0].as_slice());

    compute.insert_number_column("id".to_string(), &float_arr);
    let slice = compute.get_slice("id".to_string(), 0, 3);

    assert!(slice.is_some());

    let slice = slice.expect("Slice was not present");

    assert_eq!(slice, vec![1.0, 2.0, 3.0]);
}
