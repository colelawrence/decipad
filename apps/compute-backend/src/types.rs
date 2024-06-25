use wasm_bindgen::prelude::*;

pub trait DeciCommon {
    fn get_frac(&self) -> (i64, i64);
    fn get_float(&self) -> f64;
    fn reduce(&mut self);
    fn to_frac(&self) -> DeciFrac;
    fn to_float(&self) -> DeciFloat;
}

#[derive(Debug, PartialEq, Copy, Clone)]
pub struct DeciFloat {
    pub val: f64,
    pub inf: bool,
    pub und: bool,
}

#[derive(Debug, PartialEq, Copy, Clone)]
pub struct DeciFrac {
    pub n: i64,
    pub d: i64,
    pub inf: bool,
    pub und: bool,
}

#[derive(Debug, PartialEq)]
pub enum NCol {
    FracCol(Vec<DeciFrac>),
    FloatCol(Vec<DeciFloat>),
}

// Results | Extract into seperate file
#[derive(Debug, PartialEq)]
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
