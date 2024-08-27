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
    in
    {
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            clang
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
        };
      });
    };
}
