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
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../supabase";
import BorrowingCard from "../components/BorrowingCard";

type Borrowing = {
  id: number;
  from_user: string;
  to_user: string;
  item_name: string;
  date_given: string;
  date_due?: string;
  returned: boolean;
};

export default function ArchiveScreen() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const loadData = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      Alert.alert("Error getting user", userError.message);
      return;
    }

    const userEmail = user?.email || null;
    setCurrentUser(userEmail);

    if (!userEmail) {
      setBorrowings([]);
      return;
    }

    const { data, error } = await supabase
      .from("borrowings")
      .select("*")
      .eq("returned", true)
      .or(`from_user.eq.${userEmail},to_user.eq.${userEmail}`)
      .order("date_given", { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert("Error loading archive", error.message);
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
        <Text>No archived borrowings</Text>
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
        <BorrowingCard borrowing={item} currentUser={currentUser || ""} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  card: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardLent: {
    backgroundColor: "#e0f7fa", // синій відтінок
  },
  cardBorrowed: {
    backgroundColor: "#fce4ec", // червоний/рожевий відтінок
  },
  text: { fontSize: 16 },
  bold: { fontWeight: "bold" },
});
