#![cfg(target_arch = "wasm32")]
use std::str::FromStr as _;

use compute_backend::types::ast::{BasicNode, Node};

use chrono::NaiveDateTime;
use compute_backend::{
    deci_result::{deserialize_data_iter, SerializedResult},
    types::types::{DateSpecificity, DeciDate, DeciResult},
};
use js_sys::{BigUint64Array, Uint8Array};
use num::BigInt;
use wasm_bindgen::JsValue;

mod common;
use common::create_serialized_result;

use wasm_bindgen_test::wasm_bindgen_test;
use wasm_bindgen_test::wasm_bindgen_test_configure;
wasm_bindgen_test_configure!(run_in_browser);

fn deserialize_result_internal(val: SerializedResult) -> Result<DeciResult, JsValue> {
    let type_description: Vec<u64> = val.type_array().to_vec();
    let data = val.data();

    deserialize_data_iter(&data, &type_description, 0).map(|opt| opt.unwrap())
}

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
    let serialized = create_serialized_result(vec![10, 0, 10], vec![1, 0, 0, 0, 1, 1, 0, 0, 0, 2]);
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
        create_serialized_result(vec![10, 0, 10], vec![1, 0, 0, 0, 255, 1, 0, 0, 0, 2]);
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
        vec![10, 0, 620],
        vec![
            50, 1, 0, 0, 149, 247, 58, 207, 96, 154, 13, 183, 226, 124, 243, 26, 152, 182, 13, 166,
            140, 224, 77, 217, 163, 190, 157, 13, 254, 2, 92, 225, 182, 176, 180, 157, 107, 252,
            30, 104, 70, 151, 167, 37, 57, 91, 243, 229, 129, 9, 150, 127, 214, 191, 125, 141, 36,
            22, 150, 118, 64, 94, 107, 49, 40, 162, 155, 84, 215, 5, 73, 202, 221, 103, 6, 232, 24,
            100, 191, 186, 232, 52, 234, 129, 101, 177, 147, 89, 74, 183, 244, 199, 155, 59, 5,
            213, 240, 249, 207, 54, 2, 40, 222, 167, 54, 185, 141, 210, 49, 80, 30, 195, 195, 61,
            193, 76, 4, 110, 181, 96, 65, 114, 23, 80, 218, 100, 172, 31, 208, 223, 58, 191, 180,
            81, 254, 98, 42, 167, 84, 93, 75, 231, 26, 231, 32, 148, 95, 29, 81, 177, 224, 254,
            121, 70, 235, 99, 29, 73, 64, 199, 50, 17, 172, 237, 213, 148, 157, 185, 26, 43, 155,
            61, 232, 109, 116, 42, 28, 60, 204, 41, 95, 135, 182, 177, 113, 62, 104, 141, 146, 249,
            12, 249, 68, 38, 135, 166, 36, 123, 103, 73, 139, 72, 210, 46, 62, 215, 59, 100, 86,
            42, 23, 123, 251, 49, 177, 99, 152, 116, 190, 128, 127, 1, 80, 114, 82, 133, 75, 41,
            33, 102, 174, 52, 178, 82, 234, 73, 173, 172, 9, 199, 106, 1, 245, 92, 184, 132, 25,
            201, 187, 243, 96, 163, 67, 111, 67, 84, 23, 40, 126, 164, 73, 205, 169, 36, 30, 185,
            206, 246, 22, 126, 199, 55, 208, 180, 214, 205, 184, 230, 222, 15, 193, 18, 203, 165,
            254, 109, 36, 243, 6, 157, 79, 154, 9, 169, 94, 6, 99, 103, 244, 250, 214, 79, 122,
            183, 26, 72, 176, 241, 165, 3, 50, 1, 0, 0, 115, 102, 93, 127, 176, 245, 229, 130, 7,
            137, 221, 83, 189, 165, 115, 36, 142, 198, 65, 194, 208, 51, 111, 134, 196, 145, 169,
            69, 206, 136, 86, 47, 77, 69, 199, 25, 184, 251, 247, 206, 221, 41, 109, 183, 132, 28,
            232, 224, 216, 210, 46, 18, 53, 249, 251, 22, 221, 30, 146, 42, 203, 140, 153, 73, 87,
            39, 232, 200, 48, 176, 65, 10, 108, 173, 147, 16, 13, 68, 207, 133, 166, 101, 231, 197,
            32, 105, 135, 255, 5, 40, 235, 161, 213, 77, 219, 53, 18, 100, 1, 174, 187, 156, 127,
            1, 239, 224, 49, 157, 73, 163, 133, 221, 171, 50, 154, 22, 100, 128, 202, 159, 87, 14,
            94, 209, 185, 48, 209, 41, 31, 74, 180, 51, 248, 241, 186, 75, 225, 158, 102, 133, 159,
            68, 114, 55, 121, 7, 135, 143, 233, 146, 162, 50, 224, 156, 146, 203, 27, 34, 241, 104,
            93, 152, 143, 124, 198, 240, 134, 108, 194, 162, 69, 252, 195, 110, 129, 145, 98, 144,
            211, 185, 248, 54, 110, 79, 171, 69, 125, 58, 31, 80, 119, 160, 4, 99, 227, 82, 149,
            103, 97, 166, 56, 225, 26, 188, 77, 132, 156, 43, 254, 195, 220, 154, 97, 104, 135,
            142, 142, 72, 175, 23, 1, 5, 1, 239, 138, 126, 188, 10, 148, 189, 144, 222, 164, 246,
            161, 27, 128, 13, 209, 207, 217, 204, 244, 5, 164, 233, 168, 124, 131, 164, 101, 60,
            182, 47, 214, 74, 10, 100, 119, 210, 200, 182, 78, 59, 71, 52, 198, 135, 121, 132, 135,
            218, 142, 171, 20, 13, 49, 65, 251, 57, 124, 162, 50, 157, 254, 6, 137, 224, 97, 60,
            153, 10, 174, 135, 38, 59, 84, 189, 117, 143, 35, 186, 173, 54, 88, 15,
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
        create_serialized_result(vec![4, 0, 9], vec![4, 192, 167, 107, 219, 144, 1, 0, 0]);
    let result = deserialize_result_internal(serializde).unwrap();
    assert_eq!(
        result,
        DeciResult::Date(DeciDate(
            Some(NaiveDateTime::from_timestamp(1721668184, 0)),
            DateSpecificity::Day
        ))
    );
}
#[wasm_bindgen_test]
fn test_deserialize_date_without_value() {
    let serialized = create_serialized_result(vec![4, 0, 1], vec![4]);
    let result = deserialize_result_internal(serialized).unwrap();
    assert_eq!(
        result,
        DeciResult::Date(DeciDate(None, DateSpecificity::Day))
    );
}

