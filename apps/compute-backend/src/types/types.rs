use crate::types::ast::Node;
use chrono::NaiveDateTime;
use compute_backend_derive::suppress_derive_case_warnings;
use num_bigint::BigInt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

#[suppress_derive_case_warnings]
#[derive(PartialEq, Debug, Clone, Copy, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum DeciType {
    Number,
    String,
    Boolean,
    Column,
    Table,
    Date { specificity: DateSpecificity },
    Error,
}

impl DeciType {
    pub fn make_default(&self) -> DeciResult {
        match self {
            DeciType::Number => DeciResult::Fraction(0, 1),
            DeciType::String => String::new().into(),
            DeciType::Boolean => false.into(),
            DeciType::Column => DeciResult::Column(Vec::new()),
            DeciType::Table => DeciResult::Table(Table::default()),
            DeciType::Date { specificity } => DeciResult::Date(DeciDate(None, *specificity)),
            DeciType::Error => DeciResult::TypeError,
        }
    }
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

#[suppress_derive_case_warnings]
#[derive(PartialEq, Debug, Clone, Copy, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
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

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DeciDate(pub Option<NaiveDateTime>, pub DateSpecificity);

impl PartialOrd for DeciDate {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match (self.0, other.0) {
            (Some(a), Some(b)) => a.partial_cmp(&b),
            _ => None,
        }
    }
}

#[derive(Clone, Debug)]
pub enum DeciResult {
    Boolean(bool),
    String(String),
    Fraction(i64, i64),
    ArbitraryFraction(BigInt, BigInt),
    Column(Vec<DeciResult>),
    Date(DeciDate),
    Table(Table),
    Tree(Tree),
    Range(Vec<DeciResult>),
    Row(Row),
    TypeError,
    Pending,
    Function {
        name: String,
        argument_names: Vec<String>,
        body: Node,
    },
}
impl DeciResult {
    pub fn deci_type(&self) -> Option<DeciType> {
        Some(match self {
            DeciResult::Boolean(_) => DeciType::Boolean,
            DeciResult::String(_) => DeciType::String,
            DeciResult::Fraction(_, _) => DeciType::Number,
            DeciResult::ArbitraryFraction(_, _) => DeciType::Number,
            DeciResult::Column(_) => DeciType::Column,
            DeciResult::Date(DeciDate(_, specificity)) => DeciType::Date {
                specificity: *specificity,
            },
            DeciResult::Table(_) => DeciType::Table,
            DeciResult::Tree(_) => return None,
            DeciResult::Range(_) => return None,
            DeciResult::Row(_) => return None,
            DeciResult::TypeError => DeciType::Error,
            DeciResult::Pending => return None,
            DeciResult::Function { .. } => return None,
        })
    }
}

impl Into<DeciResult> for DeciDate {
    fn into(self) -> DeciResult {
        DeciResult::Date(self)
    }
}
