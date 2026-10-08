/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_ID?: string;
  readonly VITE_DISPLAY?: string;
  readonly VITE_FRAME_ASPECT_RATIO?: string;
  readonly VITE_SUBJECT_HEIGHT_TARGET?: string;
  readonly VITE_SUBJECT_TOP_MARGIN_TARGET?: string;
  readonly VITE_CAMERA_ROTATION_DEG?: string;
  readonly VITE_CAMERA_DEVICE_LABEL?: string;
  readonly VITE_KIOSK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
