use compute_backend_derive::suppress_derive_case_warnings;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use super::{Import, ImportOptions, ImportResult};

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Code {
    pub is_first_header_row: bool,
}
impl Import for Code {
    type From = [u8];

    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        todo!()
    }
}
