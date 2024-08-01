pub fn contiguous_slice<T: Eq>(values: &Vec<T>) -> Vec<(usize, usize)> {
    let mut slices = vec![];

    let mut marker: usize = 0;

    for index in 1..values.len() {
        if values[index] == values[index - 1] {
            continue;
        }

        slices.push((marker, index - 1));
        marker = index;
    }

    slices.push((marker, values.len() - 1));

    slices
}

#[test]
fn test_contiguous_slice_simple() {
    let slices = contiguous_slice(&vec![5, 10, 15]);

    assert_eq!(slices, vec![(0, 0), (1, 1), (2, 2)]);
}

#[test]
fn test_contiguous_slice_harder() {
    let slices1 = contiguous_slice(&vec![5, 5, 10, 10, 15, 15]);
    let slices2 = contiguous_slice(&vec![5; 10]);
    let slices3 = contiguous_slice(&vec![10, 10, 10, 30, 40, 41, 41, 41, 41, 50, 50, 100, 100]);

    assert_eq!(slices1, vec![(0, 1), (2, 3), (4, 5)]);
    assert_eq!(slices2, vec![(0, 9)]);
    assert_eq!(
        slices3,
        vec![(0, 2), (3, 3), (4, 4), (5, 8), (9, 10), (11, 12)]
    );
}
