use compute_backend::deci_result::SerializedResult;
use js_sys::{BigUint64Array, Uint8Array};

pub fn create_serialized_result(type_array: Vec<u64>, data: Vec<u8>) -> SerializedResult {
    let type_array_js = BigUint64Array::new_with_length(type_array.len() as u32);
    for (i, &value) in type_array.iter().enumerate() {
        type_array_js.set_index(i as u32, value);
    }

    let data_array_js = Uint8Array::new_with_length(data.len() as u32);
    data_array_js.copy_from(&data);

    SerializedResult::new(type_array_js, data_array_js)
}
