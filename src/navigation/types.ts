export type AuthStackParamList = {
  Login: undefined;
  OAuthWebView: { shop: string };
};

export type DesignStackParamList = {
  ThemeEditor: undefined;
  PageEditor: { themeId: number; pageId: number };
  SectionEditor: { pageId: number; sectionId: number };
  BottomBarEditor: { themeId: number };
  ThemeSettings: { themeId: number };
  ThemeCode: { themeId: number };
};

export type AnalyticsStackParamList = {
  Dashboard: undefined;
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
};

export type DrawerParamList = {
  Design: undefined;
  Analytics: undefined;
  Discounts: undefined;
  Push: undefined;
  More: undefined;
};
