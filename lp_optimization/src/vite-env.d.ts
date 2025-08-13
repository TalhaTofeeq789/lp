/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Add more env variables types here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
