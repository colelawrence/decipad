use std::collections::BTreeMap;

use compute_backend_derive::suppress_derive_case_warnings;
use js_sys::wasm_bindgen;

use crate::deci_result::{deserialize_result, serialize_result};

use super::types::{DeciResult, Table, Tree, TreeColumn};
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

mod aggregations;
pub use aggregations::*;

#[derive(Default, Debug)]
pub(super) struct Node<'a> {
    value: Option<&'a DeciResult>,
    size: usize,
    children: BTreeMap<String, Node<'a>>,
}

#[derive(Default, Clone, Debug)]
pub(super) struct LayerTree<'a> {
    layers: Vec<Vec<FlatNode<'a>>>,
}

#[derive(Default, Clone, Debug)]
pub struct FlatNode<'a> {
    value: Option<&'a DeciResult>,
    size: usize,
    root_aggregation: Option<DeciResult>,
    aggregations: Vec<Option<DeciResult>>,
    parent: Option<usize>,
    children: Option<(usize, usize)>,
}

impl<'a> LayerTree<'a> {
    pub fn layer(&self, height: usize) -> Option<&[FlatNode<'a>]> {
        self.layers.get(height).map(|l| l.as_slice())
    }
    pub fn layer_mut(&mut self, height: usize) -> Option<&mut Vec<FlatNode<'a>>> {
        self.layers.get_mut(height)
    }

    #[allow(unused)]
    pub fn node(&self, height: usize, idx: usize) -> Option<&FlatNode<'a>> {
        self.layer(height).and_then(|l| l.get(idx))
    }
    pub fn node_mut(&mut self, height: usize, idx: usize) -> Option<&mut FlatNode<'a>> {
        self.layer_mut(height).and_then(|l| l.get_mut(idx))
    }

    pub fn layers(&self) -> impl ExactSizeIterator<Item = &[FlatNode]> {
        self.layers.iter().map(|l| l.as_slice())
    }
    #[allow(unused)]
    pub fn layers_mut(&mut self) -> impl ExactSizeIterator<Item = &mut [FlatNode<'a>]> {
        self.layers.iter_mut().map(|l| l.as_mut_slice())
    }

    fn to_recursive_inner(
        table: &Table,
        layers: &[Vec<FlatNode>],
        node_pos: (usize, usize),
    ) -> Tree {
        let node = &layers[node_pos.0][node_pos.1];
        Tree {
            root_aggregation: node.root_aggregation.clone().map(|a| a.into()),
            root: node.value.cloned().unwrap_or_default().into(),
            original_cardinality: node.size as _,
            children: node
                .children
                .map(|children| {
                    (children.0..=children.1)
                        .map(|i| Self::to_recursive_inner(table, layers, (node_pos.0 + 1, i)))
                        .collect()
                })
                .unwrap_or_default(),
            columns: node
                .aggregations
                .iter()
                .enumerate()
                .map(|(i, agg)| TreeColumn {
                    name: table.column_names[node_pos.0 + 1 + i].clone(),
                    aggregation: agg.clone(),
                })
                .collect(),
        }
    }
    pub fn as_recursive(&self, table: &Table, root_aggregation: Vec<TreeColumn>) -> Tree {
        let layers = &self.layers;

        let children = (0..layers[0].len())
            .map(|i| Self::to_recursive_inner(table, layers, (0, i)))
            .collect();

        Tree {
            root_aggregation: None,
            // TODO: need Symbol('unknown') / undefined equivalent in DeciResult
            root: DeciResult::Pending.into(),
            original_cardinality: 1,
            children,
            columns: root_aggregation,
        }
    }

    fn recurse(&mut self, node: Node<'a>, height: usize, parent: Option<usize>) -> usize {
        let node_id = self.layer(height - 1).map(|l| l.len()).unwrap_or(0);

        let children = node
            .children
            .into_values()
            .map(|c| self.recurse(c, height + 1, Some(node_id)))
            .collect::<Vec<_>>();

        let mut last = None;
        for i in &children {
            if let Some(last) = last {
                if i - last != 1 {
                    panic!("non contiguous node children");
                }
            }
            last = Some(i);
        }

        if height > 0 {
            let children = match children.is_empty() {
                true => None,
                false => Some((children[0], children[children.len() - 1])),
            };

            let layer = match self.layer_mut(height - 1) {
                Some(layer) => layer,
                None => {
                    for _ in self.layers.len()..height {
                        self.layers.push(Vec::new());
                    }
                    self.layer_mut(height - 1)
                        .expect("should have pushed new layer")
                }
            };
            layer.push(FlatNode {
                value: node.value,
                size: node.size,
                aggregations: Vec::new(),
                root_aggregation: None,
                parent,
                children,
            });
            return layer.len() - 1;
        }
        0
    }

    pub fn from_recursive(root: Node<'a>) -> Self {
        let mut tree = Self { layers: vec![] };
        tree.recurse(root, 0, None);
        tree
    }
}

