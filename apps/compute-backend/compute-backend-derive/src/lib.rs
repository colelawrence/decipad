use proc_macro2::{Ident, Span};
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_attribute]
/// This only exists because rust-analyzer is cringe and isn't ignoring tsify's
/// derive output (even though it tags everything with #[automatically_derived])
/// https://github.com/rust-lang/rust-analyzer/issues/8747
pub fn suppress_derive_case_warnings(
    _attr: proc_macro::TokenStream,
    input: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let parsed = parse_macro_input!(input as DeriveInput);
    let name = &parsed.ident;
    let vis = &parsed.vis;

    let mod_name = Ident::new(&format!("__tsify_mod_{}", name), Span::call_site());

    let expanded = quote! {
        #[allow(non_snake_case)]
        #[automatically_derived]
        mod #mod_name {
            use super::*;

            #parsed
        }
        #vis use #mod_name::#name;
    };

    expanded.into()
}
