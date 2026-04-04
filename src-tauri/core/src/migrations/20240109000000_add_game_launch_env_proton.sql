-- env: newline-separated KEY=VALUE pairs injected into the process environment.
-- proton_dir: path to a Proton installation directory
--             (e.g. ~/.steam/steam/steamapps/common/Proton - Experimental).
--             When set, the launch runs via `{proton_dir}/proton run {executable}`.
--             STEAM_COMPAT_CLIENT_INSTALL_PATH and STEAM_COMPAT_DATA_PATH are
--             derived automatically (steam root = proton_dir/../../../,
--             compatdata = steam_root/steamapps/compatdata/{steam_app_id} where
--             steam_app_id comes from game_library_entry.external_id).
--             Values set in `env` take precedence over these auto-derived ones.
ALTER TABLE game_launch ADD COLUMN env        TEXT;
ALTER TABLE game_launch ADD COLUMN proton_dir TEXT;
