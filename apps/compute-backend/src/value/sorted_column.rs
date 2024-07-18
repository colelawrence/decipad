use crate::types::types::{DeciValue, NCol};

pub struct SortedColumn {
    column: DeciValue,
    sorted_column: Option<DeciValue>,
}

impl SortedColumn {
    fn sort_and_save(&mut self) {
        let mut cloned_column = self.column.clone();

        match &mut cloned_column {
            DeciValue::BooleanColumn(col) => col.sort(),
            DeciValue::NumberColumn(col) => match col {
                NCol::FracCol(ncol) => ncol.sort(),
                NCol::FloatCol(ncol) => ncol.sort(),
            },
            DeciValue::StringColumn(col) => col.sort(),
        };

        self.sorted_column = Some(cloned_column);
    }

    pub fn get_sorted(mut self) -> DeciValue {
        if let Some(existing_sorted_column) = self.sorted_column {
            existing_sorted_column
        } else {
            self.sort_and_save();
            self.sorted_column
                .expect("Should not be None after `sort_and_save` call.")
        }
    }

    pub fn new(column: DeciValue) -> SortedColumn {
        SortedColumn {
            column,
            sorted_column: None,
        }
    }
}

#[test]
fn sorted_simple() {
    let float_val = DeciValue::from_floats(vec![5.0, 4.0, 3.5, 4.5, 5.1, 4.9, 5.0]);
    let sorted_column = SortedColumn::new(float_val);

    let sorted_float_col = sorted_column.get_sorted();

    if let DeciValue::NumberColumn(NCol::FloatCol(floats)) = sorted_float_col {
        for i in 0..floats.len() - 1 {
            if floats[i] > floats[i + 1] {
                panic!("Column is not sorted");
            }
        }
    } else {
        panic!("sorted_float_col is not of the correct type");
    }
}

#[test]
fn sorted_fractions() {
    let float_val = DeciValue::from_fracs(vec![1, 5, 3], vec![2, 4, 5]);
    let sorted_column = SortedColumn::new(float_val);

    let sorted_float_col = sorted_column.get_sorted();

    if let DeciValue::NumberColumn(NCol::FracCol(fracs)) = sorted_float_col {
        for i in 0..fracs.len() - 1 {
            if fracs[i] > fracs[i + 1] {
                panic!("Column is not sorted");
            }
        }
    } else {
        panic!("sorted_float_col is not of the correct type");
    }
}
