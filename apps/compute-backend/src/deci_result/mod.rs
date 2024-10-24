// #![cfg(target_arch = "wasm32")]
extern crate wasm_bindgen_test;
use crate::types::types::{DateSpecificity, DeciDate, Row, Table, Tree, TreeColumn};
use crate::DeciResult;
use chrono::NaiveDateTime;
use compute_backend_derive::suppress_derive_case_warnings;
use js_sys::{BigUint64Array, Object, Uint8Array};
use num_bigint::{BigInt, ToBigInt};
use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};
use serde_json;
use std::mem::size_of;
use std::{collections::HashMap, io::ErrorKind};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

pub mod coerce;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct SerializedResult {
    type_array: BigUint64Array,
    data: Uint8Array,
}

#[wasm_bindgen]
impl SerializedResult {
    #[wasm_bindgen(constructor)]
    pub fn new(type_array: BigUint64Array, data: Uint8Array) -> SerializedResult {
        SerializedResult { type_array, data }
    }

    #[wasm_bindgen(getter)]
    pub fn type_array(&self) -> BigUint64Array {
        self.type_array.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> Uint8Array {
        self.data.clone()
    }
}

#[suppress_derive_case_warnings]
#[derive(Copy, Clone, Debug, Serialize, Deserialize, Tsify)]
#[repr(u64)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ResultType {
    Boolean = 0,
    Fraction = 1,
    String = 2,
    Column = 3,
    Date = 4,
    Table = 5,
    Range = 6,
    Row = 7,
    TypeError = 8,
    Pending = 9,
    ArbitraryFraction = 10,
    Tree = 11,
    Function = 12,
    Undefined = 13,
}

pub fn encode_big_int(buffer: &mut Vec<u8>, original_offset: usize, value: &BigInt) -> usize {
    let offset = original_offset + size_of::<u32>();
    let bytes = value.to_signed_bytes_le();
    let len = bytes.len() as u32;

    buffer.push((len) as u8);
    buffer.push((len >> 8) as u8);
    buffer.push((len >> 16) as u8);
    buffer.push((len >> 24) as u8);

    bytes.iter().for_each(|byte| buffer.push(*byte));

    offset + len as usize
}

pub fn decode_big_int(buffer: &Uint8Array, mut offset: usize) -> (BigInt, usize) {
    let length = u32::from_le_bytes([
        buffer.get_index(offset as u32) as u8,
        buffer.get_index((offset + 1) as u32) as u8,
        buffer.get_index((offset + 2) as u32) as u8,
        buffer.get_index((offset + 3) as u32) as u8,
    ]) as usize;
    offset += 4;
    let mut vec = Vec::with_capacity(length);
    for i in 0..length {
        vec.push(buffer.get_index((offset + i) as u32) as u8);
    }
    offset += length;
    let value = BigInt::from_signed_bytes_le(&vec);
    (value, offset)
}

pub fn js_to_rust_serialized_result(value: &JsValue) -> Result<SerializedResult, JsValue> {
    // Check if the value is an object
    if !value.is_object() {
        return Err(JsValue::from_str("Input is not an object"));
    }

    // Get the 'type' property
    let type_array = js_sys::Reflect::get(value, &JsValue::from_str("type"))?;
    if !type_array.is_instance_of::<BigUint64Array>() {
        return Err(JsValue::from_str("'type' is not a BigUint64Array"));
    }
    let type_array = type_array.dyn_into::<BigUint64Array>()?;

    // Get the 'data' property
    let data = js_sys::Reflect::get(value, &JsValue::from_str("data"))?;
    if !data.is_instance_of::<Uint8Array>() {
        return Err(JsValue::from_str("'data' is not a Uint8Array"));
    }
    let data = data.dyn_into::<Uint8Array>()?;

    // Create and return the SerializedResult
    Ok(SerializedResult::new(type_array, data))
}

