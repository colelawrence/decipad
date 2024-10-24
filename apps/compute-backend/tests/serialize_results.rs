#![cfg(target_arch = "wasm32")]
use std::{collections::HashMap, io::ErrorKind, str::FromStr as _};

use chrono::NaiveDateTime;
use compute_backend::{
    deci_result::{serialize_result_iter, ResultType, SerializedResult},
    types::{
        ast::{BasicNode, Node},
        types::{DateSpecificity, DeciDate, DeciResult, Row, Table, Tree, TreeColumn},
    },
};

use js_sys::{BigUint64Array, Uint8Array};
use num::BigInt;
use wasm_bindgen_test::*;

use wasm_bindgen_test::wasm_bindgen_test_configure;
wasm_bindgen_test_configure!(run_in_browser);

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
    assert_eq!(result.type_array().to_vec(), vec![10, 0, 10]);
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
        vec![3, 1, 4, 10, 0, 10, 10, 10, 10, 10, 20, 10, 10, 30, 10]
    );
    assert_eq!(
        result.data().to_vec(),
        vec![
            1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 3, 1, 0, 0, 0, 4, 1, 0, 0, 0, 5, 1, 0, 0, 0,
            6, 1, 0, 0, 0, 7, 1, 0, 0, 0, 8
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
    assert_eq!(result.type_array().to_vec(), vec![10, 0, 10]);
    assert_eq!(result.data().to_vec(), vec![1, 0, 0, 0, 255, 1, 0, 0, 0, 2]);
}

#[wasm_bindgen_test]
fn test_serialize_really_big_arbitrary_fraction() {
    let numerator =
        BigInt::from_str("1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005").unwrap();
    let denominator =
        BigInt::from_str("5002009916778775199949688964548103824110689210964687173665204799721020547392260787844163616442907954620582209817873058093655294434665008691301744226027533836958706824316110176678135253816662678403267309851589346486085638808337918900988368864504694666401566379881317120354241922424004493140847606076475330524592365933865561082266499446525930640913477923193955925379022435101483159854831691826754647815784353481195905391318782644921936724123351403505245888913649174305161101369733133047062608582004549143807519656075593620590738707289559398062427779544578697456944805045677902129116662384410334478496341358451263982065302755428922217655856676643976496784488914025912207425814150404161966113320358123263116189799793486897908921136622429811").unwrap();
    let result =
        serialize_result_internal(DeciResult::ArbitraryFraction(numerator, denominator)).unwrap();
    assert_eq!(result.type_array().to_vec(), vec![10, 0, 620]);
    assert_eq!(
        result.data().to_vec(),
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
            153, 10, 174, 135, 38, 59, 84, 189, 117, 143, 35, 186, 173, 54, 88, 15
        ]
    );
}

#[wasm_bindgen_test]
fn test_serialize_date_with_value() {
    let date = NaiveDateTime::from_timestamp(1721668184, 0);
    let result =
        serialize_result_internal(DeciResult::Date(DeciDate(Some(date), DateSpecificity::Day)))
            .unwrap();
    assert_eq!(result.type_array().to_vec(), vec![4, 0, 9]);
    assert_eq!(
        result.data().to_vec(),
        vec![4, 192, 167, 107, 219, 144, 1, 0, 0]
    );
}

#[wasm_bindgen_test]
fn test_serialize_date_without_value() {
    let result =
        serialize_result_internal(DeciResult::Date(DeciDate(None, DateSpecificity::Day))).unwrap();
    assert_eq!(result.type_array().to_vec(), vec![4, 0, 1]);
    assert_eq!(result.data().to_vec(), vec![4]);
}

#[wasm_bindgen_test]
fn test_serialize_string() {
    let result =
        serialize_result_internal(DeciResult::String("Hello, world!".to_string())).unwrap();
    assert_eq!(result.type_array().to_vec(), vec![2, 0, 13]);
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
        3, 1, 4, // column
        2, 0, 5, // Hello
        2, 5, 5, // there
        2, 10, 5, // world
        2, 15, 1, // !
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
        3, 1, 2, // outer column
        3, 3, 2, // first inner column
        3, 5, 2, // second inner column
        2, 0, 5, // Hello
        2, 5, 6, // World!
        2, 11, 4, // Deci
        2, 15, 3, // Pad
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
        3, 1, 2, // outer column
        3, 3, 2, // first middle column
        3, 5, 2, // second middle column
        3, 7, 2, // first inner column
        3, 9, 2, // second inner column
        3, 11, 2, // third inner column
        3, 13, 2, // fourth inner column
        2, 0, 5, // "Short"
        2, 5, 13, // "Longer string"
        2, 18, 13, // "Medium length"
        2, 31, 21, // "Very long string here"
        2, 52, 7, // "Another"
        2, 59, 17, // "Different lengths"
        2, 76, 4, // "Test"
        2, 80, 21, // "Variable string sizes"
    ];
    assert_eq!(result.type_array().to_vec(), expected_type);

    let expected_data = "ShortLonger stringMedium lengthVery long string hereAnotherDifferent lengthsTestVariable string sizes".as_bytes().to_vec();
    assert_eq!(result.data().to_vec(), expected_data);
}

