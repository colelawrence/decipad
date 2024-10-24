use std::{collections::VecDeque, convert::TryInto as _};

use compute_backend_derive::suppress_derive_case_warnings;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use crate::{log, types::types::DeciResult, ComputeErrors};

use super::{idx_to_alphabetic, Import, ImportColumn, ImportOptions, ImportResult};

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct GSheets {
    pub is_first_header_row: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
struct GSheetsData {
    values: Vec<VecDeque<serde_json::Value>>,
    major_dimension: String,
    range: String,
}

impl Import for GSheets {
    type From = [u8];

    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        let mut data: GSheetsData = serde_json::from_slice(from).map_err(|e| {
            log!("failed to parse gsheets json - {e:?}");
            ComputeErrors::InferError
        })?;

        let headers: Vec<String> = match self.is_first_header_row {
            true => data
                .values
                .iter_mut()
                .enumerate()
                .map(|(i, rows)| {
                    rows.pop_front()
                        .map(|header| match header {
                            serde_json::Value::String(str) => str,
                            _ => header.to_string(),
                        })
                        .unwrap_or_else(|| idx_to_alphabetic(i))
                })
                .collect(),
            false => (0..data.values.len())
                .into_iter()
                .map(idx_to_alphabetic)
                .collect(),
        };

        if headers.len() != data.values.len() {
            log!("not enough headers");
            return Err(ComputeErrors::InferError);
        }

        Ok(data
            .values
            .into_iter()
            .zip(headers.into_iter())
            .map(|(col, name)| ImportColumn {
                values: col
                    .into_iter()
                    .map(|value| value.try_into().unwrap_or(DeciResult::TypeError))
                    .map(|result| {
                        match options
                            .column_types
                            .as_ref()
                            .and_then(|types| types.get(&name))
                        {
                            Some(&desired_type) => result
                                .try_coerce(desired_type)
                                .unwrap_or(DeciResult::TypeError),
                            None => result,
                        }
                    })
                    .collect(),
                name,
            })
            .collect::<Vec<_>>())
    }
}
