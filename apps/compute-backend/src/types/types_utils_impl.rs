use super::types::DeciResult;

// TODO: macro this or something (or use numeric traits if possible)
impl From<f32> for DeciResult {
    fn from(val: f32) -> Self {
        let f = fraction::Fraction::from(val);
        let (num, den) = (
            match f.is_sign_positive() {
                true => *f.numer().unwrap() as i64,
                false => -(*f.numer().unwrap() as i64),
            },
            *f.denom().unwrap() as i64,
        );
        DeciResult::Fraction(num, den)
    }
}
impl From<f64> for DeciResult {
    fn from(val: f64) -> Self {
        let f = fraction::Fraction::from(val);
        f.into()
    }
}
impl From<i64> for DeciResult {
    fn from(value: i64) -> Self {
        Self::Fraction(value, 1)
    }
}
impl From<usize> for DeciResult {
    fn from(value: usize) -> Self {
        Self::Fraction(value as _, 1)
    }
}
impl From<bool> for DeciResult {
    fn from(val: bool) -> Self {
        DeciResult::Boolean(val)
    }
}
impl From<fraction::GenericFraction<u64>> for DeciResult {
    fn from(val: fraction::GenericFraction<u64>) -> Self {
        DeciResult::Fraction(
            match val.is_sign_negative() {
                true => -(*val.numer().unwrap() as i64),
                false => *val.numer().unwrap() as i64,
            },
            *val.denom().unwrap() as i64,
        )
    }
}

impl DeciResult {
    pub fn col_from_floats(f: impl IntoIterator<Item = f32>) -> DeciResult {
        DeciResult::Column(f.into_iter().map(Into::into).collect())
    }

    pub fn from_frac(nums: Vec<i64>, dens: Vec<i64>) -> DeciResult {
        assert_eq!(nums.len(), dens.len());
        DeciResult::Column(
            nums.iter()
                .zip(dens.iter())
                .map(|(n, d)| DeciResult::Fraction(*n, *d))
                .collect(),
        )
    }

    pub fn sum_frac(&self) -> DeciResult {
        match self {
            DeciResult::Column(items) => {
                let mut sum = DeciResult::Fraction(0, 1);
                for item in items {
                    match item {
                        DeciResult::Column(_) => {
                            sum += item.sum_frac();
                        }
                        _ => sum += item.clone(),
                    }
                }
                sum
            }
            _ => panic!("Can't sum non-column"),
        }
    }

    pub fn len(&self) -> usize {
        match self {
            DeciResult::Column(items) => items.len(),
            _ => 1,
        }
    }

    pub fn get_slice(&self, start: usize, end: usize) -> DeciResult {
        match self {
            DeciResult::Column(items) => DeciResult::Column(items[start..end].to_vec()),
            _ => panic!("Can't slice non-column"),
        }
    }

    pub fn eq_num(&self, val: impl Into<DeciResult>) -> DeciResult {
        let val = val.into();
        match self {
            DeciResult::Column(items) => match &items.first() {
                Some(result) => match result {
                    DeciResult::Column(_) => {
                        DeciResult::Column(items.iter().map(|x| x.eq_num(val.clone())).collect())
                    }
                    _ => DeciResult::Column(
                        items
                            .iter()
                            .map(|x| DeciResult::Boolean(*x == val))
                            .collect(),
                    ),
                },
                None => DeciResult::Column(vec![]),
            },
            _ => panic!("Mask functions should be called on a column with a value"),
        }
    }

    pub fn gt_num(&self, val: impl Into<DeciResult>) -> DeciResult {
        let val = val.into();
        match self {
            DeciResult::Column(items) => match &items.first() {
                Some(result) => match result {
                    DeciResult::Column(_) => {
                        DeciResult::Column(items.iter().map(|x| x.gt_num(val.clone())).collect())
                    }
                    _ => DeciResult::Column(
                        items
                            .iter()
                            .map(|x| DeciResult::Boolean(*x > val))
                            .collect(),
                    ),
                },
                None => DeciResult::Column(vec![]),
            },
            _ => panic!("Mask functions should be called on a column with a value"),
        }
    }

    pub fn ge_num(&self, val: impl Into<DeciResult>) -> DeciResult {
        let val = val.into();
        match self {
            DeciResult::Column(items) => match &items.first() {
                Some(result) => match result {
                    DeciResult::Column(_) => {
                        DeciResult::Column(items.iter().map(|x| x.ge_num(val.clone())).collect())
                    }
                    _ => DeciResult::Column(
                        items
                            .iter()
                            .map(|x| DeciResult::Boolean(*x >= val))
                            .collect(),
                    ),
                },
                None => DeciResult::Column(vec![]),
            },
            _ => panic!("Mask functions should be called on a column with a value"),
        }
    }

    pub fn lt_num(&self, val: impl Into<DeciResult>) -> DeciResult {
        let val = val.into();
        match self {
            DeciResult::Column(items) => match &items.first() {
                Some(result) => match result {
                    DeciResult::Column(_) => {
                        DeciResult::Column(items.iter().map(|x| x.lt_num(val.clone())).collect())
                    }
                    _ => DeciResult::Column(
                        items
                            .iter()
                            .map(|x| DeciResult::Boolean(*x < val))
                            .collect(),
                    ),
                },
                None => DeciResult::Column(vec![]),
            },
            _ => panic!("Mask functions should be called on a column with a value"),
        }
    }

    pub fn le_num(&self, val: DeciResult) -> DeciResult {
        match self {
            DeciResult::Column(items) => match &items.first() {
                Some(result) => match result {
                    DeciResult::Column(_) => {
                        DeciResult::Column(items.iter().map(|x| x.le_num(val.clone())).collect())
                    }
                    _ => DeciResult::Column(
                        items
                            .iter()
                            .map(|x| DeciResult::Boolean(*x <= val))
                            .collect(),
                    ),
                },
                None => DeciResult::Column(vec![]),
            },
            _ => panic!("Mask functions should be called on a column with a value"),
        }
    }

    pub fn truthval(&self) -> bool {
        match self {
            DeciResult::Boolean(b) => *b,
            _ => panic!("Can't take truth value of non-boolean"),
        }
    }
    pub fn mask_with(&self, other: DeciResult) -> DeciResult {
        match (self, other) {
            (DeciResult::Column(items), DeciResult::Column(masks)) => {
                assert_eq!(items.len(), masks.len());
                match (items[0].clone(), masks[0].clone()) {
                    (_, DeciResult::Boolean(_)) => DeciResult::Column(
                        items
                            .iter()
                            .zip(masks.iter())
                            .filter_map(|(val, mask)| {
                                if mask.truthval() {
                                    Some(val.clone())
                                } else {
                                    None
                                }
                            })
                            .collect(),
                    ),
                    (DeciResult::Column(_), DeciResult::Column(_)) => {
                        assert_eq!(items.len(), masks.len());
                        DeciResult::Column(
                            items
                                .iter()
                                .zip(masks.iter())
                                .map(|(i, m)| i.mask_with(m.clone()))
                                .collect(),
                        )
                    }
                    _ => panic!("Must mask with boolean (or correct dimension column of booleans)"),
                }
            }
            _ => panic!("Can't mask a non-column"),
        }
    }

    pub fn sort(&mut self) -> DeciResult {
        match self {
            DeciResult::Column(items) => {
                items.sort();
                self.clone()
            }
            _ => self.clone(),
        }
    }
}
