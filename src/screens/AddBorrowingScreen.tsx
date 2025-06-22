import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

export default function AddBorrowingScreen() {
  const navigation = useNavigation();
  const [toUser, setToUser] = useState("");
  const [itemName, setItemName] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [dateDue, setDateDue] = useState("");

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
      Alert.alert("Success", "Borrowing added!");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>To (user email)</Text>
      <TextInput style={styles.input} value={toUser} onChangeText={setToUser} />

      <Text style={styles.label}>Item name</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  label: { fontWeight: "bold", marginBottom: 4 },
});
