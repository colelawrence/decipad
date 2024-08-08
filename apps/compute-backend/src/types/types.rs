use wasm_bindgen::prelude::*;
use chrono::NaiveDateTime;
use std::{collections::HashMap, io::ErrorKind};
use num_bigint::BigInt;

#[derive(PartialEq, Debug, Clone, Copy)]
#[wasm_bindgen]
pub enum DeciType {
    Number,
    String,
    Boolean,
    Column,
    Table,
}

#[derive(Clone, PartialEq, Debug, Default)]
pub struct Row {
    pub row_index_name: String,
    pub cells: HashMap<String, DeciResult>,
}

#[derive(Clone, PartialEq, Debug, Default)]
pub struct Table {
    pub index_name: Option<String>,
    pub delegates_index_to: Option<String>,
    pub column_names: Vec<String>,
    pub columns: Vec<Vec<DeciResult>>,
}


#[derive(Clone, PartialEq, Debug, Copy)]
pub enum DateSpecificity {
    None = 0,
    Year,
    Quarter,
    Month,
    Day,
    Hour,
    Minute,
    Second,
    Millisecond,
}

#[derive(Clone, Debug)]
pub enum DeciResult {
    Boolean(bool),
    String(String),
    Fraction(i64, i64),
    ArbitraryFraction(BigInt, BigInt),
    Float(f64),
    Column(Vec<DeciResult>),
    Date(Option<NaiveDateTime>, DateSpecificity),
    Table(Table),
    Range(Vec<DeciResult>),
    Row(Row),
    TypeError,
    Pending,
}