import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shopifyApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';

type Tab = 'products' | 'collections' | 'orders' | 'blogs';

const TABS: { key: Tab; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'collections', label: 'Collections' },
  { key: 'orders', label: 'Orders' },
  { key: 'blogs', label: 'Blogs' },
];

const PAGE_SIZE = 20;

const pickString = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) {
    const v = record[k];
    if (typeof v === 'string' && v) return v;
    if (typeof v === 'number') return String(v);
  }
  return '';
};

export function ShopifyDataScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [tab, setTab] = useState<Tab>('products');
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Order draft modal
  const [showDraft, setShowDraft] = useState(false);
  const [draftEmail, setDraftEmail] = useState('');
  const [draftLineItems, setDraftLineItems] = useState('');
  const [draftSaving, setDraftSaving] = useState(false);

  const fetch = useCallback(
    async (opts: { reset?: boolean } = {}) => {
      try {
        let data: Record<string, unknown>[] = [];
        if (tab === 'products') {
          data = (await shopifyApi.getProducts({
            page: 1,
            limit: PAGE_SIZE,
            query: search.trim() || undefined,
          })) as Record<string, unknown>[];
        } else if (tab === 'collections') {
          data = (await shopifyApi.getCollections()) as Record<string, unknown>[];
        } else if (tab === 'orders') {
          data = (await shopifyApi.listOrders({
            page: 1,
            limit: PAGE_SIZE,
          })) as Record<string, unknown>[];
        } else if (tab === 'blogs') {
          data = (await shopifyApi.getBlogs()) as Record<string, unknown>[];
        }
        setItems(Array.isArray(data) ? data : []);
        setPage(1);
      } catch {
        showToast('error', `Failed to load ${tab}`);
        if (opts.reset) setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tab, search, showToast],
  );

  useEffect(() => {
    setLoading(true);
    fetch({ reset: true });
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    setRefreshing(true);
    fetch();
  };

  const handleSearchSubmit = () => {
    setLoading(true);
    fetch({ reset: true });
  };

  const handleCreateDraftOrder = async () => {
    let line_items: unknown;
    try {
      line_items = JSON.parse(draftLineItems || '[]');
      if (!Array.isArray(line_items)) {
        throw new Error('line_items must be a JSON array');
      }
    } catch (err: any) {
      showToast('error', err?.message ?? 'line_items must be a JSON array');
      return;
    }
    if (!draftEmail.trim()) {
      showToast('error', 'Customer email is required');
      return;
    }
    setDraftSaving(true);
    try {
      await shopifyApi.createOrder({
        email: draftEmail.trim(),
        line_items,
      });
      setShowDraft(false);
      setDraftEmail('');
      setDraftLineItems('');
      showToast('success', 'Draft order created');
      if (tab === 'orders') fetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create order';
      showToast('error', msg);
    } finally {
      setDraftSaving(false);
    }
  };

  const renderRowFor = (item: Record<string, unknown>) => {
    if (tab === 'products') {
      const title = pickString(item, 'title', 'name');
      const handle = pickString(item, 'handle');
      const price = pickString(item, 'price', 'min_price');
      return {
        title: title || 'Untitled product',
        subtitle: handle ? `/${handle}` : undefined,
        meta: price ? `From ${price}` : undefined,
      };
    }
    if (tab === 'collections') {
      const title = pickString(item, 'title', 'name');
      const handle = pickString(item, 'handle');
      const count = item['products_count'];
      return {
        title: title || 'Untitled collection',
        subtitle: handle ? `/${handle}` : undefined,
        meta: typeof count === 'number' ? `${count} products` : undefined,
      };
    }
    if (tab === 'orders') {
      const name = pickString(item, 'name', 'order_number');
      const total = pickString(item, 'total_price', 'total');
      const customer = pickString(item, 'email', 'customer_email');
      const status = pickString(item, 'financial_status', 'status');
      return {
        title: name || 'Order',
        subtitle: customer || undefined,
        meta: total ? `${total}` : undefined,
        status,
      };
    }
    // blogs
    const title = pickString(item, 'title', 'name');
    const handle = pickString(item, 'handle');
    const articles = item['articles_count'];
    return {
      title: title || 'Blog',
      subtitle: handle ? `/${handle}` : undefined,
      meta: typeof articles === 'number' ? `${articles} articles` : undefined,
    };
  };

  const filtered = useMemo(() => {
    if (tab === 'products' || !search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(it => {
      const all = Object.values(it).map(v => (typeof v === 'string' ? v.toLowerCase() : ''));
      return all.some(v => v.includes(q));
    });
  }, [items, search, tab]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        tabsRow: {
          flexDirection: 'row',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.xs,
          gap: theme.spacing.xs,
        },
        tab: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surfaceSecondary,
          alignItems: 'center',
        },
        tabActive: { backgroundColor: theme.colors.primarySoft, borderWidth: 1.5, borderColor: theme.colors.primary },
        tabText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        tabTextActive: { color: theme.colors.primary },
        searchWrap: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm },
        list: {
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxxl + insets.bottom,
          gap: theme.spacing.sm,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
          gap: 4,
        },
        cardTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        cardSubtitle: { ...theme.typography.caption, color: theme.colors.textSecondary },
        cardMetaRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        },
        cardMeta: { ...theme.typography.captionMedium, color: theme.colors.primary },
        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'flex-end',
        },
        modalCard: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          paddingBottom: theme.spacing.xl + insets.bottom,
          maxHeight: '85%',
        },
        modalTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.md,
        },
        helper: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 4 },
      }),
    [theme, insets.bottom],
  );

  const showCreateOrder = tab === 'orders';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Shopify Data"
        subtitle={`${filtered.length} ${tab}`}
        onBack={() => navigation.goBack()}
        right={
          showCreateOrder ? (
            <ActionButton
              label="+ Draft order"
              size="sm"
              onPress={() => setShowDraft(true)}
            />
          ) : undefined
        }
      />

      <View style={styles.tabsRow}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => {
                setSearch('');
                setTab(t.key);
              }}
              activeOpacity={0.85}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmit={handleSearchSubmit}
          placeholder={`Search ${tab}…`}
        />
      </View>

      {loading ? (
        <LoadingState message={`Loading ${tab}…`} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, idx) =>
            String(
              item['id'] ??
                item['admin_graphql_api_id'] ??
                (pickString(item, 'handle', 'name') || idx),
            )
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="◇"
              title={`No ${tab} found`}
              description={
                tab === 'products' || tab === 'orders'
                  ? `Connect your Shopify store and ensure ${tab} exist.`
                  : `Couldn't fetch ${tab} from Shopify.`
              }
            />
          }
          renderItem={({ item }) => {
            const row = renderRowFor(item);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => {
                  Alert.alert(
                    row.title,
                    JSON.stringify(item, null, 2).slice(0, 1500),
                    [{ text: 'OK' }],
                    { cancelable: true },
                  );
                }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {row.title}
                </Text>
                {row.subtitle ? (
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {row.subtitle}
                  </Text>
                ) : null}
                <View style={styles.cardMetaRow}>
                  {row.meta ? <Text style={styles.cardMeta}>{row.meta}</Text> : <View />}
                  {tab === 'orders' && (row as any).status ? (
                    <StatusBadge label={(row as any).status} tone="info" />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal
        visible={showDraft}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDraft(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create draft order</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Input
                label="Customer email"
                value={draftEmail}
                onChangeText={setDraftEmail}
                placeholder="customer@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Line items (JSON)"
                value={draftLineItems}
                onChangeText={setDraftLineItems}
                placeholder='[{"variant_id":12345,"quantity":1}]'
                multiline
                numberOfLines={4}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helper}>
                Provide a JSON array of line items. The Shopify endpoint will be called as-is.
              </Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setShowDraft(false)} />
              <ActionButton
                label="Create"
                loading={draftSaving}
                onPress={handleCreateDraftOrder}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
