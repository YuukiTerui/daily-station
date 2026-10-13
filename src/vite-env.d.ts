/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STATION_NAME?: string;
  readonly VITE_LATITUDE?: string;
  readonly VITE_LONGITUDE?: string;
  readonly VITE_TIMEZONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
