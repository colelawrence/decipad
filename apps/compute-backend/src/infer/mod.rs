use crate::{parse::ParsedColumn, types::types::DeciType};

#[inline]
pub fn infer_single(value: &str) -> DeciType {
    match value {
        "True" | "true" | "False" | "false" => DeciType::Boolean,
        s if s.parse::<f64>().is_ok() => DeciType::Number,
        _ => DeciType::String,
    }
}

pub fn infer_column(column: &ParsedColumn) -> Result<DeciType, String> {
    if column.value.len() == 0 {
        return Err("Need length".to_string());
    }

    let mut rows_iter = column.value.iter();

    let inferred_type = infer_single(&rows_iter.next().expect("Checked length above").to_string());

    for i in rows_iter {
        let value_type = infer_single(i);
        if value_type != inferred_type {
            return Ok(DeciType::String);
        }
    }

    return Ok(inferred_type);
}

pub fn infer_columns(columns: &Vec<ParsedColumn>) -> Result<Vec<DeciType>, String> {
    let mut column_types: Vec<DeciType> = Vec::new();

    for col in columns {
        let col_type = infer_column(col)?;

        column_types.push(col_type);
    }

    return Ok(column_types);
}

#[test]
fn boolean_infer() {
    let boolean_vec = vec!["True".to_string(), "True".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: boolean_vec
        })
        .unwrap(),
        DeciType::Boolean
    );

    let boolean_vec = vec![
        "True".to_string(),
        "False".to_string(),
        "false".to_string(),
        "true".to_string(),
    ];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: boolean_vec
        })
        .unwrap(),
        DeciType::Boolean
    );

    let boolean_vec = vec!["false".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: boolean_vec
        })
        .unwrap(),
        DeciType::Boolean
    );

    let boolean_vec = vec!["true".to_string(), "True".to_string(), "False".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: boolean_vec
        })
        .unwrap(),
        DeciType::Boolean
    );
}

#[test]
fn number_infer() {
    let number_vec = vec!["123".to_string(), "32".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: number_vec
        })
        .unwrap(),
        DeciType::Number
    );

    let number_vec = vec![
        "2312".to_string(),
        "321312321".to_string(),
        "9019202".to_string(),
    ];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: number_vec
        })
        .unwrap(),
        DeciType::Number
    );

    let number_vec = vec!["-0.12".to_string(), "322".to_string(), "22.1".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: number_vec
        })
        .unwrap(),
        DeciType::Number
    );

    let number_vec = vec!["-.12".to_string(), ".3".to_string(), "22.1".to_string()];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: number_vec
        })
        .unwrap(),
        DeciType::Number
    );
}

#[test]
fn columns_infer() {
    let boolean_vec = vec![
        "True".to_string(),
        "False".to_string(),
        "false".to_string(),
        "true".to_string(),
    ];

    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: boolean_vec.clone()
        })
        .unwrap(),
        DeciType::Boolean
    );

    let number_vec = vec![
        "-.12".to_string(),
        ".3".to_string(),
        "22.1".to_string(),
        "0239813971".to_string(),
    ];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: number_vec.clone()
        })
        .unwrap(),
        DeciType::Number
    );

    let string_vec = vec![
        "hello".to_string(),
        "world".to_string(),
        "true".to_string(),
        "321321".to_string(),
    ];
    assert_eq!(
        infer_column(&ParsedColumn {
            name: String::from("A"),
            value: string_vec.clone()
        })
        .unwrap(),
        DeciType::String
    );

    let column_types = infer_columns(&vec![
        ParsedColumn {
            name: String::from("A"),
            value: boolean_vec,
        },
        ParsedColumn {
            name: String::from("A"),
            value: number_vec,
        },
        ParsedColumn {
            name: String::from("A"),
            value: string_vec,
        },
    ])
    .unwrap();
    assert_eq!(column_types[0], DeciType::Boolean);
    assert_eq!(column_types[1], DeciType::Number);
    assert_eq!(column_types[2], DeciType::String);
}
