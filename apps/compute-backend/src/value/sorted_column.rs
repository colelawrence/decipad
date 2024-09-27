use crate::types::types::DeciResult;

struct IndexedDeciResult<'a>(usize, &'a DeciResult);

impl<'a> PartialEq for IndexedDeciResult<'a> {
    fn eq(&self, other: &Self) -> bool {
        let IndexedDeciResult(_, self_result) = self;
        let IndexedDeciResult(_, other_result) = other;

        return self_result == other_result;
    }
}

pub struct SortedColumn {
    column: DeciResult,
    sort_map: Option<Vec<usize>>,
    sorted_column: Option<DeciResult>,
}

impl SortedColumn {
    pub fn sort_and_save(&mut self) {
        let binding = self.column.clone();

        let mut cloned_column: Vec<(usize, &DeciResult)> =
            binding.as_column().iter().enumerate().collect();

        cloned_column.sort_by_key(|(_, result)| *result);

        self.sort_map = Some(cloned_column.iter().map(|(index, _)| *index).collect());

        let result_column: Vec<DeciResult> = cloned_column
            .iter()
            .map(|(_, result)| (*result).clone())
            .collect();

        self.sorted_column = Some(DeciResult::Column(result_column));
    }

    pub fn get_sorted(&mut self) -> DeciResult {
        if let Some(existing_sorted_column) = &self.sorted_column {
            existing_sorted_column.clone()
        } else {
            self.sort_and_save();
            self.sorted_column
                .clone()
                .expect("Should not be None, since sort_and_save was called.")
        }
    }

    pub fn get_sort_map(mut self) -> Vec<usize> {
        if let Some(sort_map) = self.sort_map {
            sort_map
        } else {
            self.sort_and_save();
            self.sort_map
                .expect("Should not be None, since sort_and_save was called")
        }
    }

    pub fn new(column: DeciResult) -> SortedColumn {
        SortedColumn {
            column,
            sorted_column: None,
            sort_map: None,
        }
    }

    pub fn median(&self) -> DeciResult {
        match &self.sorted_column {
            Some(item) => {
                let col = item.as_column();
                let l = item.len();
                if l % 2 == 0 {
                    (col[l / 2].clone() + col[(l - 2) / 2].clone()) * DeciResult::Fraction(1, 2)
                } else {
                    col[(l - 1) / 2].clone()
                }
            }
            None => DeciResult::String("You must sort_and_save() first".to_string()),
        }
    }
}

#[test]
fn test_sort_col() {
    let my_col = DeciResult::Column((1..20).map(|x| DeciResult::Fraction(1, x)).collect());
    let sorted = SortedColumn::new(my_col).get_sorted();
    match sorted {
        DeciResult::Column(items) => {
            for i in 1..items.len() {
                assert!(items[i - 1] <= items[i])
            }
        }
        _ => panic!("Should be a column"),
    }
}

#[test]
fn test_sort_map() {
    let my_col = DeciResult::col_from_floats([1.0, 5.0, 3.0, 4.0]);

    let sorted_column = SortedColumn::new(my_col);

    assert_eq!(sorted_column.get_sort_map(), vec![0, 2, 3, 1]);
}