#[wasm_bindgen_test]
fn test_deserialize_string() {
    let serialized = create_serialized_result(vec![2, 0, 13], b"Hello, world!".to_vec());
    let result = deserialize_result_internal(serialized).unwrap();
    assert_eq!(result, DeciResult::String("Hello, world!".to_string()));
}

#[wasm_bindgen_test]
fn test_empty_column() {
    let serializd = create_serialized_result(vec![3, 1, 0], vec![]);
    let result = deserialize_result_internal(serializd).unwrap();
    assert_eq!(result, DeciResult::Column(vec![]));
}

#[wasm_bindgen_test]
fn test_deserialize_uncompressed_column_of_booleans() {
    let serialized = create_serialized_result(
        vec![3, 1, 4, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 3, 1],
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
        vec![3, 1, 3, 1, 0, 16, 1, 16, 16, 1, 32, 16],
        vec![
            1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
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
        vec![3, 1, 3, 2, 0, 5, 2, 5, 5, 2, 10, 4],
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
        create_serialized_result(vec![3, 0, 3, 9223372036854775808, 3, 1], vec![1, 0, 1]);
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
        vec![3, 0, 48, 9223372036854775809, 3, 16],
        vec![
            1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
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
            3, 1, 2, 3, 3, 2, 3, 5, 2, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 3, 1,
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
            3,
            0,
            4,
            9223372036854775811,
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
            3, 1, 2, 3, 3, 2, 3, 5, 2, 2, 0, 5, 2, 5, 6, 2, 11, 4, 2, 15, 3,
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
    let type_array = BigUint64Array::from(&[6, 0, 32][..]);
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
                7, 1, 2, // row
                2, 0, 12, // rowIndexName
                2, 12, 6, // String
                2, 18, 11, // Hello there
                2, 29, 6, // Number
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
                5, 1, 2, // table
                2, 0, 19, // indexName
                2, 19, 19, // delegatesIndexTo
                2, 38, 2, // T1
                2, 40, 2, // T2
                3, 7, 2, // column
                3, 9, 2, // column
                2, 42, 5, // T1
                2, 47, 13, // T1
                2, 60, 13, // T2
                2, 73, 21, // T2
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
            11, 1, 7, // tree
            0, 0, 1, // root
            13, 0, 0, // root aggregation
            10, 1, 10, // originalCardinality
            10, 11, 10, // column length
            2, 21, 4, // Col1 name
            10, 25, 10, // Col1 aggregation
            10, 35, 10, // child count
        ],
        vec![
            1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1, 0,
            0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
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
            11, 1, 9, // tree
            0, 0, 1, // root
            13, 0, 0, // root aggregation
            10, 1, 10, // originalCardinality
            10, 11, 10, // column length
            2, 21, 4, // Col1 name
            10, 25, 10, // Col1 aggregation
            10, 35, 10, // child count
            11, 10, 5, // tree 1
            11, 15, 5, // tree 2
            10, 45, 10, // tree 1 root
            13, 0, 0, // tree 1 root aggregation
            10, 55, 10, // tree 1 originalCardinality
            10, 65, 10, // tree 1 column length
            10, 75, 10, // tree 1 child count
            10, 85, 10, // tree 2 root
            13, 0, 0, // tree 2 root aggregation
            10, 95, 10, // tree 2 originalCardinality
            10, 105, 10, // tree 2 column length
            10, 115, 10, // tree 2 child count
        ],
        vec![
            1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1, 0,
            0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1,
            0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0,
            1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
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
fn test_deserialize_function() {
    let type_array: Vec<u64> = vec![
        12, 1, 2, // ResultType::Function, offset placeholder, arg_count
        2, 0, 3, // ResultType::String, offset, length ('add')
        2, 3, 4, // ResultType::String, offset, length ('arg1')
        2, 7, 4, // ResultType::String, offset, length ('arg2')
        2, 11, 203, // ResultType::String, offset, length (body length)
    ];

    let data_string = "addarg1arg2{\"type\":\"block\",\"id\":\"block-id\",\"args\":[{\"type\":\"function-call\",\"args\":[{\"type\":\"funcref\",\"args\":[\"+\"]},{\"type\":\"argument-list\",\"args\":[{\"type\":\"ref\",\"args\":[\"arg1\"]},{\"type\":\"ref\",\"args\":[\"arg2\"]}]}]}]}";
    let data_bytes = data_string.as_bytes().to_vec();

    // Create the SerializedResult
    let serialized_function = SerializedResult::new(
        BigUint64Array::from(&type_array[..]),
        Uint8Array::from(&data_bytes[..]),
    );

    // Deserialize the function
    let result = deserialize_result_internal(serialized_function).unwrap();

    let empty_basic_node = BasicNode {
        cache_key: None,
        start: None,
        end: None,
        inferred_type: None,
    };

    let arg1_ref = Node::RefNode {
        basic_node: empty_basic_node.clone(),
        args: vec!["arg1".to_string()],
        previous_var_name: None,
        is_missing: None,
    };

    let arg2_ref = Node::RefNode {
        basic_node: empty_basic_node.clone(),
        args: vec!["arg2".to_string()],
        previous_var_name: None,
        is_missing: None,
    };

    let arg_list = Node::ArgList {
        basic_node: empty_basic_node.clone(),
        args: vec![arg1_ref, arg2_ref],
    };

    let func_ref = Node::FuncRef {
        basic_node: empty_basic_node.clone(),
        args: vec!["+".to_string()],
    };

    let function_call = Node::FunctionCall {
        basic_node: empty_basic_node.clone(),
        args: vec![func_ref, arg_list],
    };

    let block_node = Node::Block {
        basic_node: empty_basic_node,
        id: "block-id".to_string(),
        args: vec![function_call],
        has_duplicate_name: None,
    };

    let expected = DeciResult::Function {
        name: "add".to_string(),
        argument_names: vec!["arg1".to_string(), "arg2".to_string()],
        body: block_node,
    };

    assert_eq!(result, expected);
}

#[wasm_bindgen_test]
fn test_deserialize_type_error() {
    let type_array = BigUint64Array::from(&[8, 0, 0][..]); // Type Error
    let data_array = Uint8Array::new_with_length(0); // Empty data for Type Error

    let serialized_type_error = SerializedResult::new(type_array, data_array);

    let result = deserialize_result_internal(serialized_type_error).unwrap();

    assert_eq!(result, DeciResult::TypeError);
}

#[wasm_bindgen_test]
fn test_deserialize_pending() {
    let type_array = BigUint64Array::from(&[9, 0, 0][..]); // Pending
    let data_array = Uint8Array::new_with_length(0); // Empty data for Pending

    let serialized_pending = SerializedResult::new(type_array, data_array);

    let result = deserialize_result_internal(serialized_pending).unwrap();

    assert_eq!(result, DeciResult::Pending);
}
