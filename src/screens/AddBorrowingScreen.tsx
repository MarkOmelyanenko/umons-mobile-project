import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function AddBorrowingScreen() {
  const navigation = useNavigation();
  const [toUser, setToUser] = useState("");
  const [itemName, setItemName] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [dateDue, setDateDue] = useState("");

  const [inventory, setInventory] = useState<string[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", userError?.message || "User not found");
        setLoadingInventory(false);
        return;
      }

      const { data, error } = await supabase
        .from("inventory")
        .select("item_name")
        .eq("owner_email", user.email)
        .eq("available", true);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setInventory(data.map((item) => item.item_name));
      }

      setLoadingInventory(false);
    };

    fetchInventory();
  }, []);

  const handleSubmit = async () => {
    if (!toUser || !itemName || !dateGiven) {
      Alert.alert("Missing fields", "Please fill in all required fields");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email === toUser.trim()) {
      Alert.alert("Invalid borrowing", "You cannot lend an item to yourself.");
      return;
    }

    const { error } = await supabase.from("borrowings").insert([
      {
        from_user: user?.email,
        to_user: toUser.trim(),
        item_name: itemName,
        date_given: dateGiven,
        date_due: dateDue || null,
        returned: false,
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      if (user && user.email) {
        const { error: updateError } = await supabase
          .from("inventory")
          .update({ available: false })
          .eq("owner_email", user.email)
          .eq("item_name", itemName);
      }
      Alert.alert("Success", "Borrowing added!");
      navigation.goBack();
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>To (user email)</Text>
      <TextInput style={styles.input} value={toUser} onChangeText={setToUser} />

      <Text style={styles.label}>Item</Text>
      {loadingInventory ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={itemName}
            onValueChange={(value) => setItemName(value)}
          >
            <Picker.Item label="Select an item..." value="" />
            {inventory.map((item, idx) => (
              <Picker.Item key={idx} label={item} value={item} />
            ))}
          </Picker>
        </View>
      )}

      <Text style={styles.label}>Date given (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={dateGiven}
        onChangeText={setDateGiven}
      />

      <Text style={styles.label}>Date due</Text>
      <TextInput
        style={styles.input}
        value={dateDue}
        onChangeText={setDateDue}
      />

      <Button title="Add Borrowing" onPress={handleSubmit} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  label: { fontWeight: "bold", marginBottom: 4 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 6,
    // padding: 10,
  },
});
