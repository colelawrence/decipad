use csv::{Reader, StringRecord};

#[derive(Debug)]
pub struct ParsedColumn {
    pub name: String,
    pub value: Vec<String>,
}

fn get_headers(reader: &mut Reader<&[u8]>, is_first_header_row: bool) -> StringRecord {
    if is_first_header_row {
        return reader.headers().unwrap().clone();
    }

    let column_number = reader.headers().expect("Cannot find header row").len();

    let mut header_row: Vec<String> = vec!["A".into(); column_number];
    for i in 0..column_number {
        header_row[i] = String::from_utf8([b'A' + i as u8].to_vec()).unwrap();
    }

    StringRecord::from(header_row)
}

pub fn csv_to_parsed(csv_string: &str, is_first_header_row: bool) -> Vec<ParsedColumn> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(is_first_header_row)
        .from_reader(csv_string.as_bytes());

    let headers = &get_headers(&mut reader, is_first_header_row);
    let mut data: Vec<ParsedColumn> = vec![];

    for header in headers {
        println!("Hello {}", header.to_string());
        data.push(ParsedColumn {
            name: header.to_string(),
            value: vec![],
        });
    }

    for record in reader.records() {
        let record = record.unwrap();

        for (index, item) in record.iter().enumerate() {
            println!("Other {}", item.trim().to_owned());
            data[index].value.push(item.trim().to_owned());
        }
    }

    data
}

#[test]
fn test_simple_csv() {
    let csv = "year,make,model,description
        1948,Porsche,356,Luxury sports car
        1967,Ford,Mustang fastback 1967,American car";

    let columns = csv_to_parsed(&csv, true);

    assert_eq!(columns[0].name, "year");
    assert_eq!(columns[1].name, "make");

    assert_eq!(columns[0].value, vec!["1948", "1967"]);
    assert_eq!(columns[1].value, vec!["Porsche", "Ford"]);
}

#[test]
fn test_without_first_header_row() {
    let csv = "1948,Porsche,356,Luxury sports car
        1967,Ford,Mustang fastback 1967,American car";

    let columns = csv_to_parsed(&csv, false);

    assert_eq!(columns[0].name, "A");
    assert_eq!(columns[1].name, "B");

    assert_eq!(columns[0].value, vec!["1948", "1967"]);
    assert_eq!(columns[1].value, vec!["Porsche", "Ford"]);
}
