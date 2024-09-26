// #![cfg(target_arch = "wasm32")]
extern crate wasm_bindgen_test;
use crate::types::types::{DateSpecificity, Row, Table, Tree, TreeColumn};
use crate::DeciResult;
use chrono::NaiveDateTime;
use js_sys::{BigUint64Array, Object, Uint8Array};
use num_bigint::{BigInt, Sign, ToBigInt, ToBigUint};
use num_traits::{One, Signed, ToPrimitive, Zero};
use std::mem::size_of;
use std::result;
use std::str::FromStr;
use std::{collections::HashMap, io::ErrorKind};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
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

enum ResultType {
    Boolean = 0,
    Fraction = 1,
    Float = 2,
    String = 3,
    Column = 4,
    Date = 5,
    Table = 6,
    Range = 7,
    Row = 8,
    TypeError = 9,
    Pending = 10,
    ArbitraryFraction = 11,
    Tree = 12,
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

fn serialize_result_iter(
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
            DeciResult::Date(date, specificity) => {
                data_array.extend_from_slice(&[specificity as u8]);

                let mut length = 1;
                if let Some(date) = date {
                    let ms: i64 = date.timestamp_millis();
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

            DeciResult::Float(_) => return Err(ErrorKind::InvalidData),

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
                    (tree
                        .root_aggregation
                        .as_ref()
                        .map(|boxed| (**boxed).clone())),
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
                        column.aggregation.clone().unwrap_or((DeciResult::Pending)),
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
            DeciResult::Pending => {
                type_array.extend_from_slice(&[
                    ResultType::Pending as usize,
                    *data_length as usize,
                    0,
                ]);
            }
            DeciResult::ArbitraryFraction(_, _) => {
                return Err(ErrorKind::Unsupported);
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

// Just used for testing serialize_result_iter
fn serialize_result_internal(result: DeciResult) -> Result<SerializedResult, ErrorKind> {
    let mut type_array = Vec::new();
    let mut data_array = Vec::new();
    let mut data_length = 0;

    serialize_result_iter(
        &[Some(result)],
        &mut type_array,
        &mut data_array,
        &mut data_length,
    )?;

    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value as u64);
    }

    let data_array_js = Uint8Array::new_with_length(data_array.len() as u32);
    data_array_js.copy_from(&data_array);

    Ok(SerializedResult::new(type_array_js, data_array_js))
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
    );

    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value as u64);
    }

    let data_array_js = Uint8Array::new_with_length(data_array.len() as u32);
    data_array_js.copy_from(&data_array);

    let objout = js_sys::Object::new();
    js_sys::Reflect::set(&objout, &"type".into(), &JsValue::from(type_array_js));
    js_sys::Reflect::set(&objout, &"data".into(), &JsValue::from(data_array_js));
    objout
}

// Just used for testing deserialize_data_iter
fn deserialize_result_internal(val: SerializedResult) -> Result<DeciResult, JsValue> {
    let type_description: Vec<u64> = val.type_array().to_vec();
    let data = val.data();

    deserialize_data_iter(&data, &type_description, 0).map(|opt| opt.unwrap())
}

pub fn deserialize_result(val: Object) -> Result<DeciResult, JsValue> {
    let ser_result = js_to_rust_serialized_result(&val)?;
    let type_description: Vec<u64> = ser_result.type_array().to_vec();
    let data = ser_result.data();

    deserialize_data_iter(&data, &type_description, 0).map(|opt| opt.unwrap())
}

