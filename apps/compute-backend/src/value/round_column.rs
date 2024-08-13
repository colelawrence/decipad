use crate::types::types::DeciResult;

pub struct RoundColumn {
    column: DeciResult,
    round_column: Option<DeciResult>,
}

impl RoundColumn {
    fn round_and_save(&mut self) {
        let mut cloned = self.column.clone();
        cloned.round();
        self.round_column = Some(cloned);
    }

    pub fn get_rounded(&mut self) -> DeciResult {
        if let Some(existing_round_column) = &self.round_column {
            existing_round_column.clone()
        } else {
            self.round_and_save();
            self.round_column
                .clone()
                .expect("No error, since rounded above")
        }
    }
}