pub fn serialize_result_iter(
    results: &[Option<DeciResult>],
    type_array: &mut Vec<usize>,
    data_array: &mut Vec<u8>,
    data_length: &mut usize,
) -> Result<(), ErrorKind> {
    let mut next_results: Vec<Option<DeciResult>> = Vec::new();

    let initial_type_array_length = type_array.len();
    for result_option in results {
        if result_option.is_none() {
            type_array.extend_from_slice(&[ResultType::Undefined as usize, 0, 0]);
            continue;
        }
        let result = result_option.clone().unwrap();
        match result {
            DeciResult::Boolean(value) => {
                data_array.push(if value { 1 } else { 0 });
                type_array.extend_from_slice(&[
                    ResultType::Boolean as usize,
                    *data_length as usize,
                    1,
                ]);
                *data_length += 1;
            }
            DeciResult::Fraction(n, d) => {
                data_array.extend_from_slice(&n.to_le_bytes());
                data_array.extend_from_slice(&d.to_le_bytes());
                type_array.extend_from_slice(&[
                    ResultType::Fraction as usize,
                    *data_length as usize,
                    16,
                ]);
                *data_length += 16;
            }

            DeciResult::ArbitraryFraction(n, d) => {
                let numerator_offset = encode_big_int(data_array, *data_length, &n);
                let denominator_offset = encode_big_int(data_array, numerator_offset, &d);
                let length = denominator_offset - *data_length;

                type_array.extend_from_slice(&[
                    ResultType::ArbitraryFraction as usize,
                    *data_length as usize,
                    length,
                ]);
                *data_length += length;
            }

            DeciResult::String(value) => {
                let bytes = value.as_bytes();
                data_array.extend_from_slice(bytes);
                type_array.extend_from_slice(&[
                    ResultType::String as usize,
                    *data_length as usize,
                    bytes.len() as usize,
                ]);
                *data_length += bytes.len();
            }
            DeciResult::Date(DeciDate(date, specificity)) => {
                data_array.extend_from_slice(&[specificity as u8]);

                let mut length = 1;
                if let Some(date) = date {
                    let ms: i64 = date.and_utc().timestamp_millis();
                    data_array.extend_from_slice(&ms.to_le_bytes());
                    length += 8;
                }

                type_array.extend_from_slice(&[
                    ResultType::Date as usize,
                    *data_length as usize,
                    length,
                ]);

                *data_length += length;
            }
            DeciResult::Column(values) => {
                type_array.extend_from_slice(&[
                    ResultType::Column as usize,
                    0, // Placeholder value
                    values.len(),
                ]);

                for value in values {
                    next_results.push(Some(value.clone()));
                }
            }
            DeciResult::Range(range_values) => {
                type_array.extend_from_slice(&[
                    ResultType::Range as usize,
                    *data_length as usize,
                    32, // Fixed length for Range (2 * 16 bytes for two DeciNumbers)
                ]);
                *data_length += 32;

                if range_values.len() != 2 {
                    return Err(ErrorKind::InvalidData);
                }

                for value in range_values {
                    match value {
                        DeciResult::Fraction(n, d) => {
                            data_array.extend_from_slice(&n.to_le_bytes());
                            data_array.extend_from_slice(&d.to_le_bytes());
                        }
                        _ => return Err(ErrorKind::InvalidData),
                    }
                }
            }

            DeciResult::Table(table) => {
                type_array.extend_from_slice(&[
                    ResultType::Table as usize,
                    0, // placeholder value
                    table.columns.len() as usize,
                ]);

                if let Some(index_name) = &table.index_name {
                    next_results.push(Some(DeciResult::String(index_name.clone())));
                } else {
                    next_results.push(Some(DeciResult::Column(Vec::new())));
                }

                if let Some(delegates_index_to) = &table.delegates_index_to {
                    next_results.push(Some(DeciResult::String(delegates_index_to.clone())));
                } else {
                    next_results.push(Some(DeciResult::Column(Vec::new())));
                }

                for name in &table.column_names {
                    next_results.push(Some(DeciResult::String(name.clone())));
                }
                for column in &table.columns {
                    next_results.push(Some(DeciResult::Column(column.clone())));
                }
            }

            DeciResult::Tree(tree) => {
                type_array.extend_from_slice(&[
                    ResultType::Tree as usize,
                    0, // placeholder value
                    5 + 2 * tree.columns.len() + tree.children.len(),
                ]);

                // Serialize root
                next_results.push(Some(*tree.root.clone()));

                // Serialize root aggregation
                next_results.push(
                    tree.root_aggregation
                        .as_ref()
                        .map(|boxed| (**boxed).clone()),
                );

                // Serialize original cardinality
                next_results.push(Some(DeciResult::ArbitraryFraction(
                    tree.original_cardinality.to_bigint().unwrap(),
                    BigInt::from(1),
                )));

                // Serialize column length
                next_results.push(Some(DeciResult::ArbitraryFraction(
                    tree.columns.len().to_bigint().unwrap(),
                    BigInt::from(1),
                )));

                // Serialize columns
                for column in &tree.columns {
                    next_results.push(Some(DeciResult::String(column.name.clone())));
                    next_results.push(Some(
                        column.aggregation.clone().unwrap_or(DeciResult::Pending),
                    ));
                }

                // Serialize child count
                next_results.push(Some(DeciResult::ArbitraryFraction(
                    tree.children.len().to_bigint().unwrap(),
                    BigInt::from(1),
                )));

                // Serialize children
                for child in &tree.children {
                    next_results.push(Some(DeciResult::Tree(child.clone())));
                }
            }

            DeciResult::Row(row) => {
                type_array.extend_from_slice(&[
                    ResultType::Row as usize,
                    0,               // placeholder value
                    row.cells.len(), // +1 for row_index_name
                ]);

                // Serialize row index name
                next_results.push(Some(DeciResult::String(row.row_index_name.clone())));

                // Serialize each cell
                for (name, value) in &row.cells {
                    next_results.push(Some(DeciResult::String(name.clone())));
                    next_results.push(Some(value.clone()));
                }
            }

            DeciResult::TypeError => {
                type_array.extend_from_slice(&[
                    ResultType::TypeError as usize,
                    *data_length as usize,
                    0,
                ]);
            }

            DeciResult::Function {
                name,
                argument_names,
                body,
            } => {
                type_array.extend_from_slice(&[
                    ResultType::Function as usize,
                    0, // placeholder value
                    argument_names.len(),
                ]);

                next_results.push(Some(DeciResult::String(name.clone())));

                for arg_name in &argument_names {
                    next_results.push(Some(DeciResult::String(arg_name.clone())));
                }
                let block_json = serde_json::to_string(&body).unwrap();
                next_results.push(Some(DeciResult::String(block_json)));
            }

            DeciResult::Pending => {
                type_array.extend_from_slice(&[
                    ResultType::Pending as usize,
                    *data_length as usize,
                    0,
                ]);
            }
        }
    }

    // Time to fix placeholder values
    let mut offset = type_array.len() / 3;
    for i in (initial_type_array_length..type_array.len()).step_by(3) {
        if type_array[i] != ResultType::Column as usize
            && type_array[i] != ResultType::Table as usize
            && type_array[i] != ResultType::Row as usize
            && type_array[i] != ResultType::Tree as usize
            && type_array[i] != ResultType::Function as usize
        {
            continue;
        }
        type_array[i + 1] = offset as usize;
        offset += type_array[i + 2];
    }

    if !next_results.is_empty() {
        serialize_result_iter(&next_results, type_array, data_array, data_length)?;
    }

    Ok(())
}

