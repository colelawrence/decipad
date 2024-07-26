use js_sys::{Object, Uint8Array};

use crate::DeciResult;
use wasm_bindgen_test::*;

pub fn dcolFromVec(input: Vec<i64>) -> DeciResult {
    DeciResult::Column(input.iter().map(|x| DeciResult::Float(*x as f64)).collect())
}

#[test]
fn test_results() {
    let res1 = DeciResult::Column(vec![
        dcolFromVec(vec![1, 2, 3]),
        dcolFromVec(vec![4, 5, 6]),
        dcolFromVec(vec![7, 8, 9]),
    ]);
    let res2 = DeciResult::Column(vec![
        dcolFromVec(vec![9, 8, 7]),
        dcolFromVec(vec![6, 5, 4]),
        dcolFromVec(vec![3, 2, 1]),
    ]);
    assert_eq!(
        res1.clone() * res2.clone(),
        DeciResult::Column(vec![
            dcolFromVec(vec![9, 16, 21]),
            dcolFromVec(vec![24, 25, 24]),
            dcolFromVec(vec![21, 16, 9]),
        ])
    );
    assert_eq!(
        res1 + res2,
        DeciResult::Column(vec![
            dcolFromVec(vec![10, 10, 10]),
            dcolFromVec(vec![10, 10, 10]),
            dcolFromVec(vec![10, 10, 10]),
        ])
    )
}

#[test]
fn test_reducers() {
    let res1 = DeciResult::Column(vec![
        dcolFromVec(vec![1, 2, 3]),
        dcolFromVec(vec![4, 5, 6]),
        dcolFromVec(vec![7, 8, 9]),
    ]);
    println!("mean: {}", res1.mean().get_string());
    println!("max: {}", res1.max_val().get_string());
    println!("min: {}", res1.min_val().get_string());
    println!("range: {}", res1.range().get_string());
}

#[test]
fn test_string() {
    let res1 = DeciResult::Column(vec![
        dcolFromVec(vec![1, 2, 3]),
        dcolFromVec(vec![4, 5, 6]),
        dcolFromVec(vec![7, 8, 9]),
    ]);
    println!("{}", res1.get_string());
}

pub fn sum_2d(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| {
                DeciResult::Column((1..x).map(|y| DeciResult::Fraction(y as i64, 1)).collect())
            })
            .collect(),
    );
    let decisum = res1.sum_frac();
    return false;
}

pub fn sum_1d(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Fraction(x as i64, 1))
            .collect(),
    );
    let decisum = res1.sum_frac();
    return false;
}

pub fn sum_reciprocals(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Fraction(1, x as i64))
            .collect(),
    );
    let decisum = res1.sum_frac();
    return false;
}

#[test]
pub fn print_test() {
    let dim: usize = 5;
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Column((1..x).map(|y| DeciResult::new_float(y as f64)).collect()))
            .collect(),
    );
    let decisum = res1.get_string();
    println!("{decisum}");
}
