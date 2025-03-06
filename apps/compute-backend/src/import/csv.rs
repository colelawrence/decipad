use compute_backend_derive::suppress_derive_case_warnings;
use csv::{Reader, StringRecord};
use js_sys::Object;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use crate::{
    deci_result::serialize_result,
    infer::infer_column,
    log,
    parse::ParsedColumn,
    types::types::{DeciDate, DeciResult, DeciType},
    ComputeErrors,
};

use super::{idx_to_alphabetic, Import, ImportColumn, ImportOptions, ImportResult};

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Csv {
    pub is_first_header_row: bool,
}

fn get_column_types(
    parsed_columns: &Vec<ParsedColumn>,
    import_options: &ImportOptions,
) -> Vec<DeciType> {
    parsed_columns
        .iter()
        .map(|col| {
            import_options
                .column_types
                .as_ref()
                .and_then(|t| t.get(&col.name).copied())
                .unwrap_or_else(|| infer_column(col).expect("to be defined"))
        })
        .collect::<Vec<_>>()
}

impl Csv {
    pub fn parse(
        &self,
        csv: impl AsRef<str>,
        import_options: &ImportOptions,
    ) -> Result<(Vec<String>, Vec<DeciResult>), ComputeErrors> {
        let csv = csv.as_ref();

        let parsed_csv = csv_to_parsed(&csv, self.is_first_header_row);
        let column_types = get_column_types(&parsed_csv, import_options);

        let mut injected_result_names: Vec<String> = Vec::new();
        let mut injested_result: Vec<DeciResult> = Vec::new();

        for (col, desired_type) in parsed_csv.into_iter().zip(column_types.into_iter()) {
            let coerced_column = match desired_type {
                DeciType::String | DeciType::Error => DeciResult::Column(
                    col.value
                        .into_iter()
                        .map(|x| DeciResult::String(x))
                        .collect(),
                ),
                DeciType::Number => DeciResult::Column(
                    col.value
                        .into_iter()
                        .map(|value| {
                            value
                                .trim()
                                .replace("r$", "")
                                .replace("R$", "")
                                .replace(['_', ' ', ',', '$', '£', '€'], "")
                                .parse::<f64>()
                                .map(|val| fraction::Fraction::from(val))
                                .map(|frac| {
                                    let (&num, &den) =
                                        (frac.numer().unwrap(), frac.denom().unwrap());
                                    match frac.sign() {
                                        Some(fraction::Sign::Minus) => {
                                            (-(num as i64), (den as i64))
                                        }
                                        _ => (num as i64, den as i64),
                                    }
                                })
                                .map(|(num, den)| DeciResult::Fraction(num, den))
                                .unwrap_or_else(|err| {
                                    log!("error parsing number: {err:?}");
                                    DeciResult::TypeError
                                })
                        })
                        .collect(),
                ),
                DeciType::Boolean => DeciResult::Column(
                    col.value
                        .into_iter()
                        .map(|mut value| {
                            value.make_ascii_lowercase();
                            DeciResult::Boolean(
                                value.parse::<bool>().expect("could not parse inferred col"),
                            )
                        })
                        .collect(),
                ),
                DeciType::Date { specificity } => {
                    log!("parsing a date");
                    let mut memo = None;
                    DeciResult::Column(
                        col.value
                            .into_iter()
                            .map(|value| {
                                let out = specificity
                                    .parse_str(value, &mut memo)
                                    .map(|date| (DeciDate(Some(date), specificity).into()))
                                    .unwrap_or_else(|_| DeciResult::TypeError);
                                out
                            })
                            .collect(),
                    )
                }
                DeciType::Column => unreachable!("can't coerce column type to column"),
                DeciType::Table => unreachable!("can't coerce column type to table"),
            };

            injected_result_names.push(col.name.clone());
            injested_result.push(coerced_column);
        }

        Ok((injected_result_names, injested_result))
    }
}

impl Import for Csv {
    type From = [u8];

