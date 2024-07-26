// #![cfg(target_arch = "wasm32")]
extern crate wasm_bindgen_test;
use crate::DeciResult;
use js_sys::{BigUint64Array, Object, Uint8Array};
use wasm_bindgen::prelude::*;

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

enum ResultType {
    Boolean = 0,
    Fraction = 1,
    Float = 2,
    String = 3,
    Column = 4,
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
    results: &[DeciResult],
    type_array: &mut Vec<usize>,
    data_array: &mut Vec<u8>,
    data_length: &mut usize,
) -> Result<(), JsValue> {
    let mut nextResults: Vec<DeciResult> = Vec::new();

    let initial_type_array_length = type_array.len();
    for result in results {
        match result {
            DeciResult::Boolean(value) => {
                data_array.push(if *value { 1 } else { 0 });
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
            DeciResult::Column(values) => {
                type_array.extend_from_slice(&[
                    ResultType::Column as usize,
                    0, // Placeholder value
                    values.len(),
                ]);

                for value in values {
                    nextResults.push(value.clone());
                }
            }
            DeciResult::Float(_) => {
                return Err(JsValue::from_str("Float serialization not implemented"))
            }
        }
    }

    // Time to fix placeholder values
    let mut offset = type_array.len() / 3;
    // log offset  and type_array.len
    for i in (initial_type_array_length..type_array.len()).step_by(3) {
        if type_array[i] != ResultType::Column as usize {
            break;
        }
        type_array[i + 1] = offset as usize;
        offset += type_array[i + 2];
    }

    if !nextResults.is_empty() {
        serialize_result_iter(&nextResults, type_array, data_array, data_length)?;
    }

    Ok(())
}

pub fn serialize_result(result: DeciResult) -> Object {
    let mut type_array = Vec::new();
    let mut data_array = Vec::new();
    let mut data_length = 0;

    serialize_result_iter(
        &[result],
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

pub fn deserialize_result(val: Object) -> Result<DeciResult, JsValue> {
    let serResult = js_to_rust_serialized_result(&val)?;
    let type_description: Vec<u64> = serResult.type_array().to_vec();
    let data = serResult.data();

    decode_data(&data, &type_description, 0)
}

fn decode_data(
    data: &Uint8Array,
    type_description: &[u64],
    type_description_pointer: usize,
) -> Result<DeciResult, JsValue> {
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
        ResultType::Boolean => Ok(DeciResult::Boolean(data.get_index(offset as u32) != 0)),
        ResultType::Fraction => {
            let numerator = read_i64_from_uint8array(data, offset);
            let denominator = read_i64_from_uint8array(data, offset + 8);
            Ok(DeciResult::Fraction(numerator, denominator))
        }
        ResultType::String => {
            let buffer = data.slice(offset as u32, (offset + length) as u32);
            let value = String::from_utf8(buffer.to_vec())
                .map_err(|e| JsValue::from_str(&format!("Invalid UTF-8 sequence: {}", e)))?;
            Ok(DeciResult::String(value))
        }
        ResultType::Float => Err(JsValue::from_str("Floats are not supported yet")),
        ResultType::Column => {
            let (is_compressed, _) = decode_number(type_description[3]);
            let data_type_offset = offset;
            let data_type_length = length;

            if !is_compressed {
                let mut column = Vec::new();
                for i in data_type_offset..data_type_offset + data_type_length {
                    let item = decode_data(data, type_description, i)?;
                    column.push(item);
                }
                Ok(DeciResult::Column(column))
            } else {
                let item_count = type_description[4] as usize;
                let item_length = type_description[5] as usize;
                let mut column = Vec::with_capacity(item_count);

                for i in 0..item_count {
                    let new_offset = offset + i * item_length;
                    let mut type_description_slice = type_description[3..].to_vec();
                    type_description_slice[0] &= (1 << 63) - 1;
                    type_description_slice[1] = new_offset as u64;
                    type_description_slice[2] = item_length as u64;

                    let item = decode_data(data, &type_description_slice, 0)?;
                    column.push(item);
                }
                Ok(DeciResult::Column(column))
            }
        }
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
/*
#[cfg(test)]
mod serialize_result_tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_serialize_true() {
        let result = serialize_result(DeciResult::Boolean(true)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![0, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![1]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_false() {
        let result = serialize_result(DeciResult::Boolean(false)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![0, 0, 1]);
        assert_eq!(result.data().to_vec(), vec![0]);
    }

    #[wasm_bindgen_test]
    fn test_serialize_positive_integers() {
        let result = serialize_result(DeciResult::Fraction(1, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_fractions() {
        let result = serialize_result(DeciResult::Fraction(1, 3)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_zero() {
        let result = serialize_result(DeciResult::Fraction(0, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_negative_numbers() {
        let result = serialize_result(DeciResult::Fraction(-1, 1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![255, 255, 255, 255, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0]
        );

        let result = serialize_result(DeciResult::Fraction(1, -1)).unwrap();
        assert_eq!(result.type_array().to_vec(), vec![1, 0, 16]);
        assert_eq!(
            result.data().to_vec(),
            vec![1, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255]
        );
    }

    #[wasm_bindgen_test]
    fn test_serialize_string() {
        let result = serialize_result(DeciResult::String("Hello, world!".to_string())).unwrap();
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
        let result = serialize_result(column).unwrap();

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
        let result = serialize_result(column).unwrap();

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
        let result = serialize_result(column).unwrap();

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
}
    */

#[cfg(test)]
mod deserialize_result_tests {
    use super::*;
    use wasm_bindgen_test::*;

    fn create_serialized_result(type_array: Vec<u64>, data: Vec<u8>) -> SerializedResult {
        let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
        for (i, &value) in type_array.iter().enumerate() {
            type_array_js.set_index(i as u32, value);
        }

        let data_array_js = Uint8Array::new_with_length(data.len() as u32);
        data_array_js.copy_from(&data);

        SerializedResult::new(type_array_js, data_array_js)
    }
    /*
    #[wasm_bindgen_test]
    fn test_deserialize_boolean_true() {
        let serialized = create_serialized_result(vec![0, 0, 1], vec![1]);
        let result = deserialize_result(serialized).unwrap();
        assert_eq!(result, DeciResult::Boolean(true));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_boolean_false() {
        let serialized = create_serialized_result(vec![0, 0, 1], vec![0]);
        let result = deserialize_result(serialized).unwrap();
        assert_eq!(result, DeciResult::Boolean(false));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_positive_fraction() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
        );
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(-1, 2));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_infinity() {
        let serialized = create_serialized_result(
            vec![1, 0, 16],
            vec![1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
        assert_eq!(result, DeciResult::Fraction(-1, 0));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_string() {
        let serialized = create_serialized_result(vec![3, 0, 13], b"Hello, world!".to_vec());
        let result = deserialize_result(serialized).unwrap();
        assert_eq!(result, DeciResult::String("Hello, world!".to_string()));
    }

    #[wasm_bindgen_test]
    fn test_deserialize_uncompressed_column_of_booleans() {
        let serialized = create_serialized_result(
            vec![4, 1, 4, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 3, 1],
            vec![1, 0, 1, 0],
        );
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
        let result = deserialize_result(serialized).unwrap();
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
    */
}
