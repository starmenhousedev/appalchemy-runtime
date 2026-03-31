export interface LaunchScreen {
  launch_screen_type: 'image' | 'video';
  launch_screen_url: string | null;
}

export interface AppInfo {
  app_id: string | null;
  firebase_project_id: string | null;
  android_package_name: string | null;
  ios_bundle_id: string | null;
  ios_team_id: string | null;
}
