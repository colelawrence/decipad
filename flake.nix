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
      rustToolchain = eachSystem (pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml);
      playwright-browsers = eachSystem(pkgs: ((pkgs.callPackage ./driver.nix {inherit pkgs;}) {
              version = "1.49.0";
              sha256 = "sha256-o7k6HcZghQs9OLz1ZiR3jrqzMIrh1aaD+rv19EY/A9k=";
             }));
    in
    {
      devShells = eachSystem (pkgs:
      let
        browsers = playwright-browsers.${pkgs.system};
        tmux-script = pkgs.writeShellApplication {
          name = "decimux";
          runtimeInputs = with pkgs; [tmux];

          text = ''
            FLAKE_ROOT="$(git rev-parse --show-toplevel)"
            cd "$FLAKE_ROOT"
            sn=decipad
            tmux new-session -s "$sn" -n frontend -d yarn serve:frontend
            tmux new-window -t "$sn:2" -n backend yarn serve:backend
            tmux new-window -t "$sn:3" -n typecheck yarn typecheck:watch
            cd apps/compute-backend
            tmux new-window -t "$sn:4" -n bacon bacon
            tmux select-window -t "$sn:3"
            tmux -2 attach-session -t "$sn"
          '';
        };
      in {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            clang
            browsers
            chromedriver
            prettierd

            tmux-script
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
            cargo-expand
            wasm-pack
            wabt
            bacon
          ];
          RUST_SRC_PATH = "${rustToolchain.${pkgs.system}}/lib/rustlib/src/rust/library";
          PLAYWRIGHT_BROWSERS_PATH = "${browsers}";
          CHROMEDRIVER = "${pkgs.chromedriver}/bin/chromedriver";
        };
      });
    };
}
