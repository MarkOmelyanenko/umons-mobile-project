import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { supabase } from "../supabase";
import { Ionicons } from "@expo/vector-icons";

type InventoryItem = {
  id: number;
  item_name: string;
  available: boolean;
};

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const fetchInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("owner_email", user?.email)
      .eq("available", true);

    if (!error && data) {
      setItems(data);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addItem = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!newItemName.trim()) return;

    const { error } = await supabase.from("inventory").insert({
      item_name: newItemName.trim(),
      owner_email: user?.email,
    });

    if (!error) {
      setNewItemName("");
      setModalVisible(false);
      fetchInventory();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.available && styles.unavailable]}>
            <Text style={styles.name}>{item.item_name}</Text>
            <Text style={styles.status}>
              {item.available ? "Available" : "Not available"}
            </Text>
          </View>
        )}
      />

      {/* ➕ Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* ➕ Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TextInput
              placeholder="Item name"
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addItem}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  unavailable: { backgroundColor: "#f8d7da" },
  name: { fontSize: 16, fontWeight: "bold" },
  status: { color: "#666" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
