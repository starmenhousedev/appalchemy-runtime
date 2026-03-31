export type BuildPlatform = 'android' | 'ios' | 'both';
export type BuildStatus = 'queued' | 'building' | 'completed' | 'failed';

export interface Build {
  id: number;
  shop_id: number;
  imported_theme_id: number;
  platform: BuildPlatform;
  status: BuildStatus;
  version: string;
  build_number: number;
  apk_url: string | null;
  aab_url: string | null;
  ipa_url: string | null;
  error_log: string | null;
  completed_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublishStatus {
  latest_build: Build | null;
  play_store_status: string | null;
  app_store_status: string | null;
}
