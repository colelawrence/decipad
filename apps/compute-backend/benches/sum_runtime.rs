#[cfg(not(target_arch = "wasm32"))]
use criterion::{criterion_group, criterion_main, Criterion};

use compute_backend::tests::{sum_1d, sum_2d, sum_reciprocals};

#[cfg(not(target_arch = "wasm32"))]
fn bench_sum_1d(c: &mut Criterion) {
    c.bench_function("bench_sum_1d", |b| {
        b.iter(|| {
            std::hint::black_box(for i in 50000000..=50000000 {
                if sum_1d(i) {
                    println!("error");
                }
            });
        });
    });
}

#[cfg(not(target_arch = "wasm32"))]
fn bench_sum_2d(c: &mut Criterion) {
    c.bench_function("bench_sum_2d", |b| {
        b.iter(|| {
            std::hint::black_box(for i in 10000..=10000 {
                if sum_2d(i) {
                    println!("error");
                }
            });
        });
    });
}

#[cfg(not(target_arch = "wasm32"))]
fn bench_sum_recips(c: &mut Criterion) {
    c.bench_function("bench_sum_recips", |b| {
        b.iter(|| {
            std::hint::black_box(for i in 50000000..=50000000 {
                if sum_reciprocals(i) {
                    println!("error");
                }
            });
        });
    });
}

#[cfg(not(target_arch = "wasm32"))]
criterion_group!(benches, bench_sum_1d, bench_sum_2d, bench_sum_recips);

#[cfg(not(target_arch = "wasm32"))]
criterion_main!(benches);