fn deserialize_data_iter(
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
        ResultType::Float => Err(JsValue::from_str("Floats are not supported yet")),
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
                Some(NaiveDateTime::from_timestamp(ms / 1000, 0))
            } else {
                None
            };
            Ok(Some(DeciResult::Date(date, date_specificity)))
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
                Some((root)) => {
                    (Ok(Some(DeciResult::Tree(Tree {
                        root: Box::new(root),
                        root_aggregation: root_aggregation.map(|ra| Box::new(ra)),
                        original_cardinality: if original_cardinality <= i64::MAX as usize {
                            original_cardinality as i64
                        } else {
                            return Err(JsValue::from_str(
                                "original_cardinality too large for i64",
                            ));
                        },
                        children,
                        columns,
                    }))))
                }
                _ => (Err(JsValue::from_str("Expected root"))),
            };

            return matched;
        }

        ResultType::Row => {
            let row_length = length;
            let mut cells: HashMap<String, DeciResult> = HashMap::new();
            let mut row_index_name = String::new();

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
        2 => ResultType::Float,
        3 => ResultType::String,
        4 => ResultType::Column,
        5 => ResultType::Date,
        6 => ResultType::Table,
        7 => ResultType::Range,
        8 => ResultType::Row,
        9 => ResultType::TypeError,
        10 => ResultType::Pending,
        11 => ResultType::ArbitraryFraction,
        12 => ResultType::Tree,
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

use wasm_bindgen_test::wasm_bindgen_test_configure;

wasm_bindgen_test_configure!(run_in_browser);
#[cfg(test)]
mod serialize_result_tests {
    use std::str::FromStr;

    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_serialize_true() {
        let result = serialize_result_internal(DeciResult::Boolean(true)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![0, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![1]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_false() {
        let result = serialize_result_internal(DeciResult::Boolean(false)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![0, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![0]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_positive_integers() {
        let result = serialize_result_internal(DeciResult::Fraction(1, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_fractions() {
        let result = serialize_result_internal(DeciResult::Fraction(1, 3)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_zero() {
        let result = serialize_result_internal(DeciResult::Fraction(0, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_negative_numbers() {
        let result = serialize_result_internal(DeciResult::Fraction(-1, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![255, 255, 255, 255, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0]
        );

        let result = serialize_result_internal(DeciResult::Fraction(1, -1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_arbitrary_fraction() {
        let result = serialize_result_internal(DeciResult::ArbitraryFraction(
            BigInt::from(1),
            BigInt::from(2),
        ))
        .unwrap();
        assert_eq!(result.type_array().to_vec(), vec![11, 0, 10]);
        assert_eq!(result.data().to_vec(), vec![1, 0, 0, 0, 1, 1, 0, 0, 0, 2]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_column_of_arbitrary_fractions() {
        let result = serialize_result_internal(DeciResult::Column(vec![
            DeciResult::ArbitraryFraction(BigInt::from(1), BigInt::from(2)),
            DeciResult::ArbitraryFraction(BigInt::from(3), BigInt::from(4)),
            DeciResult::ArbitraryFraction(BigInt::from(5), BigInt::from(6)),
            DeciResult::ArbitraryFraction(BigInt::from(7), BigInt::from(8)),
        ]))
        .unwrap();

        assert_eq!(
            result.type_array().to_vec(),
            vec![4, 1, 4, 11, 0, 10, 11, 10, 10, 11, 20, 10, 11, 30, 10]
        );
        assert_eq!(
            result.data().to_vec(),
            vec![
                1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 3, 1, 0, 0, 0, 4, 1, 0, 0, 0, 5, 1, 0, 0,
                0, 6, 1, 0, 0, 0, 7, 1, 0, 0, 0, 8
            ]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_neg_arbitrary_fraction() {
        let result = serialize_result_internal(DeciResult::ArbitraryFraction(
            BigInt::from(-1),
            BigInt::from(2),
        ))
        .unwrap();
        assert_eq!(result.type_array().to_vec(), vec![11, 0, 10]);
        assert_eq!(result.data().to_vec(), vec![1, 0, 0, 0, 255, 1, 0, 0, 0, 2]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_really_big_arbitrary_fraction() {
        let numerator =
        BigInt::from_str("1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005").unwrap();
        let denominator =
        BigInt::from_str("5002009916778775199949688964548103824110689210964687173665204799721020547392260787844163616442907954620582209817873058093655294434665008691301744226027533836958706824316110176678135253816662678403267309851589346486085638808337918900988368864504694666401566379881317120354241922424004493140847606076475330524592365933865561082266499446525930640913477923193955925379022435101483159854831691826754647815784353481195905391318782644921936724123351403505245888913649174305161101369733133047062608582004549143807519656075593620590738707289559398062427779544578697456944805045677902129116662384410334478496341358451263982065302755428922217655856676643976496784488914025912207425814150404161966113320358123263116189799793486897908921136622429811").unwrap();
        let result =
            serialize_result_internal(DeciResult::ArbitraryFraction(numerator, denominator))
                .unwrap();
        assert_eq!(result.type_array().to_vec(), vec![11, 0, 620]);
        assert_eq!(
            result.data().to_vec(),
            vec![
                50, 1, 0, 0, 149, 247, 58, 207, 96, 154, 13, 183, 226, 124, 243, 26, 152, 182, 13,
                166, 140, 224, 77, 217, 163, 190, 157, 13, 254, 2, 92, 225, 182, 176, 180, 157,
                107, 252, 30, 104, 70, 151, 167, 37, 57, 91, 243, 229, 129, 9, 150, 127, 214, 191,
                125, 141, 36, 22, 150, 118, 64, 94, 107, 49, 40, 162, 155, 84, 215, 5, 73, 202,
                221, 103, 6, 232, 24, 100, 191, 186, 232, 52, 234, 129, 101, 177, 147, 89, 74, 183,
                244, 199, 155, 59, 5, 213, 240, 249, 207, 54, 2, 40, 222, 167, 54, 185, 141, 210,
                49, 80, 30, 195, 195, 61, 193, 76, 4, 110, 181, 96, 65, 114, 23, 80, 218, 100, 172,
                31, 208, 223, 58, 191, 180, 81, 254, 98, 42, 167, 84, 93, 75, 231, 26, 231, 32,
                148, 95, 29, 81, 177, 224, 254, 121, 70, 235, 99, 29, 73, 64, 199, 50, 17, 172,
                237, 213, 148, 157, 185, 26, 43, 155, 61, 232, 109, 116, 42, 28, 60, 204, 41, 95,
                135, 182, 177, 113, 62, 104, 141, 146, 249, 12, 249, 68, 38, 135, 166, 36, 123,
                103, 73, 139, 72, 210, 46, 62, 215, 59, 100, 86, 42, 23, 123, 251, 49, 177, 99,
                152, 116, 190, 128, 127, 1, 80, 114, 82, 133, 75, 41, 33, 102, 174, 52, 178, 82,
                234, 73, 173, 172, 9, 199, 106, 1, 245, 92, 184, 132, 25, 201, 187, 243, 96, 163,
                67, 111, 67, 84, 23, 40, 126, 164, 73, 205, 169, 36, 30, 185, 206, 246, 22, 126,
                199, 55, 208, 180, 214, 205, 184, 230, 222, 15, 193, 18, 203, 165, 254, 109, 36,
                243, 6, 157, 79, 154, 9, 169, 94, 6, 99, 103, 244, 250, 214, 79, 122, 183, 26, 72,
                176, 241, 165, 3, 50, 1, 0, 0, 115, 102, 93, 127, 176, 245, 229, 130, 7, 137, 221,
                83, 189, 165, 115, 36, 142, 198, 65, 194, 208, 51, 111, 134, 196, 145, 169, 69,
                206, 136, 86, 47, 77, 69, 199, 25, 184, 251, 247, 206, 221, 41, 109, 183, 132, 28,
                232, 224, 216, 210, 46, 18, 53, 249, 251, 22, 221, 30, 146, 42, 203, 140, 153, 73,
                87, 39, 232, 200, 48, 176, 65, 10, 108, 173, 147, 16, 13, 68, 207, 133, 166, 101,
                231, 197, 32, 105, 135, 255, 5, 40, 235, 161, 213, 77, 219, 53, 18, 100, 1, 174,
                187, 156, 127, 1, 239, 224, 49, 157, 73, 163, 133, 221, 171, 50, 154, 22, 100, 128,
                202, 159, 87, 14, 94, 209, 185, 48, 209, 41, 31, 74, 180, 51, 248, 241, 186, 75,
                225, 158, 102, 133, 159, 68, 114, 55, 121, 7, 135, 143, 233, 146, 162, 50, 224,
                156, 146, 203, 27, 34, 241, 104, 93, 152, 143, 124, 198, 240, 134, 108, 194, 162,
                69, 252, 195, 110, 129, 145, 98, 144, 211, 185, 248, 54, 110, 79, 171, 69, 125, 58,
                31, 80, 119, 160, 4, 99, 227, 82, 149, 103, 97, 166, 56, 225, 26, 188, 77, 132,
                156, 43, 254, 195, 220, 154, 97, 104, 135, 142, 142, 72, 175, 23, 1, 5, 1, 239,
                138, 126, 188, 10, 148, 189, 144, 222, 164, 246, 161, 27, 128, 13, 209, 207, 217,
                204, 244, 5, 164, 233, 168, 124, 131, 164, 101, 60, 182, 47, 214, 74, 10, 100, 119,
                210, 200, 182, 78, 59, 71, 52, 198, 135, 121, 132, 135, 218, 142, 171, 20, 13, 49,
                65, 251, 57, 124, 162, 50, 157, 254, 6, 137, 224, 97, 60, 153, 10, 174, 135, 38,
                59, 84, 189, 117, 143, 35, 186, 173, 54, 88, 15
            ]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_date_with_value() {
        let date = NaiveDateTime::from_timestamp(1721668184, 0);
        let result =
            serialize_result_internal(DeciResult::Date(Some(date), DateSpecificity::Day)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![5, 0, 9]);
        assert_eq!(
            result.data().to_vec(),
            vec![4, 192, 167, 107, 219, 144, 1, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_date_without_value() {
        let result =
            serialize_result_internal(DeciResult::Date(None, DateSpecificity::Day)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![5, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![4]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_string() {
        let result =
            serialize_result_internal(DeciResult::String("Hello, world!".to_string())).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![3, 0, 13]);
        assert_eq!(result.data().to_vec(), "Hello, world!".as_bytes().to_vec());
    }

    #[wasm_bindgen_test]
    fn test_serialize_column_of_strings() {
        let column = DeciResult::Column(vec![
            DeciResult::String("Hello".to_string()),
            DeciResult::String("there".to_string()),
            DeciResult::String("world".to_string()),
            DeciResult::String("!".to_string()),
        ]);
        let result = serialize_result_internal(column).unwrap();

        let expected_type = vec![
            4, 1, 4, // column
            3, 0, 5, // Hello
            3, 5, 5, // there
            3, 10, 5, // world
            3, 15, 1, // !
        ];
        assert_eq!(result.type_array().to_vec(), expected_type);

        let expected_data = "Hellothereworld!".as_bytes().to_vec();
        assert_eq!(result.data().to_vec(), expected_data);
    }

    #[wasm_bindgen_test]
    fn test_serialize_column_of_columns_of_strings() {
        let column = DeciResult::Column(vec![
            DeciResult::Column(vec![
                DeciResult::String("Hello".to_string()),
                DeciResult::String("World!".to_string()),
            ]),
            DeciResult::Column(vec![
                DeciResult::String("Deci".to_string()),
                DeciResult::String("Pad".to_string()),
            ]),
        ]);
        let result = serialize_result_internal(column).unwrap();

        let expected_type = vec![
            4, 1, 2, // outer column
            4, 3, 2, // first inner column
            4, 5, 2, // second inner column
            3, 0, 5, // Hello
            3, 5, 6, // World!
            3, 11, 4, // Deci
            3, 15, 3, // Pad
        ];
        assert_eq!(result.type_array().to_vec(), expected_type);

        let expected_data = "HelloWorld!DeciPad".as_bytes().to_vec();
        assert_eq!(result.data().to_vec(), expected_data);
    }

    #[wasm_bindgen_test]
    fn test_serialize_3d_column_of_strings() {
        let column = DeciResult::Column(vec![
            DeciResult::Column(vec![
                DeciResult::Column(vec![
                    DeciResult::String("Short".to_string()),
                    DeciResult::String("Longer string".to_string()),
                ]),
                DeciResult::Column(vec![
                    DeciResult::String("Medium length".to_string()),
                    DeciResult::String("Very long string here".to_string()),
                ]),
            ]),
            DeciResult::Column(vec![
                DeciResult::Column(vec![
                    DeciResult::String("Another".to_string()),
                    DeciResult::String("Different lengths".to_string()),
                ]),
                DeciResult::Column(vec![
                    DeciResult::String("Test".to_string()),
                    DeciResult::String("Variable string sizes".to_string()),
                ]),
            ]),
        ]);
        let result = serialize_result_internal(column).unwrap();

        let expected_type = vec![
            4, 1, 2, // outer column
            4, 3, 2, // first middle column
            4, 5, 2, // second middle column
            4, 7, 2, // first inner column
            4, 9, 2, // second inner column
            4, 11, 2, // third inner column
            4, 13, 2, // fourth inner column
            3, 0, 5, // "Short"
            3, 5, 13, // "Longer string"
            3, 18, 13, // "Medium length"
            3, 31, 21, // "Very long string here"
            3, 52, 7, // "Another"
            3, 59, 17, // "Different lengths"
            3, 76, 4, // "Test"
            3, 80, 21, // "Variable string sizes"
        ];
        assert_eq!(result.type_array().to_vec(), expected_type);

        let expected_data = "ShortLonger stringMedium lengthVery long string hereAnotherDifferent lengthsTestVariable string sizes".as_bytes().to_vec();
        assert_eq!(result.data().to_vec(), expected_data);
    }

    #[wasm_bindgen_test]
    fn test_serialize_range() {
        let range = DeciResult::Range(vec![DeciResult::Fraction(2, 1), DeciResult::Fraction(8, 1)]);
        let result = serialize_result_internal(range).unwrap();

        assert_eq!(result.type_array().to_vec(), vec![7, 0, 32]);
        assert_eq!(
            result.data().to_vec(),
            vec![
                2, 0, 0, 0, 0, 0, 0, 0, // 2n
                1, 0, 0, 0, 0, 0, 0, 0, // 1n
                8, 0, 0, 0, 0, 0, 0, 0, // 8n
                1, 0, 0, 0, 0, 0, 0, 0, // 1n
            ]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_row() {
        let mut cells = HashMap::new();
        cells.insert(
            "String".to_string(),
            DeciResult::String("Hello there".to_string()),
        );
        cells.insert("Number".to_string(), DeciResult::Fraction(1, 3));

        let row = DeciResult::Row(Row {
            row_index_name: "rowIndexName".to_string(),
            cells,
        });

        let result = serialize_result_internal(row).unwrap();

        // Check the type array length
        assert_eq!(result.type_array().length(), 6 * 3);

        // Check the first entry (Row type)
        assert_eq!(result.type_array().get_index(0), 8);
        assert_eq!(result.type_array().get_index(1), 1);
        assert_eq!(result.type_array().get_index(2), 2);

        // Check the second entry (rowIndexName)
        assert_eq!(result.type_array().get_index(3), 3);
        assert_eq!(result.type_array().get_index(4), 0);
        assert_eq!(result.type_array().get_index(5), 12);

        // Check the remaining entries without assuming order
        let mut found_string = false;
        let mut found_number = false;

        for i in 2..6 {
            let entry_type = result.type_array().get_index(i * 3);
            let entry_length = result.type_array().get_index(i * 3 + 2);

            if entry_type == 3 && entry_length == 6 {
                // String key
                found_string = true;
            } else if entry_type == 3 && entry_length == 11 {
                // String value
                found_string = true;
            } else if entry_type == 3 && entry_length == 6 {
                // Number key
                found_number = true;
            } else if entry_type == 1 && entry_length == 16 {
                // Fraction value
                found_number = true;
            }
        }

        assert!(found_string, "String entry not found");
        assert!(found_number, "Number entry not found");

        // Check the data content
        let data_str = String::from_utf8(result.data().to_vec()).unwrap();
        assert!(data_str.contains("rowIndexName"));
        assert!(data_str.contains("String"));
        assert!(data_str.contains("Hello there"));
        assert!(data_str.contains("Number"));

        // Check for the presence of 1 and 3 as little-endian i64
        let data = result.data().to_vec();
        assert!(data.windows(8).any(|window| window == 1i64.to_le_bytes()));
        assert!(data.windows(8).any(|window| window == 3i64.to_le_bytes()));
    }

    #[wasm_bindgen_test]
    fn test_serialize_table() {
        let table = DeciResult::Table(Table {
            index_name: Some("exprRef_block_0_ind".to_string()),
            delegates_index_to: Some("exprRef_block_0_del".to_string()),
            column_names: vec!["T1".to_string(), "T2".to_string()],
            columns: vec![
                vec![
                    DeciResult::String("Short".to_string()),
                    DeciResult::String("Longer string".to_string()),
                ],
                vec![
                    DeciResult::String("Medium length".to_string()),
                    DeciResult::String("Very long string here".to_string()),
                ],
            ],
        });

        let result = serialize_result_internal(table).unwrap();

        // Check type array
        let type_array = result.type_array().to_vec();

        let chunked_type_array = type_array.chunks(3).collect::<Vec<_>>();
        let expected_type = vec![
            [6, 1, 2],   // table
            [3, 0, 19],  // indexName
            [3, 19, 19], // delegatesIndexTo
            [3, 38, 2],  // T1
            [3, 40, 2],  // T2
            [4, 7, 2],   // column
            [4, 9, 2],   // column
            [3, 42, 5],  // T1
            [3, 47, 13], // T1
            [3, 60, 13], // T2
            [3, 73, 21], // T2
        ];
        assert_eq!(chunked_type_array, expected_type);

        // Check data
        let data = result.data().to_vec();
        let expected_data = "exprRef_block_0_ind\
                         exprRef_block_0_del\
                         T1T2\
                         ShortLonger string\
                         Medium lengthVery long string here"
            .as_bytes()
            .to_vec();
        assert_eq!(data, expected_data);
    }

    #[wasm_bindgen_test]
    fn test_serialize_tree_with_no_children() {
        let tree = DeciResult::Tree(Tree {
            root: Box::new(DeciResult::Boolean(true)),
            root_aggregation: None,
            children: vec![],
            columns: vec![TreeColumn {
                name: "Col1".to_string(),
                aggregation: Some(DeciResult::ArbitraryFraction(
                    BigInt::from(1),
                    BigInt::from(1),
                )),
            }],
            original_cardinality: 1,
        });

        let result = serialize_result_internal(tree).unwrap();

        assert_eq!(
            result.type_array().to_vec(),
            vec![
                12, 1, 7, // tree
                0, 0, 1, // root
                13, 0, 0, // root aggregation
                11, 1, 10, // originalCardinality
                11, 11, 10, // column length
                3, 21, 4, // Col1 name
                11, 25, 10, // Col1 aggregation
                11, 35, 10, // child count
            ]
        );

        assert_eq!(
            result.data().to_vec(),
            vec![
                1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1,
                0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            ]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_tree() {
        let tree = DeciResult::Tree(Tree {
            root: Box::new(DeciResult::Boolean(true)),
            root_aggregation: None,
            children: vec![
                Tree {
                    root: Box::new(DeciResult::ArbitraryFraction(
                        BigInt::from(1),
                        BigInt::from(1),
                    )),
                    root_aggregation: None,
                    children: vec![],
                    columns: vec![],
                    original_cardinality: 0,
                },
                Tree {
                    root: Box::new(DeciResult::ArbitraryFraction(
                        BigInt::from(1),
                        BigInt::from(1),
                    )),
                    root_aggregation: None,
                    children: vec![],
                    columns: vec![],
                    original_cardinality: 0,
                },
            ],
            columns: vec![TreeColumn {
                name: "Col1".to_string(),
                aggregation: Some(DeciResult::ArbitraryFraction(
                    BigInt::from(1),
                    BigInt::from(1),
                )),
            }],
            original_cardinality: 1,
        });

        let result = serialize_result_internal(tree).unwrap();

        assert_eq!(
            result.type_array().to_vec(),
            vec![
                12, 1, 9, // tree
                0, 0, 1, // root
                13, 0, 0, // root aggregation
                11, 1, 10, // originalCardinality
                11, 11, 10, // column length
                3, 21, 4, // Col1 name
                11, 25, 10, // Col1 aggregation
                11, 35, 10, // child count
                12, 10, 5, // tree 1
                12, 15, 5, // tree 2
                11, 45, 10, 13, 0, 0, 11, 55, 10, 11, 65, 10, 11, 75, 10, 11, 85, 10, 13, 0, 0, 11,
                95, 10, 11, 105, 10, 11, 115, 10,
            ]
        );

        assert_eq!(
            result.data().to_vec(),
            vec![
                1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1,
                0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0,
                1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0,
                0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            ]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_type_error() {
        let result = serialize_result_internal(DeciResult::TypeError).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![9, 0, 0]);
        assert_eq!(result.data().to_vec(), vec![]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_pending() {
        let result = serialize_result_internal(DeciResult::Pending).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![10, 0, 0]);
        assert_eq!(result.data().to_vec(), vec![]);
    }
}

pub fn create_serialized_result(type_array: Vec<u64>, data: Vec<u8>) -> SerializedResult {
    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value);
    }

    let data_array_js = Uint8Array::new_with_length(data.len() as u32);
    data_array_js.copy_from(&data);

    SerializedResult::new(type_array_js, data_array_js)
}

#[cfg(test)]
mod deserialize_result_tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_deserialize_boolean_true() {
        let serialized = create_serialized_result(vec![0, 0, 1], vec![1]);
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Boolean(true));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_boolean_false() {
        let serialized = create_serialized_result(vec![0, 0, 1], vec![0]);
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Boolean(false));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_positive_fraction() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(1, 3));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_negative_fraction() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![
                255, 255, 255, 255, 255, 255, 255, 255, 2, 0, 0, 0, 0, 0, 0, 0,
            ],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(-1, 2));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_infinity() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(1, 0));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_negative_infinity() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![
                255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(-1, 0));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_arbitrary_fraction() {
        let serialized =
            create_serialized_result(vec![11, 0, 10], vec![1, 0, 0, 0, 1, 1, 0, 0, 0, 2]);
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::ArbitraryFraction(numerator, denominator) = result {
            assert_eq!(numerator, BigInt::from(1));
            assert_eq!(denominator, BigInt::from(2));
        } else {
            panic!("Expected ArbitraryFraction result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_neg_arbitrary_fraction() {
        let serialized =
            create_serialized_result(vec![11, 0, 10], vec![1, 0, 0, 0, 255, 1, 0, 0, 0, 2]);
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::ArbitraryFraction(numerator, denominator) = result {
            assert_eq!(numerator, BigInt::from(-1));
            assert_eq!(denominator, BigInt::from(2));
        } else {
            panic!("Expected ArbitraryFraction result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_really_big_arbitrary_fraction() {
        let serialized = create_serialized_result(
            vec![11, 0, 620],
            vec![
                50, 1, 0, 0, 149, 247, 58, 207, 96, 154, 13, 183, 226, 124, 243, 26, 152, 182, 13,
                166, 140, 224, 77, 217, 163, 190, 157, 13, 254, 2, 92, 225, 182, 176, 180, 157,
                107, 252, 30, 104, 70, 151, 167, 37, 57, 91, 243, 229, 129, 9, 150, 127, 214, 191,
                125, 141, 36, 22, 150, 118, 64, 94, 107, 49, 40, 162, 155, 84, 215, 5, 73, 202,
                221, 103, 6, 232, 24, 100, 191, 186, 232, 52, 234, 129, 101, 177, 147, 89, 74, 183,
                244, 199, 155, 59, 5, 213, 240, 249, 207, 54, 2, 40, 222, 167, 54, 185, 141, 210,
                49, 80, 30, 195, 195, 61, 193, 76, 4, 110, 181, 96, 65, 114, 23, 80, 218, 100, 172,
                31, 208, 223, 58, 191, 180, 81, 254, 98, 42, 167, 84, 93, 75, 231, 26, 231, 32,
                148, 95, 29, 81, 177, 224, 254, 121, 70, 235, 99, 29, 73, 64, 199, 50, 17, 172,
                237, 213, 148, 157, 185, 26, 43, 155, 61, 232, 109, 116, 42, 28, 60, 204, 41, 95,
                135, 182, 177, 113, 62, 104, 141, 146, 249, 12, 249, 68, 38, 135, 166, 36, 123,
                103, 73, 139, 72, 210, 46, 62, 215, 59, 100, 86, 42, 23, 123, 251, 49, 177, 99,
                152, 116, 190, 128, 127, 1, 80, 114, 82, 133, 75, 41, 33, 102, 174, 52, 178, 82,
                234, 73, 173, 172, 9, 199, 106, 1, 245, 92, 184, 132, 25, 201, 187, 243, 96, 163,
                67, 111, 67, 84, 23, 40, 126, 164, 73, 205, 169, 36, 30, 185, 206, 246, 22, 126,
                199, 55, 208, 180, 214, 205, 184, 230, 222, 15, 193, 18, 203, 165, 254, 109, 36,
                243, 6, 157, 79, 154, 9, 169, 94, 6, 99, 103, 244, 250, 214, 79, 122, 183, 26, 72,
                176, 241, 165, 3, 50, 1, 0, 0, 115, 102, 93, 127, 176, 245, 229, 130, 7, 137, 221,
                83, 189, 165, 115, 36, 142, 198, 65, 194, 208, 51, 111, 134, 196, 145, 169, 69,
                206, 136, 86, 47, 77, 69, 199, 25, 184, 251, 247, 206, 221, 41, 109, 183, 132, 28,
                232, 224, 216, 210, 46, 18, 53, 249, 251, 22, 221, 30, 146, 42, 203, 140, 153, 73,
                87, 39, 232, 200, 48, 176, 65, 10, 108, 173, 147, 16, 13, 68, 207, 133, 166, 101,
                231, 197, 32, 105, 135, 255, 5, 40, 235, 161, 213, 77, 219, 53, 18, 100, 1, 174,
                187, 156, 127, 1, 239, 224, 49, 157, 73, 163, 133, 221, 171, 50, 154, 22, 100, 128,
                202, 159, 87, 14, 94, 209, 185, 48, 209, 41, 31, 74, 180, 51, 248, 241, 186, 75,
                225, 158, 102, 133, 159, 68, 114, 55, 121, 7, 135, 143, 233, 146, 162, 50, 224,
                156, 146, 203, 27, 34, 241, 104, 93, 152, 143, 124, 198, 240, 134, 108, 194, 162,
                69, 252, 195, 110, 129, 145, 98, 144, 211, 185, 248, 54, 110, 79, 171, 69, 125, 58,
                31, 80, 119, 160, 4, 99, 227, 82, 149, 103, 97, 166, 56, 225, 26, 188, 77, 132,
                156, 43, 254, 195, 220, 154, 97, 104, 135, 142, 142, 72, 175, 23, 1, 5, 1, 239,
                138, 126, 188, 10, 148, 189, 144, 222, 164, 246, 161, 27, 128, 13, 209, 207, 217,
                204, 244, 5, 164, 233, 168, 124, 131, 164, 101, 60, 182, 47, 214, 74, 10, 100, 119,
                210, 200, 182, 78, 59, 71, 52, 198, 135, 121, 132, 135, 218, 142, 171, 20, 13, 49,
                65, 251, 57, 124, 162, 50, 157, 254, 6, 137, 224, 97, 60, 153, 10, 174, 135, 38,
                59, 84, 189, 117, 143, 35, 186, 173, 54, 88, 15,
            ],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::ArbitraryFraction(numerator, denominator) = result {
            assert_eq!(numerator,
                    BigInt::from_str("1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005").unwrap()
                );
            assert_eq!(denominator,
                    BigInt::from_str("5002009916778775199949688964548103824110689210964687173665204799721020547392260787844163616442907954620582209817873058093655294434665008691301744226027533836958706824316110176678135253816662678403267309851589346486085638808337918900988368864504694666401566379881317120354241922424004493140847606076475330524592365933865561082266499446525930640913477923193955925379022435101483159854831691826754647815784353481195905391318782644921936724123351403505245888913649174305161101369733133047062608582004549143807519656075593620590738707289559398062427779544578697456944805045677902129116662384410334478496341358451263982065302755428922217655856676643976496784488914025912207425814150404161966113320358123263116189799793486897908921136622429811").unwrap()
                );
        } else {
            panic!("Expected ArbitraryFraction result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_date_with_value() {
        let serializde =
            create_serialized_result(vec![5, 0, 9], vec![4, 192, 167, 107, 219, 144, 1, 0, 0]);
        let result = deserialize_result_internal(serializde).unwrap();
        assert_eq!(
            result,
            DeciResult::Date(
                Some(NaiveDateTime::from_timestamp(1721668184, 0)),
                DateSpecificity::Day
            )
        );
    }
    #[wasm_bindgen_test]
    fn test_deserialize_date_without_value() {
        let serialized = create_serialized_result(vec![5, 0, 1], vec![4]);
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::Date(None, DateSpecificity::Day));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_string() {
        let serialized = create_serialized_result(vec![3, 0, 13], b"Hello, world!".to_vec());
        let result = deserialize_result_internal(serialized).unwrap();
        assert_eq!(result, DeciResult::String("Hello, world!".to_string()));
    }

    #[wasm_bindgen_test]
    fn test_empty_column() {
        let serializd = create_serialized_result(vec![4, 1, 0], vec![]);
        let result = deserialize_result_internal(serializd).unwrap();
        assert_eq!(result, DeciResult::Column(vec![]));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_uncompressed_column_of_booleans() {
        let serialized = create_serialized_result(
            vec![4, 1, 4, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 3, 1],
            vec![1, 0, 1, 0],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(values) = result {
            assert_eq!(
                values,
                vec![
                    DeciResult::Boolean(true),
                    DeciResult::Boolean(false),
                    DeciResult::Boolean(true),
                    DeciResult::Boolean(false)
                ]
            );
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_uncompressed_column_of_fractions() {
        let serialized = create_serialized_result(
            vec![4, 1, 3, 1, 0, 16, 1, 16, 16, 1, 32, 16],
            vec![
                1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0,
                0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
            ],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(values) = result {
            assert_eq!(
                values,
                vec![
                    DeciResult::Fraction(1, 2),
                    DeciResult::Fraction(3, 4),
                    DeciResult::Fraction(5, 6)
                ]
            );
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_uncompressed_column_of_strings() {
        let serialized = create_serialized_result(
            vec![4, 1, 3, 3, 0, 5, 3, 5, 5, 3, 10, 4],
            b"HelloWorldTest".to_vec(),
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(values) = result {
            assert_eq!(
                values,
                vec![
                    DeciResult::String("Hello".to_string()),
                    DeciResult::String("World".to_string()),
                    DeciResult::String("Test".to_string())
                ]
            );
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_compressed_column_of_booleans() {
        let serialized =
            create_serialized_result(vec![4, 0, 3, 9223372036854775808, 3, 1], vec![1, 0, 1]);
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(values) = result {
            assert_eq!(
                values,
                vec![
                    DeciResult::Boolean(true),
                    DeciResult::Boolean(false),
                    DeciResult::Boolean(true)
                ]
            );
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_compressed_column_of_fractions() {
        let serialized = create_serialized_result(
            vec![4, 0, 48, 9223372036854775809, 3, 16],
            vec![
                1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0,
                0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
            ],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(values) = result {
            assert_eq!(
                values,
                vec![
                    DeciResult::Fraction(1, 2),
                    DeciResult::Fraction(3, 4),
                    DeciResult::Fraction(5, 6)
                ]
            );
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_nested_columns_uncompressed() {
        let serialized = create_serialized_result(
            vec![
                4, 1, 2, 4, 3, 2, 4, 5, 2, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 3, 1,
            ],
            vec![1, 0, 0, 1],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(outer_values) = result {
            assert_eq!(outer_values.len(), 2);
            if let (DeciResult::Column(inner1), DeciResult::Column(inner2)) =
                (&outer_values[0], &outer_values[1])
            {
                assert_eq!(
                    inner1,
                    &vec![DeciResult::Boolean(true), DeciResult::Boolean(false)]
                );
                assert_eq!(
                    inner2,
                    &vec![DeciResult::Boolean(false), DeciResult::Boolean(true)]
                );
            } else {
                panic!("Expected nested Columns");
            }
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_nested_columns_compressed() {
        let serialized = create_serialized_result(
            vec![
                4,
                0,
                4,
                9223372036854775812,
                2,
                2,
                9223372036854775808,
                2,
                1,
            ],
            vec![1, 0, 0, 1],
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(outer_values) = result {
            assert_eq!(outer_values.len(), 2);
            if let (DeciResult::Column(inner1), DeciResult::Column(inner2)) =
                (&outer_values[0], &outer_values[1])
            {
                assert_eq!(
                    inner1,
                    &vec![DeciResult::Boolean(true), DeciResult::Boolean(false)]
                );
                assert_eq!(
                    inner2,
                    &vec![DeciResult::Boolean(false), DeciResult::Boolean(true)]
                );
            } else {
                panic!("Expected nested Columns");
            }
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_column_of_columns_of_strings() {
        let serialized = create_serialized_result(
            vec![
                4, 1, 2, 4, 3, 2, 4, 5, 2, 3, 0, 5, 3, 5, 6, 3, 11, 4, 3, 15, 3,
            ],
            b"HelloWorld!DeciPad".to_vec(),
        );
        let result = deserialize_result_internal(serialized).unwrap();
        if let DeciResult::Column(outer_values) = result {
            assert_eq!(outer_values.len(), 2);
            if let (DeciResult::Column(inner1), DeciResult::Column(inner2)) =
                (&outer_values[0], &outer_values[1])
            {
                assert_eq!(
                    inner1,
                    &vec![
                        DeciResult::String("Hello".to_string()),
                        DeciResult::String("World!".to_string())
                    ]
                );
                assert_eq!(
                    inner2,
                    &vec![
                        DeciResult::String("Deci".to_string()),
                        DeciResult::String("Pad".to_string())
                    ]
                );
            } else {
                panic!("Expected nested Columns");
            }
        } else {
            panic!("Expected Column result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_range() {
        // Prepare test data
        let type_array = BigUint64Array::from(&[7, 0, 32][..]);
        let data = Uint8Array::from(
            &[
                2, 0, 0, 0, 0, 0, 0, 0, // 2n
                1, 0, 0, 0, 0, 0, 0, 0, // 1n
                8, 0, 0, 0, 0, 0, 0, 0, // 8n
                1, 0, 0, 0, 0, 0, 0, 0, // 1n
            ][..],
        );

        let serialized_range = SerializedResult::new(type_array, data);

        let result = deserialize_result_internal(serialized_range).unwrap();

        match result {
            DeciResult::Range(range) => {
                assert_eq!(range.len(), 2);
                assert_eq!(range[0], DeciResult::Fraction(2, 1));
                assert_eq!(range[1], DeciResult::Fraction(8, 1));
            }
            _ => panic!("Expected Range result"),
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_row() {
        // Prepare test data
        let row_index_name_data = "rowIndexName".as_bytes();
        let cell1_name_data = "String".as_bytes();
        let cell1_data = "Hello there".as_bytes();
        let cell2_name_data = "Number".as_bytes();
        let cell2_data = &[1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]; // 1/3 as two i64

        let mut data = Vec::new();
        data.extend_from_slice(row_index_name_data);
        data.extend_from_slice(cell1_name_data);
        data.extend_from_slice(cell1_data);
        data.extend_from_slice(cell2_name_data);
        data.extend_from_slice(cell2_data);

        let serialized_row = SerializedResult::new(
            BigUint64Array::from(
                &[
                    8, 1, 2, // row
                    3, 0, 12, // rowIndexName
                    3, 12, 6, // String
                    3, 18, 11, // Hello there
                    3, 29, 6, // Number
                    1, 35, 16, // 1/3
                ][..],
            ),
            Uint8Array::from(&data[..]),
        );

        let result = deserialize_result_internal(serialized_row).unwrap();

        if let DeciResult::Row(row) = result {
            assert_eq!(row.row_index_name, "rowIndexName");
            assert_eq!(row.cells.len(), 2);

            let string_cell = row.cells.get("String").unwrap();
            let number_cell = row.cells.get("Number").unwrap();

            assert_eq!(*string_cell, DeciResult::String("Hello there".to_string()));
            assert_eq!(*number_cell, DeciResult::Fraction(1, 3));
        } else {
            panic!("Expected Row result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_table() {
        let data_string = [
            "exprRef_block_0_ind",
            "exprRef_block_0_del",
            "T1",
            "T2",
            "Short",
            "Longer string",
            "Medium length",
            "Very long string here",
        ]
        .join("");

        let data_array = Uint8Array::new_with_length(data_string.len() as u32);
        data_array.copy_from(&data_string.as_bytes());

        let serialized_table = SerializedResult::new(
            BigUint64Array::from(
                &[
                    6, 1, 2, // table
                    3, 0, 19, // indexName
                    3, 19, 19, // delegatesIndexTo
                    3, 38, 2, // T1
                    3, 40, 2, // T2
                    4, 7, 2, // column
                    4, 9, 2, // column
                    3, 42, 5, // T1
                    3, 47, 13, // T1
                    3, 60, 13, // T2
                    3, 73, 21, // T2
                ][..],
            ),
            data_array,
        );

        // Deserialize the table
        let result = deserialize_result_internal(serialized_table).unwrap();

        // Check the deserialized result
        if let DeciResult::Table(table) = result {
            assert_eq!(table.index_name, Some("exprRef_block_0_ind".to_string()));
            assert_eq!(
                table.delegates_index_to,
                Some("exprRef_block_0_del".to_string())
            );
            assert_eq!(table.column_names, vec!["T1".to_string(), "T2".to_string()]);

            assert_eq!(table.columns.len(), 2);

            // Check first column
            assert_eq!(
                table.columns[0],
                vec![
                    DeciResult::String("Short".to_string()),
                    DeciResult::String("Longer string".to_string())
                ]
            );

            // Check second column
            assert_eq!(
                table.columns[1],
                vec![
                    DeciResult::String("Medium length".to_string()),
                    DeciResult::String("Very long string here".to_string())
                ]
            );
        } else {
            panic!("Expected Table result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_tree_with_no_children() {
        let serialized = create_serialized_result(
            vec![
                12, 1, 7, // tree
                0, 0, 1, // root
                13, 0, 0, // root aggregation
                11, 1, 10, // originalCardinality
                11, 11, 10, // column length
                3, 21, 4, // Col1 name
                11, 25, 10, // Col1 aggregation
                11, 35, 10, // child count
            ],
            vec![
                1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1,
                0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            ],
        );

        let result = deserialize_result_internal(serialized).unwrap();

        if let DeciResult::Tree(tree) = result {
            assert_eq!(*tree.root, DeciResult::Boolean(true));
            assert!(tree.root_aggregation.is_none());
            assert!(tree.children.is_empty());
            assert_eq!(tree.columns.len(), 1);
            assert_eq!(tree.columns[0].name, "Col1");
            assert_eq!(
                tree.columns[0].aggregation,
                Some(DeciResult::ArbitraryFraction(
                    BigInt::from(1),
                    BigInt::from(1)
                ))
            );
            assert_eq!(tree.original_cardinality, 1);
        } else {
            panic!("Expected Tree result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_tree() {
        let serialized = create_serialized_result(
            vec![
                12, 1, 9, // tree
                0, 0, 1, // root
                13, 0, 0, // root aggregation
                11, 1, 10, // originalCardinality
                11, 11, 10, // column length
                3, 21, 4, // Col1 name
                11, 25, 10, // Col1 aggregation
                11, 35, 10, // child count
                12, 10, 5, // tree 1
                12, 15, 5, // tree 2
                11, 45, 10, // tree 1 root
                13, 0, 0, // tree 1 root aggregation
                11, 55, 10, // tree 1 originalCardinality
                11, 65, 10, // tree 1 column length
                11, 75, 10, // tree 1 child count
                11, 85, 10, // tree 2 root
                13, 0, 0, // tree 2 root aggregation
                11, 95, 10, // tree 2 originalCardinality
                11, 105, 10, // tree 2 column length
                11, 115, 10, // tree 2 child count
            ],
            vec![
                1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1,
                0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0,
                1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0,
                0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            ],
        );

        let result = deserialize_result_internal(serialized).unwrap();

        if let DeciResult::Tree(tree) = result {
            assert_eq!(*tree.root, DeciResult::Boolean(true));
            assert!(tree.root_aggregation.is_none());
            assert_eq!(tree.children.len(), 2);
            assert_eq!(tree.columns.len(), 1);
            assert_eq!(tree.columns[0].name, "Col1");
            assert_eq!(
                tree.columns[0].aggregation,
                Some(DeciResult::ArbitraryFraction(
                    BigInt::from(1),
                    BigInt::from(1)
                ))
            );
            assert_eq!(tree.original_cardinality, 1);

            // Check first child
            let child1 = &tree.children[0];
            assert_eq!(
                *child1.root,
                DeciResult::ArbitraryFraction(BigInt::from(1), BigInt::from(1))
            );
            assert!(child1.root_aggregation.is_none());
            assert!(child1.children.is_empty());
            assert!(child1.columns.is_empty());
            assert_eq!(child1.original_cardinality, 0);

            // Check second child
            let child2 = &tree.children[1];
            assert_eq!(
                *child2.root,
                DeciResult::ArbitraryFraction(BigInt::from(1), BigInt::from(1))
            );
            assert!(child2.root_aggregation.is_none());
            assert!(child2.children.is_empty());
            assert!(child2.columns.is_empty());
            assert_eq!(child2.original_cardinality, 0);
        } else {
            panic!("Expected Tree result");
        }
    }

    #[wasm_bindgen_test]
    fn test_deserialize_type_error() {
        let type_array = BigUint64Array::from(&[9, 0, 0][..]); // Pending
        let data_array = Uint8Array::new_with_length(0); // Empty data for Pending

        let serialized_type_error = SerializedResult::new(type_array, data_array);

        let result = deserialize_result_internal(serialized_type_error).unwrap();

        assert_eq!(result, DeciResult::TypeError);
    }

    #[wasm_bindgen_test]
    fn test_deserialize_pending() {
        let type_array = BigUint64Array::from(&[10, 0, 0][..]); // Pending
        let data_array = Uint8Array::new_with_length(0); // Empty data for Pending

        let serialized_pending = SerializedResult::new(type_array, data_array);

        let result = deserialize_result_internal(serialized_pending).unwrap();

        assert_eq!(result, DeciResult::Pending);
    }
}
