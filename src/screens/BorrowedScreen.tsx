import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { supabase } from "../supabase";
import { useFocusEffect } from "@react-navigation/native";

type Borrowing = {
  id: number;
  from_user: string;
  item_name: string;
  quantity: number;
  date_given: string;
  date_due: string;
};

export default function BorrowedScreen() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("borrowings")
      .select("id, from_user, item_name, quantity, date_given, date_due")
      .eq("to_user", user?.email)
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
        <Text>No borrowed items</Text>
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
            You borrowed <Text style={styles.bold}>{item.item_name}</Text> from{" "}
            <Text style={styles.bold}>{item.from_user}</Text> in the quantity of{" "}
            <Text style={styles.bold}>{item.quantity}</Text> on{" "}
            {item.date_given} due {item.date_due}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fce4ec",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: { fontSize: 16 },
  bold: { fontWeight: "bold" },
});
