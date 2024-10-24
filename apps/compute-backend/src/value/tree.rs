use crate::types::types::DeciResult;

use super::{contiguous_slice::contiguous_slice, sorted_column::SortedColumn};

#[allow(unused)]
struct TreeNode {
    value: DeciResult,

    children: Vec<TreeNode>,
}

pub struct Tree {
    top_level_nodes: Vec<TreeNode>,
}

#[allow(unused)]
impl Tree {
    fn construct_node(result: &[DeciResult], start: usize, end: usize) -> Vec<TreeNode> {
        let column = &result[0].get_slice(start, end + 1);
        let mut sorted_column = SortedColumn::new(column.clone());
        let slices = contiguous_slice(sorted_column.get_sorted().as_column());

        let mut nodes: Vec<TreeNode> = slices
            .iter()
            .map(|(start, _)| TreeNode {
                value: sorted_column.get_sorted().as_column()[*start].clone(),
                children: vec![],
            })
            .collect();

        if result.len() == 1 {
            return nodes;
        }

        for index in 0..nodes.len() {
            let (s, e) = slices[index];
            nodes[index].children = Tree::construct_node(&result[1..], s + start, e + start);
        }

        nodes
    }

    fn construct_tree(&mut self, result: &DeciResult) {
        if result.as_column().is_empty() {
            return;
        }
        let column = &result.as_column()[0]; // <- index out of bounds: the len is 0 but the index is 0
        let mut sorted_column = SortedColumn::new(column.clone());

        let slices = contiguous_slice(sorted_column.get_sorted().as_column());

        let mut top_level_nodes: Vec<TreeNode> = slices
            .iter()
            .map(|(start, _)| TreeNode {
                value: sorted_column.get_sorted().as_column()[*start].clone(),
                children: vec![],
            })
            .collect();

        if result.as_column().len() == 1 {
            self.top_level_nodes = top_level_nodes;
            return;
        }

        let small_result = &result.as_column()[1..];

        for index in 0..top_level_nodes.len() {
            let (start, end) = slices[index];
            top_level_nodes[index].children = Tree::construct_node(small_result, start, end);
        }

        self.top_level_nodes = top_level_nodes;
    }

    pub fn new(columns: DeciResult) -> Tree {
        if let DeciResult::Column(columns_result) = &columns {
            for column in columns_result {
                match column {
                    DeciResult::Column(inner_column) => {
                        for item in inner_column {
                            match item {
                                DeciResult::Column(_) => panic!("Cannot go further bruh"),
                                _ => {}
                            }
                        }
                    }
                    _ => panic!("Column of columns only allowed"),
                }
            }

            let mut tree = Tree {
                top_level_nodes: vec![],
            };

            tree.construct_tree(&columns);

            tree
        } else {
            panic!("Needs to be column of results");
        }
    }
}

#[test]
fn tree_single_column() {
    let column = DeciResult::col_from_floats(vec![2.0, 1.0]);
    let column_of_columns = DeciResult::Column(vec![column.clone()]);

    let tree = Tree::new(column_of_columns);

    assert_eq!(tree.top_level_nodes.len(), 2);

    // Tests for sortedness
    assert_eq!(&column.as_column()[0], &tree.top_level_nodes[1].value);
    // assert!(column.as_column()[1].eq(&tree.top_level_nodes[0].value));
}

#[test]
fn tree_multiple_columns() {
    let column1 = DeciResult::col_from_floats([1.0, 2.0]);
    let column2 = DeciResult::col_from_floats([3.0, 4.0]);

    let column_of_columns = DeciResult::Column(vec![column1.clone(), column2.clone()]);

    let tree = Tree::new(column_of_columns);
    assert!(tree.top_level_nodes.len() == 2);

    assert!(column1.as_column()[0].eq(&tree.top_level_nodes[0].value));
    assert!(column1.as_column()[1].eq(&tree.top_level_nodes[1].value));

    let child1 = &tree.top_level_nodes[0].children;
    let child2 = &tree.top_level_nodes[1].children;

    assert!(child1.len() == 1);
    assert!(child2.len() == 1);

    assert_eq!(child1[0].value, 3.0.into());
    assert_eq!(child2[0].value, 4.0.into());
}

#[test]
fn tree_repeat_values() {
    let column1 = DeciResult::col_from_floats([1.0, 1.0, 2.0, 2.0, 2.0]);
    let column2 = DeciResult::col_from_floats([3.0, 4.0, 5.0, 6.0, 7.0]);

    let column_of_columns = DeciResult::Column(vec![column1.clone(), column2.clone()]);

    let tree = Tree::new(column_of_columns);
    assert!(tree.top_level_nodes.len() == 2);

    let child1 = &tree.top_level_nodes[0].children;
    let child2 = &tree.top_level_nodes[1].children;

    assert_eq!(child1.len(), 2);
    assert_eq!(child2.len(), 3);

    assert_eq!(child1[0].value, 3.0.into());
    assert_eq!(child1[1].value, 4.0.into());

    assert_eq!(child2[0].value, 5.0.into());
    assert_eq!(child2[1].value, 6.0.into());
    assert_eq!(child2[2].value, 7.0.into());
}

#[test]
fn tree_repeat_column_values() {
    let column1 = DeciResult::col_from_floats([1.0, 1.0, 2.0, 2.0, 2.0]);
    let column2 = DeciResult::col_from_floats([3.0, 3.0, 5.0, 5.0, 7.0]);

    let column_of_columns = DeciResult::Column(vec![column1.clone(), column2.clone()]);

    let tree = Tree::new(column_of_columns);
    assert!(tree.top_level_nodes.len() == 2);

    let child1 = &tree.top_level_nodes[0].children;
    let child2 = &tree.top_level_nodes[1].children;

    assert_eq!(child1.len(), 1);
    assert_eq!(child2.len(), 2);

    assert_eq!(child1[0].value, 3.0.into());

    assert_eq!(child2[0].value, 5.0.into());
    assert_eq!(child2[1].value, 7.0.into());
}

//
// 1 -> [3 -> [10, 20]];
// 2 -> [5 -> [40, 40], 7 -> [50]]
//

#[test]
fn tree_recursive_columns() {
    let column1 = DeciResult::col_from_floats([1.0, 1.0, 2.0, 2.0, 2.0]);
    let column2 = DeciResult::col_from_floats([3.0, 3.0, 5.0, 5.0, 7.0]);
    let column3 = DeciResult::col_from_floats([10.0, 20.0, 30.0, 40.0, 50.0]);

    let column_of_columns =
        DeciResult::Column(vec![column1.clone(), column2.clone(), column3.clone()]);

    let tree = Tree::new(column_of_columns);
    assert!(tree.top_level_nodes.len() == 2);

    let child1 = &tree.top_level_nodes[0].children;
    let child2 = &tree.top_level_nodes[1].children;

    assert_eq!(child1.len(), 1);
    assert_eq!(child2.len(), 2);

    assert_eq!(child1[0].value, 3.0.into());
    assert_eq!(child2[0].value, 5.0.into());
    assert_eq!(child2[1].value, 7.0.into());

    let nested_child1 = &child1[0].children; // [10, 20]

    assert_eq!(nested_child1.len(), 2);

    assert_eq!(nested_child1[0].value, 10.0.into());
    assert_eq!(nested_child1[1].value, 20.0.into());
}
