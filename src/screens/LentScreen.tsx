import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Button,
  Alert,
  RefreshControl,
} from "react-native";
import { supabase } from "../supabase";
import { useFocusEffect } from "@react-navigation/native";

type Borrowing = {
  id: number;
  to_user: string;
  item_name: string;
  date_given: string;
  date_due: string;
  returned: boolean;
};

export default function LentScreen() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("borrowings")
      .select("id, to_user, item_name, date_given, date_due, returned")
      .eq("from_user", user?.email)
      .eq("returned", false)
      .order("date_given", { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert("Error loading data", error.message);
    } else {
      setBorrowings(data || []);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
      return () => setLoading(true);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const markAsReturned = async (id: number) => {
    const { error } = await supabase
      .from("borrowings")
      .update({ returned: true })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message);
    } else {
      setBorrowings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (borrowings.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No active lent items</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={borrowings}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.text}>
            You lent <Text style={styles.bold}>{item.item_name}</Text> to{" "}
            <Text style={styles.bold}>{item.to_user}</Text> on {item.date_given}{" "}
            due {item.date_due}
          </Text>
          <Button
            title="Mark as returned"
            onPress={() => markAsReturned(item.id)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#e0f7fa",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: { fontSize: 16, marginBottom: 8 },
  bold: { fontWeight: "bold" },
});
