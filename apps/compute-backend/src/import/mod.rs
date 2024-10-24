use std::collections::HashMap;

use crate::{
    log,
    types::types::{DeciResult, DeciType},
    ComputeBackend, ComputeErrors,
};
use compute_backend_derive::suppress_derive_case_warnings;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

mod code;
pub use code::*;

mod csv;
pub use csv::*;

mod mysql;
pub use mysql::*;

mod gsheets;
pub use gsheets::*;

mod notion;
pub use notion::*;

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Importer {
    Csv(Csv),
    Code(Code),
    MySql(MySql),
    Notion(Notion),
    GSheets(GSheets),
}

#[derive(Clone, Debug)]
pub struct ImportColumn {
    pub name: String,
    pub values: Vec<DeciResult>,
}
pub type ImportResult = Result<Vec<ImportColumn>, ComputeErrors>;

impl Import for Importer {
    type From = [u8];
    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        match self {
            Importer::Csv(inner) => inner.import(from, options),
            Importer::Code(inner) => inner.import(from, options),
            Importer::MySql(inner) => inner.import(from, options),
            Importer::Notion(inner) => inner.import(from, options),
            Importer::GSheets(inner) => inner.import(from, options),
        }
    }
}

pub trait Import {
    type From: ?Sized;
    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult;
}

#[suppress_derive_case_warnings]
#[derive(Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct ImportOptions {
    #[tsify(type = "Record<string, DeciType | undefined> | undefined")]
    pub column_types: Option<HashMap<String, DeciType>>,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Kind {
    Number,
    String,
    Boolean,
    Date,
    Error,
}
impl DeciResult {
    pub fn kind(&self) -> Option<Kind> {
        Some(match self {
            DeciResult::Boolean(_) => Kind::Boolean,
            DeciResult::String(_) => Kind::String,
            DeciResult::Fraction(_, _) => Kind::Number,
            DeciResult::ArbitraryFraction(_, _) => Kind::Number,
            DeciResult::Date(_) => Kind::Date,
            DeciResult::TypeError => Kind::Error,
            _ => return None,
        })
    }
}

#[wasm_bindgen(getter_with_clone)]
pub struct ColumnRef {
    pub id: String,
    pub name: String,
    pub column_type: Kind,
}

#[wasm_bindgen]
impl ComputeBackend {
    pub fn import_external_data_from_u8_arr(
        &mut self,
        data: &[u8],
        importer: Importer,
        options: ImportOptions,
    ) -> Vec<ColumnRef> {
        let result = importer.import(data, &options).unwrap_or_else(|err| {
            log!("error importing {importer:?} - {err:?}");
            unreachable!("FIXME: error handling");
        });

        let column_refs = result.into_iter().map(|col| {
            let id = self
                .sequence
                .next()
                .expect("next random number must exist")
                .to_string();
            let column_type = col
                .values
                .first()
                .and_then(DeciResult::kind)
                .unwrap_or(Kind::String);
            self.values
                .insert(id.clone(), DeciResult::Column(col.values));
            ColumnRef {
                id,
                name: col.name,
                column_type,
            }
        });

        column_refs.collect()
    }

    pub fn release_external_data(&mut self, id: String) {
        self.values.remove(&id);
    }
}

pub fn idx_to_alphabetic(mut idx: usize) -> String {
    idx += 1;
    let mut s = String::with_capacity(idx / 26);
    while idx > 0 {
        idx -= 1;
        let c = (idx % 26) as u8;
        s.push((b'A' + c) as char);
        idx /= 26;
    }
    s.chars().rev().collect()
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn check_idx_to_alphabetic() {
        assert_eq!(idx_to_alphabetic(0), "A");
        assert_eq!(idx_to_alphabetic(1), "B");
        assert_eq!(idx_to_alphabetic(25), "Z");
        assert_eq!(idx_to_alphabetic(26), "AA");
        assert_eq!(idx_to_alphabetic(27), "AB");
        assert_eq!(idx_to_alphabetic(30), "AE");
    }
}
