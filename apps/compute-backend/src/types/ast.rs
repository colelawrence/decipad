use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct Pos {
    // Define fields as needed
}

#[derive(Serialize, Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct Type {
    // Define fields as needed
}

#[derive(Serialize, Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct BasicNode {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<Pos>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<Pos>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inferred_type: Option<Type>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Eq, PartialEq)]
#[serde(tag = "type")]
pub enum Node {
    #[serde(rename = "block")]
    Block {
        #[serde(flatten)]
        basic_node: BasicNode,
        id: String,
        args: Vec<Node>,
        #[serde(skip_serializing_if = "Option::is_none")]
        has_duplicate_name: Option<String>,
    },
    #[serde(rename = "function-call")]
    FunctionCall {
        #[serde(flatten)]
        basic_node: BasicNode,
        args: Vec<Node>, // Should contain FuncRef and ArgList
    },
    #[serde(rename = "funcref")]
    FuncRef {
        #[serde(flatten)]
        basic_node: BasicNode,
        args: Vec<String>, // [functionName]
    },
    #[serde(rename = "argument-list")]
    ArgList {
        #[serde(flatten)]
        basic_node: BasicNode,
        args: Vec<Node>, // Contains RefNode instances
    },
    #[serde(rename = "ref")]
    RefNode {
        #[serde(flatten)]
        basic_node: BasicNode,
        args: Vec<String>, // [varName]
        #[serde(skip_serializing_if = "Option::is_none")]
        previous_var_name: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        is_missing: Option<bool>,
    },
}
