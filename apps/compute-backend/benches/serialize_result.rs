#[cfg(not(target_arch = "wasm32"))]
use criterion::{black_box, criterion_group, criterion_main, Criterion};

use compute_backend::deci_result::{deserialize_result, serialize_result, SerializedResult};
use compute_backend::types::DeciResult;

#[cfg(not(target_arch = "wasm32"))]
fn bench_bool(c: &mut Criterion) {
    c.bench_function("bool", |b| {
        b.iter(|| serialize_result(DeciResult::Boolean(true)))
    });
}

#[cfg(not(target_arch = "wasm32"))]
criterion_group!(benches, bench_bool);

#[cfg(not(target_arch = "wasm32"))]
criterion_main!(benches);
