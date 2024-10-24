use csv::{Reader, StringRecord};

mod date;
pub use date::*;

#[derive(Debug)]
pub struct ParsedColumn {
    pub name: String,
    pub value: Vec<String>,
}
