import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  scrollContent: { padding: 10, paddingBottom: 30 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  overlay: { flex: 1, backgroundColor: "#00000091" },
  blur: { flex: 1, justifyContent: "flex-end" },
  separator: { marginVertical: 20, height: 1, width: "100%" },

  // Row / flex helpers
  rowSpacing: { justifyContent: "space-between", flexDirection: "row", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  urlRow: { flexDirection: "row", alignItems: "center" },
  itemNumbersRow: { flexDirection: "row" },
  itemTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  itemsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 5 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 6, gap: 5 },
  infoGridHalf: { width: "49%", marginBottom: 12 },
  infoGridFull: { width: "100%", marginBottom: 12, padding: 12 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  // Cards
  card: { width: "49%", borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
  cardContent: { paddingHorizontal: 12, marginBottom: 10 },
  itemCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginVertical: 10 },
  miniCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  metricCard: { flex: 1, borderRadius: 8, borderWidth: 0.5, padding: 14 },
  cardTextMode: { height: 10, width: "100%", borderRadius: 12, backgroundColor: "#000" },
  cardModeContent: { height: "auto", width: "100%", borderRadius: 12, backgroundColor: "#ffffffa1", paddingHorizontal: 10, paddingVertical: 15, justifyContent: "space-between", alignItems: "stretch", gap: 5 },
  cardMode: { height: "auto", padding: 3, borderRadius: 12, width: "100%" },
  linearMode: { height: 200, borderRadius: 6, padding: 10, justifyContent: "center", alignItems: "center", gap: 15 },

  // Profile header
  headerBg: { height: 80 },
  headerBody: { padding: 20, paddingTop: 12, alignItems: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EAF3DE", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#639922" },
  badgeText: { fontSize: 12, color: "#3B6D11" },

  // Avatar
  avatar: { width: 45, height: 45, borderRadius: 100, borderWidth: 1, backgroundColor: "#fff", overflow: "hidden" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "500", color: "#fff" },

  // Form
  form: { padding: 16, gap: 8, borderRadius: 10, marginBottom: 10 },
  field: { marginBottom: 14 },
  fieldCompact: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 10 : 8, fontSize: 15 },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  rawTextArea: { minHeight: 100, textAlignVertical: "top", maxHeight: 200 },
  urlInput: { flex: 1, marginRight: 8 },
  modal: { borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: "hidden", padding: 20 },

  // Buttons
  button: { height: 50, borderRadius: 10, justifyContent: "center", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 12 },
  miniButton: { height: 40, borderRadius: 10, justifyContent: "center", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  buttonSecondary: { padding: 15, borderRadius: 10, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
  confirmButton: { backgroundColor: "#000", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  smallButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignItems: "center", justifyContent: "center" },
  dateButton: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", marginRight: 8, justifyContent: "center" },
  addItemButton: { flexDirection: "row", borderWidth: 1.5, borderStyle: "dashed", borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  removeButton: { marginLeft: "auto", padding: 10, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  iconButton: { padding: 4 },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  dateButtonText: { fontSize: 13, fontWeight: "600" },

  // FAB
  fab: { position: "absolute", bottom: 10, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 4, zIndex: 1 },
  fabText: { fontSize: 30, color: "#fff", fontWeight: "bold" },
  actions: { flexDirection: "column", justifyContent: "space-between", position: "absolute", bottom: 10, right: 5, gap: 10, paddingVertical: 5, paddingHorizontal: 5, borderRadius: 10 },

  // Items list
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  itemImage: { width: 48, height: 48, borderRadius: 10, borderWidth: 1 },
  itemImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemQty: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 15, fontWeight: "700", marginLeft: 12 },
  itemLineTotal: { fontSize: 13, fontWeight: "700", textAlign: "right", marginTop: 4 },
  itemsTotal: { fontSize: 13, fontWeight: "600" },
  itemsBox: { marginTop: 8, paddingTop: 5, borderTopWidth: 1, borderTopColor: "#334155" },
  itemsTitle: { color: "#94a3b8", fontSize: 12, marginBottom: 3 },
  itemText: { color: "#cbd5e1", fontSize: 11 },

  // Image
  image: { width: "100%", height: 100, borderRadius: 10, borderWidth: 1, backgroundColor: "#fff", overflow: "hidden" },
  previewImage: { width: "100%", minHeight: 160, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  logo: { width: 32, height: 32, borderRadius: 100, objectFit: "cover", backgroundColor: "white", padding: 4 },

  // Typography
  big: { fontSize: 20, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold" },
  section: { fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 11, fontWeight: "500", letterSpacing: 0.8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  value: { fontSize: 16, fontWeight: "600" },
  metricLabel: { fontSize: 12, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: "500" },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "500" },
  name: { marginTop: 5, fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 13, marginBottom: 10 },
  category: { color: "#94a3b8", fontSize: 12 },
  price: { fontSize: 18, fontWeight: "600", color: "#22c55e" },
  date: { fontSize: 12, opacity: 0.7 },
  selectedDateText: { fontSize: 12, marginTop: 8 },
  total: { fontSize: 16 },
  text: { fontSize: 14 },
  textMode: { textAlign: "center", fontWeight: "medium", margin: 5, fontSize: 14 },
  orText: { fontSize: 12, textAlign: "center", marginVertical: 10 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingTop: 10, alignItems: "center", paddingHorizontal: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white" },
  headerAnimated: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden", zIndex: 100, paddingHorizontal: 20, paddingBottom: 16, justifyContent: "flex-end", marginBottom: 10, },

  // Misc
  progressBar: { height: 10, borderRadius: 10, overflow: "hidden", marginVertical: 10 },
  empty: { justifyContent: "center", alignItems: "center", borderRadius: 12, padding: 20, paddingVertical: 40, marginVertical: 8, borderWidth: 1, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "medium", textAlign: "center", marginTop: 10 },
  loadingContainer: { alignItems: "center", paddingVertical: 24, gap: 8 },
  loadingText: { color: "#666" },
});