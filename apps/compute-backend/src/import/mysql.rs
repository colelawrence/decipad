use std::{
    collections::{BTreeMap, HashMap},
    convert::TryInto,
};

use compute_backend_derive::suppress_derive_case_warnings;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use crate::{log, types::types::DeciResult, ComputeErrors};

use super::{Import, ImportOptions, ImportResult};

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MySql {}

impl Import for MySql {
    type From = [u8];

    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        let cols = serde_json::from_slice::<IndexMap<String, Vec<serde_json::Value>>>(from)
            .map_err(|e| {
                log!("failed to parse json - {e:?}");
                ComputeErrors::InferError
            })?;

        Ok(cols
            .into_iter()
            .map(|(name, values)| {
                let mut col_type = None;
                let values = values
                    .into_iter()
                    .map(|val| match val {
                        serde_json::Value::Null => None,
                        val => {
                            let val = val.try_into().unwrap_or(DeciResult::TypeError);
                            if let Some(dtype) = val.deci_type() {
                                col_type.replace(dtype);
                            }
                            Some(val)
                        }
                    })
                    .collect::<Vec<_>>();

                let col_type = col_type.unwrap_or(crate::types::types::DeciType::String);

                super::ImportColumn {
                    values: values
                        .into_iter()
                        .map(|res| {
                            let res = res.unwrap_or_else(|| col_type.make_default());
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
                }
            })
            .collect())
    }
}
impl TryInto<DeciResult> for serde_json::Value {
    // TODO: better errors here
    type Error = ();
    fn try_into(self) -> Result<DeciResult, Self::Error> {
        match self {
            serde_json::Value::Null => Err(()),
            serde_json::Value::Bool(b) => Ok(DeciResult::Boolean(b)),
            serde_json::Value::Number(f) => f.as_f64().map(Into::into).ok_or(()),
            serde_json::Value::String(s) => Ok(DeciResult::String(s)),
            serde_json::Value::Array(vals) => Ok(DeciResult::Column(
                vals.into_iter()
                    .map(|v| v.try_into().unwrap_or_else(|_| DeciResult::TypeError))
                    .collect::<Vec<_>>(),
            )),
            serde_json::Value::Object(_) => todo!("parse JSON object as DeciResult"),
        }
    }
}
