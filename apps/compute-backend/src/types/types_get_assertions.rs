use super::types::DeciResult;

impl DeciResult {
    pub fn as_column(&self) -> &Vec<DeciResult> {
        match self {
            DeciResult::Column(column) => column,
            _ => panic!("Should be column"),
        }
    }
}
