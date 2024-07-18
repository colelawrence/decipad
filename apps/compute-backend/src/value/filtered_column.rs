use crate::types::types::{DeciFloat, DeciFrac, DeciValue, NCol};

#[derive(Debug)]
pub enum FilteredColumnErrors {
    IncompatibleColumns,
}

pub struct FilteredColumn {
    column: DeciValue,
    mask: Vec<bool>,
    filtered_column: Option<DeciValue>,
}

impl FilteredColumn {
    // TODO:
    //
    // This can very easily be a macro on `DeciValue` type.
    // But we'll get to that problem at some point.
    fn set_filtered(&mut self) {
        self.filtered_column = Some(match &self.column {
            DeciValue::NumberColumn(col) => match col {
                NCol::FracCol(ncol) => {
                    let mut frac_col: Vec<DeciFrac> = Vec::new();
                    for i in 0..self.mask.len() {
                        if self.mask[i] {
                            frac_col.push(ncol[i])
                        }
                    }
                    DeciValue::NumberColumn(NCol::FracCol(frac_col))
                }
                NCol::FloatCol(ncol) => {
                    let mut float_col: Vec<DeciFloat> = Vec::new();
                    for i in 0..self.mask.len() {
                        if self.mask[i] {
                            float_col.push(ncol[i])
                        }
                    }
                    DeciValue::NumberColumn(NCol::FloatCol(float_col))
                }
            },
            DeciValue::BooleanColumn(col) => {
                let mut boolean_col: Vec<bool> = Vec::new();
                for i in 0..self.mask.len() {
                    if self.mask[i] {
                        boolean_col.push(col[i])
                    }
                }
                DeciValue::BooleanColumn(boolean_col)
            }
            DeciValue::StringColumn(col) => {
                let mut string_col: Vec<String> = Vec::new();
                for i in 0..self.mask.len() {
                    if self.mask[i] {
                        string_col.push(col[i].clone())
                    }
                }
                DeciValue::StringColumn(string_col)
            }
        });
    }

    pub fn get_filtered(&mut self) -> DeciValue {
        self.set_filtered();

        self.filtered_column
            .clone()
            .expect("Should be set after using `set_filtered`")
    }

    pub fn new(column: DeciValue, mask: Vec<bool>) -> Result<FilteredColumn, FilteredColumnErrors> {
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

#[test]
fn filtered_simple() {
    let float_val = DeciValue::from_floats(vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]);
    let mask = vec![false, false, true, true, false, true, true, false, true];

    let mut filtered = FilteredColumn::new(float_val, mask).unwrap();

    assert_eq!(
        filtered.get_filtered(),
        DeciValue::from_floats(vec![3.0, 4.0, 6.0, 7.0, 9.0])
    );
}