    fn import(&self, from: &Self::From, options: &ImportOptions) -> ImportResult {
        let csv: String = String::from_utf8(from.to_vec()).expect("valid utf8");
        let (col_names, csv_cols) = self.parse(&csv, &options)?;
        Ok(csv_cols
            .into_iter()
            .zip(col_names.into_iter())
            .map(|(col, name)| {
                let DeciResult::Column(values) = col else {
                    unreachable!("expected column");
                };
                ImportColumn { name, values }
            })
            .collect())
    }
}

#[wasm_bindgen]
pub fn parse_csv(csv: String, is_first_header_row: bool) -> Object {
    let options = ImportOptions { column_types: None };

    let (_column_names, csv_columns) = Csv {
        is_first_header_row,
    }
    .parse(&csv, &options)
    .unwrap();

    serialize_result(DeciResult::Column(csv_columns))
}

fn get_headers(reader: &mut Reader<&[u8]>, is_first_header_row: bool) -> StringRecord {
    if is_first_header_row {
        return reader.headers().unwrap().clone();
    }

    let column_number = reader.headers().expect("Cannot find header row").len();

    StringRecord::from(
        (0..column_number)
            .into_iter()
            .map(|i| idx_to_alphabetic(i))
            .collect::<Vec<_>>(),
    )
}

pub fn csv_to_parsed(csv_string: &str, is_first_header_row: bool) -> Vec<ParsedColumn> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(is_first_header_row)
        .flexible(true)
        .from_reader(csv_string.as_bytes());

    let rows = reader.records().map(|row| row.unwrap()).collect::<Vec<_>>();

    let headers = &get_headers(&mut reader, is_first_header_row);
    let mut data: Vec<ParsedColumn> = vec![];

    for (i, header) in headers.iter().enumerate() {
        dbg!(i, &rows);
        data.push(ParsedColumn {
            name: header
                .trim()
                .chars()
                .filter(|c| c.is_alphabetic() || c.is_numeric())
                .collect(),
            value: rows
                .iter()
                .map(|row| row.get(i).expect("csv must be rectangular").to_string())
                .collect(),
        });
    }

    data
}

#[test]
fn test_simple_csv() {
    let csv = [
        "year,make,model,description",
        "1948,Porsche,356,Luxury sports car",
        "1967,Ford,Mustang fastback 1967,American car",
    ]
    .join("\n");

    let columns = csv_to_parsed(&csv, true);

    assert_eq!(columns[0].name, "year");
    assert_eq!(columns[1].name, "make");

    assert_eq!(columns[0].value, vec!["1948", "1967"]);
    assert_eq!(columns[1].value, vec!["Porsche", "Ford"]);
}

#[test]
fn test_non_rectangular_csv() {
    let csv = [
        "year,make,model,description",
        "1948,Porsche,356,",
        "1967,Ford,Mustang fastback 1967,description",
    ]
    .join("\n");

    let columns = csv_to_parsed(&csv, true);

    assert_eq!(columns[0].name, "year");
    assert_eq!(columns[1].name, "make");

    assert_eq!(columns[0].value, vec!["1948", "1967"]);
    assert_eq!(columns[1].value, vec!["Porsche", "Ford"]);
    assert_eq!(columns[2].value, vec!["356", "Mustang fastback 1967"]);
    assert_eq!(columns[3].value, vec!["", "description"]);
}

#[test]
fn test_without_first_header_row() {
    let csv = [
        "1948,Porsche,356,Luxury sports car",
        "1967,Ford,Mustang fastback 1967,American car",
    ]
    .join("\n");

    let columns = csv_to_parsed(&csv, false);

    assert_eq!(columns[0].name, "A");
    assert_eq!(columns[1].name, "B");

    assert_eq!(columns[0].value, vec!["1948", "1967"]);
    assert_eq!(columns[1].value, vec!["Porsche", "Ford"]);
}

#[test]
fn test_empty_csv_inference() {
    let first_column = ParsedColumn {
        name: "A".to_string(),
        value: vec![],
    };

    let column_types = get_column_types(&vec![first_column], &ImportOptions { column_types: None });

    assert_eq!(column_types.len(), 1);
    assert_eq!(column_types[0], DeciType::Number);
}
