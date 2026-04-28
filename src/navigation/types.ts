import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  OAuthWebView: { shop: string };
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type DesignStackParamList = {
  ThemeEditor: undefined;
  PageEditor: { themeId: number; pageId: number };
  SectionEditor: { pageId: number; sectionId: number };
  BottomBarEditor: { themeId: number };
  ThemeSettings: { themeId: number };
  ThemeCode: { themeId: number };
  Preview: { themeId: number; pageId?: number };
};

export type AnalyticsStackParamList = {
  AnalyticsDashboard: undefined;
  ConversionFunnel: undefined;
  TopProducts: undefined;
};

export type DiscountsStackParamList = {
  DiscountList: undefined;
  DiscountForm: { discountId?: number };
};

export type PushStackParamList = {
  PushList: undefined;
  PushForm: { notificationId?: number };
  AutomatedPush: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  ManageThemes: undefined;
  ThemeCalendar: undefined;
  Integrations: undefined;
  IntegrationDetail: { provider: string };
  AppLinks: undefined;
  AppSettings: undefined;
  LaunchScreen: undefined;
  AppInfo: undefined;
  ManageUsers: undefined;
  UserForm: { userId?: number };
  Billing: undefined;
  Publish: undefined;
  MediaLibrary: undefined;
  ShopifyData: undefined;
  ThemeCatalog: undefined;
};

export type DrawerParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Design: NavigatorScreenParams<DesignStackParamList>;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Discounts: NavigatorScreenParams<DiscountsStackParamList>;
  Push: NavigatorScreenParams<PushStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends DrawerParamList {}
  }
}
