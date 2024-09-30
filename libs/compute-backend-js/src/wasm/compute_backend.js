
import * as wasm from "./compute_backend_bg.wasm";
import { __wbg_set_wasm } from "./compute_backend_bg.js";
__wbg_set_wasm(wasm);
export * from "./compute_backend_bg.js";
