use crate::types::types::DeciResult;

pub struct SortedColumn {
    column: DeciResult,
    sorted_column: Option<DeciResult>,
}

impl SortedColumn {
    fn sort_and_save(&mut self) {
        let mut cloned_column = self.column.clone();
        self.sorted_column = Some(cloned_column.sort());
    }

    pub fn get_sorted(mut self) -> DeciResult {
        if let Some(existing_sorted_column) = self.sorted_column {
            existing_sorted_column
        } else {
            self.sort_and_save();
            self.sorted_column
                .expect("Should not be None, since sort_and_save was called.")
        }
    }

    pub fn new(column: DeciResult) -> SortedColumn {
        SortedColumn {
            column,
            sorted_column: None,
        }
    }
}

#[test]
fn test_sort_col() {
    let mut myCol = DeciResult::Column((1..20).map(|x| DeciResult::Fraction(1, x)).collect());
    let sorted = SortedColumn::new(myCol).get_sorted();
    match sorted {
        DeciResult::Column(items) => {
            for i in 1..items.len() {
                assert!(items[i - 1] <= items[i])
            }
        }
        _ => panic!("Should be a column"),
    }
}
