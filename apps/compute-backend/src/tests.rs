use crate::DeciResult;

pub fn dcol_from_vec(input: impl IntoIterator<Item = i64>) -> DeciResult {
    DeciResult::col_from_floats(input.into_iter().map(|x| x as f32))
}

#[test]
fn test_results() {
    let res1 = DeciResult::Column(vec![
        dcol_from_vec(vec![1, 2, 3]),
        dcol_from_vec(vec![4, 5, 6]),
        dcol_from_vec(vec![7, 8, 9]),
    ]);
    let res2 = DeciResult::Column(vec![
        dcol_from_vec(vec![9, 8, 7]),
        dcol_from_vec(vec![6, 5, 4]),
        dcol_from_vec(vec![3, 2, 1]),
    ]);
    assert_eq!(
        res1.clone() * res2.clone(),
        DeciResult::Column(vec![
            dcol_from_vec(vec![9, 16, 21]),
            dcol_from_vec(vec![24, 25, 24]),
            dcol_from_vec(vec![21, 16, 9]),
        ])
    );
    assert_eq!(
        &res1 + &res2,
        DeciResult::Column(vec![
            dcol_from_vec(vec![10, 10, 10]),
            dcol_from_vec(vec![10, 10, 10]),
            dcol_from_vec(vec![10, 10, 10]),
        ])
    )
}

#[test]
fn test_reducers() {
    let res1 = DeciResult::Column(vec![
        dcol_from_vec(vec![1, 2, 3]),
        dcol_from_vec(vec![4, 5, 6]),
        dcol_from_vec(vec![7, 8, 9]),
    ]);
    println!("mean: {}", res1.mean().get_string());
    println!("max: {}", res1.max_val().get_string());
    println!("min: {}", res1.min_val().get_string());
    println!("range: {}", res1.range().get_string());
}

#[test]
fn test_string() {
    let res1 = DeciResult::Column(vec![
        dcol_from_vec(vec![1, 2, 3]),
        dcol_from_vec(vec![4, 5, 6]),
        dcol_from_vec(vec![7, 8, 9]),
    ]);
    println!("{}", res1.get_string());
}

#[test]
pub fn print_test() {
    let dim: usize = 5;
    let res1 = DeciResult::Column(
        (1..dim)
            .map(|x| DeciResult::Column((1..x).map(|y| (y as f32).into()).collect()))
            .collect(),
    );
    let decisum = res1.get_string();
    println!("{decisum}");
}
