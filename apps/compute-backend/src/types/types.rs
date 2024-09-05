use chrono::NaiveDateTime;
use num_bigint::BigInt;
use std::collections::HashMap;
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

#[derive(Clone, PartialEq, Debug)]
pub struct TreeColumn {
    pub name: String,
    pub aggregation: Option<DeciResult>,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Tree {
    pub root: Box<DeciResult>,
    pub root_aggregation: Option<Box<DeciResult>>,
    pub original_cardinality: i64,
    pub children: Vec<Tree>,
    pub columns: Vec<TreeColumn>,
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
    Tree(Tree),
    Range(Vec<DeciResult>),
    Row(Row),
    TypeError,
    Pending,
}
