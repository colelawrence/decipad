pub mod date;

#[derive(Debug)]
pub struct ParsedColumn {
    pub name: String,
    pub value: Vec<String>,
}