#[wasm_bindgen_test]
fn test_serialize_range() {
    let range = DeciResult::Range(vec![DeciResult::Fraction(2, 1), DeciResult::Fraction(8, 1)]);
    let result = serialize_result_internal(range).unwrap();

    assert_eq!(result.type_array().to_vec(), vec![6, 0, 32]);
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
    assert_eq!(result.type_array().get_index(0), 7);
    assert_eq!(result.type_array().get_index(1), 1);
    assert_eq!(result.type_array().get_index(2), 2);

    // Check the second entry (rowIndexName)
    assert_eq!(result.type_array().get_index(3), 2);
    assert_eq!(result.type_array().get_index(4), 0);
    assert_eq!(result.type_array().get_index(5), 12);

    // Check the remaining entries without assuming order
    let mut found_string = false;
    let mut found_number = false;

    for i in 2..6 {
        let entry_type = result.type_array().get_index(i * 3);
        let entry_length = result.type_array().get_index(i * 3 + 2);

        if entry_type == ResultType::String as u64 && entry_length == 6 {
            // String key
            found_string = true;
        } else if entry_type == ResultType::String as u64 && entry_length == 11 {
            // String value
            found_string = true;
        } else if entry_type == ResultType::Fraction as u64 && entry_length == 16 {
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
        [5, 1, 2],   // table
        [2, 0, 19],  // indexName
        [2, 19, 19], // delegatesIndexTo
        [2, 38, 2],  // T1
        [2, 40, 2],  // T2
        [3, 7, 2],   // column
        [3, 9, 2],   // column
        [2, 42, 5],  // T1
        [2, 47, 13], // T1
        [2, 60, 13], // T2
        [2, 73, 21], // T2
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
            11, 1, 7, // tree
            0, 0, 1, // root
            13, 0, 0, // root aggregation
            10, 1, 10, // originalCardinality
            10, 11, 10, // column length
            2, 21, 4, // Col1 name
            10, 25, 10, // Col1 aggregation
            10, 35, 10, // child count
        ]
    );

    assert_eq!(
        result.data().to_vec(),
        vec![
            1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1, 0,
            0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
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
            10, 45, 10, 13, 0, 0, 10, 55, 10, 10, 65, 10, 10, 75, 10, 10, 85, 10, 13, 0, 0, 10, 95,
            10, 10, 105, 10, 10, 115, 10,
        ]
    );

    assert_eq!(
        result.data().to_vec(),
        vec![
            1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111, 108, 49, 1, 0,
            0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1,
            0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0,
            1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
        ]
    );
}

#[wasm_bindgen_test]
fn test_serialize_function() {
    // Construct the AST.Block equivalent in Rust
    // Here, we'll represent the AST as a JSON string to match the TypeScript example
    let block = serde_json::json!({
        "type": "block",
        "id": "block-id",
        "args": [
            {
                "type": "function-call",
                "args": [
                    { "type": "funcref", "args": ["+"] },
                    {
                        "type": "argument-list",
                        "args": [
                            { "type": "ref", "args": ["arg1"] },
                            { "type": "ref", "args": ["arg2"] },
                        ],
                    },
                ],
            },
        ],
    });

    let body = serde_json::to_string(&block).unwrap();
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

    let function_result = DeciResult::Function {
        name: "add".to_string(),
        argument_names: vec!["arg1".to_string(), "arg2".to_string()],
        body: block_node,
    };

    // Serialize the result
    let serialized = serialize_result_internal(function_result).unwrap();

    // Expected serialized type array and data array
    let expected_type_array: Vec<u64> = vec![
        12,
        1,
        2, // ResultType::Function, offset placeholder, arg_count
        2,
        0,
        3, // ResultType::String, offset, length ('add')
        2,
        3,
        4, // ResultType::String, offset, length ('arg1')
        2,
        7,
        4, // ResultType::String, offset, length ('arg2')
        2,
        11,
        body.len() as u64,
    ];

    // Build the expected data array
    let mut expected_data = Vec::new();
    expected_data.extend_from_slice(b"add");
    expected_data.extend_from_slice(b"arg1");
    expected_data.extend_from_slice(b"arg2");
    expected_data.extend_from_slice(b"{\"type\":\"block\",\"id\":\"block-id\",\"args\":[{\"type\":\"function-call\",\"args\":[{\"type\":\"funcref\",\"args\":[\"+\"]},{\"type\":\"argument-list\",\"args\":[{\"type\":\"ref\",\"args\":[\"arg1\"]},{\"type\":\"ref\",\"args\":[\"arg2\"]}]}]}]}");

    // Verify the serialized type array and data array
    assert_eq!(serialized.type_array().to_vec(), expected_type_array);
    assert_eq!(serialized.data().to_vec(), expected_data);
}

#[wasm_bindgen_test]
fn test_serialize_type_error() {
    let result = serialize_result_internal(DeciResult::TypeError).unwrap();
    assert_eq!(result.type_array().to_vec(), vec![8, 0, 0]);
    assert_eq!(result.data().to_vec(), Vec::<u8>::new());
}

#[wasm_bindgen_test]
fn test_serialize_pending() {
    let result = serialize_result_internal(DeciResult::Pending).unwrap();
    assert_eq!(result.type_array().to_vec(), vec![9, 0, 0]);
    assert_eq!(result.data().to_vec(), Vec::<u8>::new());
}
