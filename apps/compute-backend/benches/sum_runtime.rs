use compute_backend::types::types::DeciResult;
#[cfg(not(target_arch = "wasm32"))]
use criterion::{criterion_group, criterion_main, Criterion};

fn sum_2d(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| {
                DeciResult::Column((1..x).map(|y| DeciResult::Fraction(y as i64, 1)).collect())
            })
            .collect(),
    );
    let _decisum = res1.sum_frac();
    false
}

fn sum_1d(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Fraction(x as i64, 1))
            .collect(),
    );
    let _decisum = res1.sum_frac();
    false
}

fn sum_reciprocals(dim: usize) -> bool {
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Fraction(1, x as i64))
            .collect(),
    );
    let _decisum = res1.sum_frac();
    false
}

#[cfg(not(target_arch = "wasm32"))]
fn bench_sum_1d(c: &mut Criterion) {
    let mut group = c.benchmark_group("smallsample");
    group.sample_size(30);
    group.bench_function("bench_sum_1d", |b| {
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
    let mut group = c.benchmark_group("smallsample");
    group.sample_size(30);
    group.bench_function("bench_sum_2d", |b| {
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
    let mut group = c.benchmark_group("smallsample");
    group.sample_size(30);
    group.bench_function("bench_sum_recips", |b| {
        b.iter(|| {
            std::hint::black_box(for i in 10000..=10000 {
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
