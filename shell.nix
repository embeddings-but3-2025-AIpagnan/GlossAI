{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    nodejs_22
    python3

    pkg-config
    gtk3
    libsoup_3
    webkitgtk_4_1
  ];
}
