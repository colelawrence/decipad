use num::Zero;

use super::types::{DeciFloat, DeciFrac};

impl Zero for DeciFloat {
    fn zero() -> DeciFloat {
        DeciFloat {
            val: 0.0,
            inf: false,
            und: false,
        }
    }

    fn is_zero(&self) -> bool {
        if self.val == 0.0 && !self.inf && !self.und {
            return true;
        }
        return false;
    }
}

impl Zero for DeciFrac {
    fn zero() -> DeciFrac {
        DeciFrac {
            n: 0,
            d: 1,
            inf: false,
            und: false,
        }
    }

    fn is_zero(&self) -> bool {
        if self.n == 0 && self.d != 0 && !self.inf && !self.und {
            return true;
        }
        return false;
    }
}