type AggList = Vec<Option<Aggregations>>;
impl Tree {
    pub fn new(table: Table, aggregations: AggList) -> anyhow::Result<Self> {
        if table.columns.is_empty() {
            return Ok(Self {
                columns: vec![],
                root: DeciResult::Pending.into(),
                children: vec![],
                root_aggregation: None,
                original_cardinality: 0,
            });
        }
        let height = table.columns[0].len();

        let mut root = Node::default();

        for y in 0..height {
            let mut cur = &mut root;
            for x in 0..table.columns.len() {
                let value = table.columns.get(x).and_then(|c| c.get(y));

                let cell = value
                    .map(|v| {
                        v.clone()
                            .try_coerce(crate::types::types::DeciType::String)
                            .unwrap()
                            .get_string()
                    })
                    .unwrap_or_else(|| "FIXME".into());
                cur = cur.children.entry(cell).or_default();
                cur.value = value;
                cur.size += 1;
            }
        }

        //log!("------------");
        //log!("root:\n{root:#?}");
        //let tree = Self::recurse(&agg, &root, 0);
        let mut tree = LayerTree::from_recursive(root);
        //log!("flattened:\n{tree:#?}");

        for height in 0..tree.layers.len() {
            //let agg = agg.get(height).copied().flatten();
            let Some(layer_size) = tree.layer(height).map(|l| l.len()) else {
                continue;
            };

            let mut aggregated = Vec::with_capacity(aggregations.len());
            for node_idx in 0..layer_size {
                if let Some(Some(agg)) = aggregations.get(height) {
                    let layer = tree.layer(height).unwrap();
                    let node = tree.node(height, node_idx).unwrap();
                    let parent = node
                        .parent
                        .and_then(|p| tree.node(height.checked_sub(1)?, p)?.children)
                        .map(|range| &layer[range.0..=range.1])
                        .or(Some(layer));

                    let root_aggregation = agg.aggregate(&layer[node_idx..=node_idx], parent);
                    let node = tree.node_mut(height, node_idx).unwrap();
                    node.root_aggregation.replace(root_aggregation);
                }

                let node = tree.node(height, node_idx).unwrap();

                let Some(mut next_range) = node.children else {
                    continue;
                };
                //log!("====== node {node_idx}@{height}: \n- {node:#?}");
                for i in height + 1..aggregations.len() {
                    let agg = aggregations.get(i).copied().flatten();
                    //log!("== aggregation {i} - {agg:?}");
                    let Some(layer) = tree.layer(i) else {
                        continue;
                    };

                    let parent = node.parent.and_then(|parent| {
                        let layer = height.checked_sub(1)?;
                        let mut range = tree
                            .layer(layer)
                            .and_then(|layer| layer.get(parent))?
                            .children?;
                        //log!("finding column from parent's pov");
                        for i in layer..i {
                            //log!("{parent} @ {i}");
                            let layer = tree.layer(i)?;
                            //log!("({}..{})", range.0, range.1);
                            range.0 = layer
                                .get(range.0)
                                .and_then(|n| n.children)
                                .map(|c| c.0)
                                .unwrap_or(range.0);
                            range.1 = layer
                                .get(range.1)
                                .and_then(|n| n.children)
                                .map(|c| c.1)
                                .unwrap_or(range.1);
                            //log!("  --> ({}..{})", range.0, range.1);
                        }
                        Some(range)
                    });

                    let range = next_range;

                    next_range.0 = layer
                        .get(next_range.0)
                        .and_then(|n| n.children)
                        .map(|c| c.0)
                        .unwrap_or(next_range.0);
                    next_range.1 = layer
                        .get(next_range.1)
                        .and_then(|n| n.children)
                        .map(|c| c.1)
                        .unwrap_or(next_range.1);
                    //log!(" layer: {:#?}", tree.layer(i));
                    aggregated.push(agg.map(|agg| {
                        //log!(
                        //    "({}..{}): {agg:?} / parent: {parent:#?} \n",
                        //    range.0,
                        //    range.1,
                        //);
                        agg.aggregate(
                            &layer[range.0..=range.1],
                            parent.map(|r| &layer[r.0..=r.1]).or(Some(layer)),
                        )
                    }));

                    //log!(
                    //    "new range: ({}..{}) -> ({}..{})",
                    //    range.0,
                    //    range.1,
                    //    next_range.0,
                    //    next_range.1
                    //)
                }
                let node = tree.node_mut(height, node_idx).unwrap();
                node.aggregations.append(&mut aggregated);
            }
        }

        let root_aggregation = tree
            .layers()
            .zip(aggregations.iter())
            .map(|(layer, agg)| agg.map(|agg| agg.aggregate(layer, Some(layer))))
            .enumerate()
            .map(|(i, agg)| TreeColumn {
                name: table.column_names[i].clone(),
                aggregation: agg,
            })
            .collect();
        //log!("layers: {}", tree.layers().len());
        //log!("aggs: {}", aggregations.len());
        //log!("root_agg:\n{root_aggregation:#?}");
        let final_tree = tree.as_recursive(&table, root_aggregation);
        //log!("tree:\n{final_tree:#?}");
        Ok(final_tree)
    }
}

// Single child optimisation for aggregations
//  0  1  2  3
//           sum
//  ----------
//  a        |
//  -> b     |
//     -> c  |
//        -> d
//        -> e
//        -> f
//
//  the aggregation of col 3 from a's POV is the same as
//  the aggregation of col 3 from b's POV is the same as
//  etc. etc.
//
//

#[suppress_derive_case_warnings]
#[derive(PartialEq, Eq, Debug, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct TreeInput {
    pub aggregations: AggList,
}

use wasm_bindgen::prelude::*;
#[wasm_bindgen]
pub fn build_tree(table: js_sys::Object, input: TreeInput) -> Result<js_sys::Object, JsError> {
    let DeciResult::Table(table) = deserialize_result(table).unwrap() else {
        return Err(JsError::new("input to tree is not a table!"));
    };
    Ok(serialize_result(DeciResult::Tree(
        Tree::new(table, input.aggregations).unwrap(),
    )))
}
