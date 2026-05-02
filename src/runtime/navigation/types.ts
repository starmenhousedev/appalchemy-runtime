// Stack-level routes. Each tab in the bottom bar gets its own copy of this
// stack, so deep-linking from a Banner tap inside the Home tab pushes onto
// Home's stack, not Cart's.

export type StackParamList = {
  Page: { pageId: number };
  ProductDetail: { handle: string };
  WebView: { url: string; title?: string };
  Login: undefined;
  Register: undefined;
};
