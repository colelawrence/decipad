use crate::{types::types::DeciType, DeciResult};
use compute_backend_derive::suppress_derive_case_warnings;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use super::FlatNode;

#[suppress_derive_case_warnings]
#[derive(PartialEq, Eq, Debug, Clone, Copy, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub enum Aggregations {
    #[serde(rename = "string:count")]
    #[serde(alias = "number:count-entries")]
    Count,
    #[serde(rename = "string:count-unique")]
    #[serde(alias = "number:count-unique")]
    CountUnique,

    #[serde(rename = "number:sum")]
    Sum,
    #[serde(rename = "number:max")]
    #[serde(alias = "date:latest")]
    Max,
    #[serde(rename = "number:min")]
    #[serde(alias = "date:earliest")]
    Min,
    #[serde(rename = "number:average")]
    Average,
    #[serde(rename = "number:median")]
    Median,
    #[serde(rename = "number:stddev")]
    StdDev,
    #[serde(rename = "number:span")]
    #[serde(alias = "date:span")]
    Span,
    #[serde(rename = "number:percent-of-total")]
    PercentOfTotal,

    #[serde(rename = "boolean:count-true")]
    CountTrue,
    #[serde(rename = "boolean:count-false")]
    CountFalse,
    #[serde(rename = "boolean:percent-true")]
    PercentTrue,
    #[serde(rename = "boolean:percent-false")]
    PercentFalse,

    #[serde(other)]
    Unknown,
}

impl Aggregations {
    pub fn aggregate<'a, I>(&self, nodes: I, parent: Option<I>) -> DeciResult
    where
        I: IntoIterator<
            Item = &'a FlatNode<'a>,
            IntoIter: Iterator<Item = I::Item> + ExactSizeIterator + Clone,
        >,
    {
        let n = nodes.into_iter();

        let values = |n: I::IntoIter| n.filter_map(|n| n.value);
        let count = |n: I::IntoIter| n.map(|v| v.size).sum::<usize>();
        let sum = |n: I::IntoIter| n.filter_map(|child| Some(child.value? * child.size)).sum();
        let mean = |n: I::IntoIter| sum(n.clone()) / (n.map(|v| v.size).sum::<usize>()).into();

        //let value_len = values.len();
        match self {
            Aggregations::Unknown => DeciResult::TypeError,

            // string/number aggregations
            // TODO: nicer Into impl here
            Aggregations::Count => (count(n) as f64).into(),
            Aggregations::CountUnique => (n.len() as f64).into(),

            // number aggregations
            Aggregations::Sum => sum(n),
            Aggregations::Max => values(n).max().cloned().unwrap_or(DeciResult::TypeError),
            Aggregations::Min => values(n).min().cloned().unwrap_or(DeciResult::TypeError),
            Aggregations::Average => mean(n),
            Aggregations::Median => {
                let count = count(n.clone());
                let is_even = count % 2 == 0;
                let mid = count / 2;
                let (median_a, median_b) = match is_even {
                    true => (mid - 1, mid),
                    false => (mid, mid),
                };

                let mut effective_idx = 0;
                let mut sum = None;

                let mut items = n
                    .map(|n| {
                        (
                            n.size,
                            n.value
                                .cloned()
                                .and_then(|v| v.try_coerce(DeciType::Number))
                                .unwrap_or_else(|| DeciType::Number.make_default()),
                        )
                    })
                    .collect::<Vec<_>>();
                items.sort_by(|(_, value), (_, value2)| value2.cmp(value));

                for (size, value) in items {
                    effective_idx += size;
                    match sum {
                        None => {
                            if effective_idx > median_a && sum.is_none() {
                                sum.replace(value);
                                if !is_even {
                                    break;
                                }
                            }
                        }
                        Some(ref mut sum) => {
                            if effective_idx > median_b {
                                *sum += value.clone();
                                break;
                            }
                        }
                    }
                }

                sum.map(|sum| match is_even {
                    true => sum / 2.0.into(),
                    false => sum,
                })
                .unwrap_or(DeciResult::TypeError)
            }
            Aggregations::StdDev => {
                let mean = mean(n.clone());
                let count = count(n.clone());

                let variance = n
                    .map(|n| {
                        (
                            n.size,
                            n.value
                                .cloned()
                                .and_then(|v| v.try_coerce(DeciType::Number))
                                .unwrap_or_else(|| DeciType::Number.make_default()),
                        )
                    })
                    .map(|(count, val)| {
                        let diff = mean.clone() - val;
                        (diff.clone() * diff) * count
                    })
                    .sum::<DeciResult>()
                    / count.into();

                // TODO: impl sqrt on fraction types
                variance
                    .as_f64()
                    .map(|v| v.sqrt().into())
                    .unwrap_or(DeciResult::TypeError)
            }
            Aggregations::Span => {
                let max = values(n.clone())
                    .max()
                    .cloned()
                    .unwrap_or(DeciResult::TypeError);
                let min = values(n).min().cloned().unwrap_or(DeciResult::TypeError);
                max - min
            }
            Aggregations::PercentOfTotal => 'arm: {
                let Some(parent) = parent else {
                    break 'arm DeciResult::TypeError;
                };
                let cur_sum = sum(n);
                let parent_sum = sum(parent.into_iter());

                cur_sum / parent_sum
            }

            // boolean aggregations
            Aggregations::CountTrue | Aggregations::CountFalse => {
                let falsey = matches!(self, Aggregations::CountFalse);
                n.filter(|n| matches!(n.value, Some(DeciResult::Boolean(true))) ^ falsey)
                    .map(|n| n.size)
                    .sum::<usize>()
                    .into()
            }
            Aggregations::PercentTrue | Aggregations::PercentFalse => {
                let falsey = matches!(self, Aggregations::CountFalse);
                DeciResult::from(
                    n.clone()
                        .filter(|n| matches!(n.value, Some(DeciResult::Boolean(true))) ^ falsey)
                        .map(|n| n.size)
                        .sum::<usize>(),
                ) / count(n).into()
            }
        }
    }
}
