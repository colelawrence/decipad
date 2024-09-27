{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    systems.url = "github:nix-systems/default";
  };

  outputs =
    { systems, nixpkgs, ... }@inputs:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (
        system:
        f (
          import nixpkgs {
            inherit system;
            overlays = [inputs.rust-overlay.overlays.default];
          }
        )
      );
      # latest stable rust, with wasm target + rust-src extension
      rustToolchain = eachSystem (pkgs: pkgs.rust-bin.stable.latest.default.override {
        extensions = ["rust-src"];
        targets = ["wasm32-unknown-unknown"];
      });
      playwright-browsers = eachSystem(pkgs: ((pkgs.callPackage ./driver.nix {inherit pkgs;}) {
              version = "1.47.0";
              sha256 = "sha256-cKjVDy1wFo8NlF8v+8YBuQUF2OUYjCmv27uhEoVUrno=";
             }));
    in
    {
      devShells = eachSystem (pkgs:
      let
        browsers = playwright-browsers.${pkgs.system};
      in {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            clang
            browsers
            # Use mold when we are runnning in Linux
            (lib.optionals stdenv.isLinux mold)
          ];
          buildInputs = with pkgs; [
            nodejs
            yarn

            nodePackages.typescript
            nodePackages.typescript-language-server

            rustToolchain.${pkgs.system}
            rust-analyzer-unwrapped
            cargo
            wasm-pack
            wabt
          ];
          RUST_SRC_PATH = "${rustToolchain.${pkgs.system}}/lib/rustlib/src/rust/library";
          PLAYWRIGHT_BROWSERS_PATH = "${browsers}";
        };
      });
    };
}
