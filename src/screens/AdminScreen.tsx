import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../supabase";
import { supabaseAdmin } from "../supabaseAdmin";

interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

export default function AdminScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const loadUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setUsers(data || []);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!newPassword) {
      Alert.alert("Error", "Password is required");
      return;
    }

    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: newEmail.trim(),
        password: newPassword,
        email_confirm: true,
      });

    if (createError || !createdUser.user) {
      Alert.alert("Error", createError?.message || "User creation failed");
      return;
    }

    const userId = createdUser.user.id;

    const { error } = await supabase.from("users").insert({
      id: userId,
      email: newEmail.trim(),
      is_admin: newIsAdmin,
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setNewEmail("");
    setNewPassword("");
    setNewIsAdmin(false);
    loadUsers();
  };

  const deleteUser = async (id: string) => {
    // delete from your custom 'users' table
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);
    if (userError) {
      Alert.alert("Error", userError.message);
      return;
    }

    // delete from auth.users using service role
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Failed to delete from auth.users:", authError.message);
    }

    // update state
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.addContainer}>
        <TextInput
          placeholder="Email"
          value={newEmail}
          onChangeText={setNewEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
        />
        <View style={styles.switchContainer}>
          <Text>Admin</Text>
          <Switch value={newIsAdmin} onValueChange={setNewIsAdmin} />
        </View>
        <Button title="Add" onPress={addUser} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{item.email}</Text>
              <Text>{item.is_admin ? "Admin" : "User"}</Text>
            </View>
            <Button title="Delete" onPress={() => deleteUser(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  email: { fontWeight: "bold" },
});
