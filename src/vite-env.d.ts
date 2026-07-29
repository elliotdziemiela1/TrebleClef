/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly SERVER_URL: sting
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
