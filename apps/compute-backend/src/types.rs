use js_sys::{Array, BigInt64Array, Object};
use wasm_bindgen::{convert::WasmAbi, prelude::*};

pub trait DeciCommon {
    fn get_frac(&self) -> (i64, i64);
    fn get_float(&self) -> f64;
    fn reduce(&mut self);
    fn to_frac(&self) -> DeciFrac;
    fn to_float(&self) -> DeciFloat;
}

#[derive(Debug, Copy, Clone)]
pub struct DeciFloat {
    pub val: f64,
    pub inf: bool,
    pub und: bool,
}

#[derive(Debug, Copy, Clone)]
pub struct DeciFrac {
    pub n: i64,
    pub d: i64,
    pub inf: bool,
    pub und: bool,
}

#[derive(Debug, Clone)]
pub enum NCol {
    FracCol(Vec<DeciFrac>),
    FloatCol(Vec<DeciFloat>),
}

// Results | Extract into seperate file
#[derive(Debug, Clone)]
pub enum DeciValue {
    NumberColumn(NCol),
    BooleanColumn(Vec<bool>),
    StringColumn(Vec<String>),
}

#[derive(PartialEq, Debug, Clone, Copy)]
#[wasm_bindgen]
pub enum DeciType {
    Number,
    String,
    Boolean,
    Column,
    Table,
}
