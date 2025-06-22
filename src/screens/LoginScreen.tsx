import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { supabase } from "../supabase";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    const { error } = isSigningUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert("Authentication error", error.message);
    } else {
      navigation.replace("AppTabs"); // go to tabs after login
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSigningUp ? "Sign Up" : "Log In"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title={isSigningUp ? "Sign Up" : "Log In"} onPress={handleAuth} />
      <Text style={styles.switch} onPress={() => setIsSigningUp(!isSigningUp)}>
        {isSigningUp
          ? "Already have an account? Log in"
          : "No account? Sign up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  switch: { color: "blue", marginTop: 15, textAlign: "center" },
});
