{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    nodejs_22
    python3

    pkg-config
    gtk3
    libsoup_3
    webkitgtk_4_1
    openssl

    gsettings-desktop-schemas
    kdePackages.xdg-desktop-portal-kde
    gvfs
  ];
  shellHook = ''
    export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS"
    export GIO_EXTRA_MODULES="${pkgs.gvfs}/lib/gio/modules"
  '';
}
