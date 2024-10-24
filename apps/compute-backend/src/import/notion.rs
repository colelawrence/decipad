use std::{collections::HashMap, convert::TryInto as _};

use compute_backend_derive::suppress_derive_case_warnings;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use crate::{log, types::types::DeciResult};

use super::{Import, ImportOptions, ImportResult};

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Notion {}

pub type NotionData = HashMap<String, Vec<serde_json::Value>>;

impl Import for Notion {
    type From = [u8];

    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        let cols: NotionData = serde_json::from_slice(from).map_err(|e| {
            log!("failed to parse json: {e:?}");
            crate::ComputeErrors::InferError
        })?;
        Ok(cols
            .into_iter()
            .map(|(name, values)| super::ImportColumn {
                values: values
                    .into_iter()
                    .map(|val| val.try_into().unwrap_or(DeciResult::TypeError))
                    .map(|res| {
                        if let Some(&desired_type) =
                            options.column_types.as_ref().and_then(|c| c.get(&name))
                        {
                            //log!("trying to coerce {name:?} -> {desired_type:?}");
                            return res
                                .try_coerce(desired_type)
                                .unwrap_or(DeciResult::TypeError);
                        }
                        res
                    })
                    .collect(),
                name,
            })
            .collect())
    }
}