pub fn serialize_result(result: DeciResult) -> Object {
    let mut type_array = Vec::new();
    let mut data_array = Vec::new();
    let mut data_length = 0;

    serialize_result_iter(
        &[Some(result)],
        &mut type_array,
        &mut data_array,
        &mut data_length,
    )
    .unwrap();
    // TODO: better error handling

    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value as u64);
    }

    let data_array_js = Uint8Array::new_with_length(data_array.len() as u32);
    data_array_js.copy_from(&data_array);

    let objout = js_sys::Object::new();
    js_sys::Reflect::set(&objout, &"type".into(), &JsValue::from(type_array_js))
        .expect("set type buffer");
    js_sys::Reflect::set(&objout, &"data".into(), &JsValue::from(data_array_js))
        .expect("set data buffer");

    objout
}

pub fn deserialize_result(val: Object) -> Result<DeciResult, JsValue> {
    let ser_result = js_to_rust_serialized_result(&val)?;
    let type_description: Vec<u64> = ser_result.type_array().to_vec();
    let data = ser_result.data();

    deserialize_data_iter(&data, &type_description, 0).map(|opt| opt.unwrap())
}

pub fn deserialize_data_iter(
    data: &Uint8Array,
    type_description: &[u64],
    type_description_pointer: usize,
) -> Result<Option<DeciResult>, JsValue> {
    let (is_compressed, result_type) =
        decode_number(type_description[3 * type_description_pointer]);

    if is_compressed {
        return Err(JsValue::from_str(
            "Compressed data is not supported at the top level",
        ));
    }

    let offset = type_description[3 * type_description_pointer + 1] as usize;
    let length = type_description[3 * type_description_pointer + 2] as usize;

    match result_type {
        // TODO move this further down
        ResultType::Undefined => Ok(None),
        ResultType::Boolean => Ok(Some(DeciResult::Boolean(
            data.get_index(offset as u32) != 0,
        ))),
        ResultType::Fraction => {
            let numerator = read_i64_from_uint8array(data, offset);
            let denominator = read_i64_from_uint8array(data, offset + 8);
            Ok(Some(DeciResult::Fraction(numerator, denominator)))
        }
        ResultType::ArbitraryFraction => {
            let (numerator, numerator_offset) = decode_big_int(data, offset);
            let (denominator, _denominator_offset) = decode_big_int(data, numerator_offset);
            Ok(Some(DeciResult::ArbitraryFraction(numerator, denominator)))
        }
        ResultType::String => {
            let buffer = data.slice(offset as u32, (offset + length) as u32);
            let value = String::from_utf8(buffer.to_vec())
                .map_err(|e| JsValue::from_str(&format!("Invalid UTF-8 sequence: {}", e)))?;
            Ok(Some(DeciResult::String(value)))
        }
        ResultType::Date => {
            let date_specificity_number = data.get_index(offset as u32) as u8;
            let date_specificity = match date_specificity_number {
                0 => DateSpecificity::None,
                1 => DateSpecificity::Year,
                2 => DateSpecificity::Quarter,
                3 => DateSpecificity::Month,
                4 => DateSpecificity::Day,
                5 => DateSpecificity::Hour,
                6 => DateSpecificity::Minute,
                7 => DateSpecificity::Second,
                8 => DateSpecificity::Millisecond,
                _ => return Err(JsValue::from_str("Invalid DateSpecificity value")),
            };

            let date = if length > 1 {
                let ms = read_i64_from_uint8array(data, offset + 1);
                #[allow(deprecated)]
                // TODO: don't use NaiveDateTime::from_timestamp
                Some(NaiveDateTime::from_timestamp(ms / 1000, 0))
            } else {
                None
            };
            Ok(Some(DeciDate(date, date_specificity).into()))
        }
        ResultType::Column => {
            let is_compressed = if let Some(content_type) = type_description.get(3) {
                decode_number(*content_type).0
            } else {
                false
            };

            let data_type_offset = offset;
            let data_type_length = length;

            if !is_compressed {
                let mut column: Vec<DeciResult> = Vec::new();
                for i in data_type_offset..data_type_offset + data_type_length {
                    let item = deserialize_data_iter(data, type_description, i)?.unwrap();
                    column.push(item);
                }
                Ok(Some(DeciResult::Column(column)))
            } else {
                let item_count = type_description[4] as usize;
                let item_length = type_description[5] as usize;
                let mut column: Vec<DeciResult> = Vec::with_capacity(item_count);

                for i in 0..item_count {
                    let new_offset = offset + i * item_length;
                    let mut type_description_slice = type_description[3..].to_vec();
                    type_description_slice[0] &= (1 << 63) - 1;
                    type_description_slice[1] = new_offset as u64;
                    type_description_slice[2] = item_length as u64;

                    let item = deserialize_data_iter(data, &type_description_slice, 0)?.unwrap();
                    column.push(item);
                }
                Ok(Some(DeciResult::Column(column)))
            }
        }
        ResultType::Range => {
            if length != 32 {
                return Err(JsValue::from_str("Invalid length for Range type"));
            }

            let start_numerator = read_i64_from_uint8array(data, offset);
            let start_denominator = read_i64_from_uint8array(data, offset + 8);
            let end_numerator = read_i64_from_uint8array(data, offset + 16);
            let end_denominator = read_i64_from_uint8array(data, offset + 24);

            let start = DeciResult::Fraction(start_numerator, start_denominator);
            let end = DeciResult::Fraction(end_numerator, end_denominator);

            Ok(Some(DeciResult::Range(vec![start, end])))
        }
        ResultType::Table => {
            let child_count = length;
            let mut index_name = None;
            let mut delegates_index_to = None;
            let mut column_names = Vec::new();
            let mut columns = Vec::new();

            // Deserialize index_name
            let index_name_result =
                deserialize_data_iter(data, type_description, type_description_pointer + 1)?;
            if let Some(DeciResult::String(name)) = index_name_result {
                if !name.is_empty() {
                    index_name = Some(name);
                }
            }

            // Deserialize delegates_index_to
            let delegates_index_to_result =
                deserialize_data_iter(data, type_description, type_description_pointer + 2)?;
            if let Some(DeciResult::String(name)) = delegates_index_to_result {
                if !name.is_empty() {
                    delegates_index_to = Some(name);
                }
            }

            // Deserialize column names
            for i in 0..child_count {
                let column_name_result = deserialize_data_iter(
                    data,
                    type_description,
                    type_description_pointer + 3 + i,
                )?;
                if let Some(DeciResult::String(name)) = column_name_result {
                    column_names.push(name);
                } else {
                    return Err(JsValue::from_str("Expected string for column name"));
                }
            }

            // Deserialize columns
            for i in 0..child_count {
                let column_result = deserialize_data_iter(
                    data,
                    type_description,
                    type_description_pointer + 3 + child_count + i,
                )?;
                if let Some(DeciResult::Column(column_data)) = column_result {
                    columns.push(column_data);
                } else {
                    return Err(JsValue::from_str("Expected column in table"));
                }
            }

            Ok(Some(DeciResult::Table(Table {
                index_name,
                delegates_index_to,
                column_names,
                columns,
            })))
        }

        ResultType::Tree => {
            let mut tdp = offset;
            let root = deserialize_data_iter(data, type_description, tdp)?;
            tdp += 1;

            let root_aggregation = deserialize_data_iter(data, type_description, tdp)?;
            tdp += 1;

            let original_cardinality = match deserialize_data_iter(data, type_description, tdp)? {
                Some(DeciResult::ArbitraryFraction(n, _)) => n.to_usize().unwrap(),
                _ => {
                    return Err(JsValue::from_str(
                        "Expected number for original cardinality",
                    ))
                }
            };
            tdp += 1;

            let column_length = match deserialize_data_iter(data, type_description, tdp)? {
                Some(DeciResult::ArbitraryFraction(n, _)) => n.to_usize().unwrap(),
                _ => return Err(JsValue::from_str("Expected number for column length")),
            };
            tdp += 1;

            let mut columns = Vec::with_capacity(column_length);
            for _ in 0..column_length {
                let column_name = match deserialize_data_iter(data, type_description, tdp)? {
                    Some(DeciResult::String(name)) => name,
                    _ => return Err(JsValue::from_str("Expected string for column name")),
                };
                tdp += 1;

                let aggregation = match deserialize_data_iter(data, type_description, tdp)? {
                    Some(DeciResult::Pending) => None,
                    result => Some(result),
                };
                tdp += 1;

                columns.push(TreeColumn {
                    name: column_name,
                    aggregation: aggregation.flatten(),
                });
            }

            let child_count = match deserialize_data_iter(data, type_description, tdp)? {
                Some(DeciResult::ArbitraryFraction(n, _)) => n.to_usize().unwrap(),
                _ => return Err(JsValue::from_str("Expected number for child count")),
            };
            tdp += 1;

            let mut children = Vec::with_capacity(child_count);
            for _ in 0..child_count {
                if let Some(DeciResult::Tree(child)) =
                    deserialize_data_iter(data, type_description, tdp)?
                {
                    children.push(child);
                } else {
                    return Err(JsValue::from_str("Expected Tree for child"));
                }
                tdp += 1;
            }

            let matched = match root {
                Some(root) => Ok(Some(DeciResult::Tree(Tree {
                    root: Box::new(root),
                    root_aggregation: root_aggregation.map(|ra| Box::new(ra)),
                    original_cardinality: if original_cardinality <= i64::MAX as usize {
                        original_cardinality as i64
                    } else {
                        return Err(JsValue::from_str("original_cardinality too large for i64"));
                    },
                    children,
                    columns,
                }))),
                _ => Err(JsValue::from_str("Expected root")),
            };

            return matched;
        }

        ResultType::Row => {
            let row_length = length;
            let mut cells: HashMap<String, DeciResult> = HashMap::new();
            let row_index_name;

            // Deserialize row index name
            let row_index_name_result =
                deserialize_data_iter(data, type_description, type_description_pointer + 1)?;
            if let Some(DeciResult::String(name)) = row_index_name_result {
                row_index_name = name;
            } else {
                return Err(JsValue::from_str("Row index name is not a string"));
            }

            // Deserialize cells
            for i in 0..row_length {
                let cell_name_result = deserialize_data_iter(
                    data,
                    type_description,
                    type_description_pointer + 2 + 2 * i,
                )?;
                let cell_value_result = deserialize_data_iter(
                    data,
                    type_description,
                    type_description_pointer + 2 + 2 * i + 1,
                )?;

                if let (Some(DeciResult::String(cell_name)), Some(cell_value)) =
                    (cell_name_result, cell_value_result)
                {
                    cells.insert(cell_name, cell_value);
                } else {
                    return Err(JsValue::from_str("Cell name is not a string"));
                }
            }

            Ok(Some(DeciResult::Row(Row {
                row_index_name,
                cells,
            })))
        }
        ResultType::Function => {
            let arg_count = length as usize;

            // Deserialize function name
            let name_result =
                deserialize_data_iter(data, type_description, type_description_pointer + 1)?;
            let name = match name_result {
                Some(DeciResult::String(name)) => name,
                _ => return Err(JsValue::from_str("Function name is not a string")),
            };

            // Deserialize argument names
            let mut argument_names = Vec::with_capacity(arg_count);
            for i in 0..arg_count {
                let arg_result = deserialize_data_iter(
                    data,
                    type_description,
                    type_description_pointer + 2 + i,
                )?;
                match arg_result {
                    Some(DeciResult::String(arg_name)) => {
                        argument_names.push(arg_name);
                    }
                    _ => {
                        return Err(JsValue::from_str("Function argument name is not a string"));
                    }
                }
            }

            // Deserialize function body
            let body_result = deserialize_data_iter(
                data,
                type_description,
                type_description_pointer + 2 + arg_count,
            )?;
            let body_string = match body_result {
                Some(DeciResult::String(body)) => body,
                _ => return Err(JsValue::from_str("Function body is not a string")),
            };

            let body = serde_json::from_str(&body_string).unwrap();
            Ok(Some(DeciResult::Function {
                name,
                argument_names,
                body,
            }))
        }
        ResultType::TypeError => Ok(Some(DeciResult::TypeError)),
        ResultType::Pending => Ok(Some(DeciResult::Pending)),
    }
}

fn decode_number(number: u64) -> (bool, ResultType) {
    let is_compressed = (number & (1u64 << 63)) != 0;
    let original_number = number & 0x7FFFFFFFFFFFFFFFu64; // Clear the highest bit

    let result_type = match original_number {
        0 => ResultType::Boolean,
        1 => ResultType::Fraction,
        2 => ResultType::String,
        3 => ResultType::Column,
        4 => ResultType::Date,
        5 => ResultType::Table,
        6 => ResultType::Range,
        7 => ResultType::Row,
        8 => ResultType::TypeError,
        9 => ResultType::Pending,
        10 => ResultType::ArbitraryFraction,
        11 => ResultType::Tree,
        12 => ResultType::Function,
        13 => ResultType::Undefined,
        _ => panic!("Invalid ResultType value: {}", original_number),
    };

    (is_compressed, result_type)
}

fn read_i64_from_uint8array(array: &Uint8Array, offset: usize) -> i64 {
    let mut buffer = [0u8; 8];
    for i in 0..8 {
        buffer[i] = array.get_index((offset + i) as u32) as u8;
    }
    i64::from_le_bytes(buffer)
}
