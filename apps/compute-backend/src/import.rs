use crate::{
    internal_parse_csv, log,
    types::types::{DeciResult, DeciType},
    ComputeBackend,
};
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Copy, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Importer {
    #[serde(rename_all = "camelCase")]
    Csv { is_first_header_row: bool },
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

fn type_to_kind(res: &DeciResult) -> Kind {
    match res {
        DeciResult::Boolean(_) => Kind::Boolean,
        DeciResult::String(_) => Kind::String,
        DeciResult::Fraction(_, _) => Kind::Number,
        DeciResult::ArbitraryFraction(_, _) => Kind::Number,
        DeciResult::Column(item) => type_to_kind(&item[0]),
        DeciResult::Date(_, _) => Kind::Date,
        DeciResult::Table(_) => todo!(),
        DeciResult::Tree(_) => todo!(),
        DeciResult::Range(_) => todo!(),
        DeciResult::Row(_) => todo!(),
        DeciResult::TypeError => Kind::Error,
        DeciResult::Pending => todo!(),
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
        options: Importer,
        types: Option<Vec<DeciType>>,
    ) -> Vec<ColumnRef> {
        let Importer::Csv {
            is_first_header_row,
        } = options;
        log!("importing external data! {}", data.len());
        let csv: String = String::from_utf8(data.to_vec()).expect("valid utf8");
        let (col_names, csv_cols) = internal_parse_csv(&csv, is_first_header_row, types).unwrap();
        let mut column_refs = Vec::with_capacity(col_names.len());
        for (col, name) in csv_cols.into_iter().zip(col_names.into_iter()) {
            let current_key = self
                .sequence
                .next()
                .expect("next random number must exist")
                .to_string();
            column_refs.push(ColumnRef {
                id: current_key.clone(),
                name,
                column_type: type_to_kind(&col),
            });
            self.values.insert(current_key, col);
        }
        return column_refs;
    }

    pub fn release_external_data(&mut self, id: String) {
        self.values.remove(&id);
    }
}
