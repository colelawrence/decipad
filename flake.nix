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
              version = "1.48.0";
              sha256 = "sha256-uay2XLmX9+/6OI0i7OP/Y1exWtUt37FVuOAl5/7jClo=";
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
            chromium
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
