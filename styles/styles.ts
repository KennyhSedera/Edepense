import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContent: {
    padding: 10,
    paddingBottom: 30,
  },

  big: {
    fontSize: 20,
    fontWeight: "bold",
  },

  progressBar: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },

  buttonSecondary: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTextMode: {
    height: 10,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#000"
  },

  textMode: {
    textAlign: "center",
    fontWeight: "medium",
    margin: 5,
    fontSize: 14
  },


  logo: {
    width: 32,
    height: 32,
    borderRadius: 100,
    objectFit: "cover",
    backgroundColor: "white",
    padding: 4,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },

  overlay: {
    flex: 1,
    backgroundColor: "#00000091",
  },

  blur: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modal: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    padding: 20,
  },

  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  previewImage: {
    width: "100%",
    minHeight: 160,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  smallButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center"
  },

  orText: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 10,
  },

  urlRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  urlInput: {
    flex: 1,
    marginRight: 8,
  },

  container: {
    flex: 1,
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },

  removeButton: {
    marginLeft: "auto",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center"
  },

  iconButton: {
    padding: 4,
  },

  dateButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
    justifyContent: "center"
  },

  addItemButton: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  itemLineTotal: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
  },

  itemNumbersRow: {
    flexDirection: "row",
  },

  section: {
    fontSize: 15,
    fontWeight: "700",
  },

  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  itemsTotal: {
    fontSize: 13,
    fontWeight: "600",
  },

  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  selectedDateText: {
    fontSize: 12,
    marginTop: 8,
  },

  form: {
    padding: 16,
    gap: 8,
    borderRadius: 10,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  total: {
    fontSize: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },

  card: {
    width: "49%",
    borderRadius: 12,
    padding: 0,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },

  cardContent: {
    paddingHorizontal: 12,
    marginBottom: 10
  },

  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
  },

  name: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },

  category: {
    color: "#94a3b8",
    fontSize: 12,
  },

  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#22c55e",
  },

  date: {
    fontSize: 12,
    opacity: 0.7,
  },

  itemsBox: {
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },

  itemsTitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 3,
  },

  itemText: {
    color: "#cbd5e1",
    fontSize: 11,
  },

  fab: {
    position: "absolute",
    bottom: 10,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },

    elevation: 4,
    zIndex: 1,
  },

  fabText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },

  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
  },

  miniButton: {
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  text: {
    fontSize: 14,
  },

  separator: {
    marginVertical: 20,
    height: 1,
    width: "100%",
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8
  },
  loadingText: {
    color: '#666'
  },
  actions: {
    flexDirection: "column",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 10,
    right: 5,
    gap: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10
  },

  empty: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
    paddingVertical: 40,
    height: "auto",
    marginVertical: 8,
    borderWidth: 1,
    gap: 10,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "medium",
    textAlign: "center",
    marginTop: 10
  },

  field: {
    marginBottom: 14,
  },

  fieldCompact: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
  },

  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 5,
  },

  infoGridHalf: {
    width: "49%",
    marginBottom: 12,
  },

  infoGridFull: {
    width: "100%",
    marginBottom: 12,
    padding: 12
  },

  miniCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },

  rawTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    maxHeight: 200
  },

  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
});