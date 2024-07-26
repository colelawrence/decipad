use wasm_bindgen::prelude::*;

#[derive(PartialEq, Debug, Clone, Copy)]
#[wasm_bindgen]
pub enum DeciType {
    Number,
    String,
    Boolean,
    Column,
    Table,
}

#[derive(Clone, Debug)]
pub enum DeciResult {
    Boolean(bool),
    String(String),
    Fraction(i64, i64),
    Float(f64),
    Column(Vec<DeciResult>),
}
