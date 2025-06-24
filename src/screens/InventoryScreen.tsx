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
import { useFocusEffect } from "@react-navigation/native";

type InventoryItem = {
  id: number;
  item_name: string;
  quantity: number;
  available: boolean;
};

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  const fetchInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("owner_email", user?.email);

    if (!error && data) {
      setItems(data);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInventory();
    }, [])
  );

  const addItem = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!newItemName.trim() || !newItemQuantity.trim()) return;

    const quantityToAdd = parseInt(newItemQuantity);
    if (isNaN(quantityToAdd) || quantityToAdd < 1) return;

    const trimmedName = newItemName.trim();

    const { data: existingItems, error: fetchError } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("owner_email", user?.email)
      .eq("item_name", trimmedName)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError.message);
      return;
    }

    if (existingItems) {
      const newQuantity = existingItems.quantity + quantityToAdd;
      const { error: updateError } = await supabase
        .from("inventory")
        .update({
          quantity: newQuantity,
          available: newQuantity > 0,
        })
        .eq("id", existingItems.id);

      if (updateError) {
        console.error("Update error:", updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("inventory").insert({
        item_name: trimmedName,
        owner_email: user?.email,
        quantity: quantityToAdd,
        available: quantityToAdd > 0,
      });

      if (insertError) {
        console.error("Insert error:", insertError.message);
        return;
      }
    }

    setNewItemName("");
    setNewItemQuantity("1");
    setModalVisible(false);
    fetchInventory();
  };

  return (
    <View style={{ flex: 1 }}>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Text>No items in inventory</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.available && styles.unavailable]}>
              <Text style={styles.name}>
                {item.item_name} (x{item.quantity})
              </Text>
              <Text style={styles.status}>
                {item.available ? "Available" : "Not available"}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

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
            <TextInput
              placeholder="Quantity"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              style={styles.input}
              keyboardType="numeric"
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
