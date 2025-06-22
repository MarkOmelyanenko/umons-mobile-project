import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../supabase";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BorrowingCard from "../components/BorrowingCard";

type Borrowing = {
  id: number;
  from_user: string;
  to_user: string;
  item_name: string;
  date_given: string;
  date_due?: string | null;
  returned: boolean;
};

export default function AllScreen() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadData = async () => {
    const { data, error } = await supabase
      .from("borrowings")
      .select("*")
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

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : borrowings.length === 0 ? (
        <View style={styles.center}>
          <Text>No borrowings found</Text>
        </View>
      ) : (
        <FlatList
          data={borrowings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <BorrowingCard
              borrowing={item}
              currentUser=""
              backgroundColor="#ffffff"
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddBorrowing" as never)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
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
});
