use crate::types::types::DeciResult;

#[derive(Debug)]
pub enum FilteredColumnErrors {
    IncompatibleColumns,
}

pub struct FilteredColumn {
    column: DeciResult,
    mask: DeciResult,
    filtered_column: Option<DeciResult>,
}

impl FilteredColumn {
    fn set_filtered(&mut self) {
        self.filtered_column = Some(self.column.mask_with(self.mask.clone()));
    }

    pub fn get_filtered(&mut self) -> DeciResult {
        self.set_filtered();

        self.filtered_column
            .clone()
            .expect("Should not be None after set_filtered call")
    }

    pub fn new(
        column: DeciResult,
        mask: DeciResult,
    ) -> Result<FilteredColumn, FilteredColumnErrors> {
        if column.len() != mask.len() {
            Err(FilteredColumnErrors::IncompatibleColumns)
        } else {
            Ok(FilteredColumn {
                column,
                mask,
                filtered_column: None,
            })
        }
    }
}
