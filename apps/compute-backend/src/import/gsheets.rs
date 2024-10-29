use std::{
    collections::VecDeque,
    convert::TryInto as _,
    mem::{self, transmute, MaybeUninit},
};

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
    pub range: Option<((usize, usize), (usize, usize))>,
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
        let data: GSheetsData = serde_json::from_slice(from).map_err(|e| {
            log!("failed to parse gsheets json - {e:?}");
            ComputeErrors::InferError
        })?;

        // Safety: wrapping already init'ed values in MaybeUninit *should* be safe :)
        let mut values: Vec<VecDeque<MaybeUninit<serde_json::Value>>> =
            unsafe { transmute(data.values) };

        let major_size = values.len();
        let minor_size = values
            .iter()
            .map(|major| major.len())
            .max()
            .expect("minor size");

        let (col_take, col_skip) = self
            .range
            .map(|r| (r.1 .0 + 1, r.0 .0))
            .unwrap_or((major_size, 0));

        let (row_take, row_skip) = self
            .range
            .map(|r| {
                (
                    r.1 .1 + 1,
                    r.0 .1
                        + match self.is_first_header_row {
                            true => 1,
                            false => 0,
                        },
                )
            })
            .unwrap_or((
                minor_size,
                match self.is_first_header_row {
                    true => 1,
                    false => 0,
                },
            ));

        let headers: Vec<String> = match self.is_first_header_row {
            true => values
                .iter_mut()
                .take(col_take)
                .skip(col_skip)
                .enumerate()
                .map(|(i, rows)| {
                    rows.get_mut(row_skip - 1)
                        .map(|header| {
                            let header = mem::replace(header, MaybeUninit::uninit());
                            // Safety: since we transmute a fully initialized VecDeque into
                            // MaybeUninit<_>, and since we have yet to modify that VecDeque,
                            // we can safely assume init here
                            match unsafe { header.assume_init() } {
                                serde_json::Value::String(str) => str,
                                header => header.to_string(),
                            }
                        })
                        .and_then(|header| match header.trim().is_empty() {
                            true => None,
                            false => Some(header),
                        })
                        .unwrap_or_else(|| idx_to_alphabetic(i))
                })
                .collect(),
            false => (0..values.len()).map(idx_to_alphabetic).collect(),
        };

        Ok(values
            .into_iter()
            .take(col_take)
            .skip(col_skip)
            .zip(headers)
            .map(|(col, name)| {
                let col_len = col.len();
                let mut col_type = None;
                let values = col
                    .into_iter()
                    .take(row_take)
                    .skip(row_skip)
                    .map(|value| {
                        // Safety: AS LONG AS the skip/take above is correct
                        // (does not visit the headers we made uninit earlier):
                        // it's safe to assume init here
                        let value: Option<DeciResult> =
                            unsafe { value.assume_init() }.try_into().ok();
                        if let Some(kind) = value.as_ref().and_then(|v| v.deci_type()) {
                            if let Some(existing) = col_type.replace(kind) {
                                if existing != kind {
                                    //log!("non homogenous column {existing:?} / {kind:?}");
                                    col_type.replace(crate::types::types::DeciType::String);
                                }
                            }
                        }
                        value
                    })
                    .collect::<Vec<_>>();

                let col_type = col_type.unwrap_or(crate::types::types::DeciType::String);

                ImportColumn {
                    values: values
                        .into_iter()
                        .map(|result| {
                            let result = result.unwrap_or_else(|| col_type.make_default());
                            match options
                                .column_types
                                .as_ref()
                                .and_then(|types| types.get(&name))
                            {
                                Some(&desired_type) => result
                                    .try_coerce(desired_type)
                                    .unwrap_or(DeciResult::TypeError),
                                None => {
                                    result.try_coerce(col_type).unwrap_or(DeciResult::TypeError)
                                }
                            }
                        })
                        .chain(
                            (col_len..(row_take - row_skip))
                                .map(|_| DeciResult::String(String::new())),
                        )
                        .collect(),
                    name,
                }
            })
            .collect::<Vec<_>>())
    }
}
