import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Text } from "react-native";
import { supabase } from "../supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import LentScreen from "../screens/LentScreen";
import BorrowedScreen from "../screens/BorrowedScreen";
import AllScreen from "../screens/AllScreen";
import AddBorrowingScreen from "../screens/AddBorrowingScreen";
import { RootStackParamList } from "./types";
import ArchiveScreen from "../screens/ArchiveScreen";
import InventoryScreen from "../screens/InventoryScreen";
import AdminScreen from "../screens/AdminScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!error && data?.is_admin) {
        setIsAdmin(true);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerRight: () => (
          <Text
            style={{ marginRight: 16, color: "blue" }}
            onPress={async () => {
              await supabase.auth.signOut();
            }}
          >
            Log out
          </Text>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "All") {
            iconName = "list-outline";
          } else if (route.name === "Lent") {
            iconName = "arrow-up-circle-outline";
          } else if (route.name === "Borrowed") {
            iconName = "arrow-down-circle-outline";
          } else if (route.name === "Archive") {
            iconName = "archive-outline";
          } else if (route.name === "Inventory") {
            iconName = "cube-outline";
          } else if (route.name === "Admin") {
            iconName = "settings-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="All" component={AllScreen} />
      <Tab.Screen name="Lent" component={LentScreen} />
      <Tab.Screen name="Borrowed" component={BorrowedScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          tabBarLabel: "Archive",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" color={color} size={size} />
          ),
        }}
      />
      {isAdmin && <Tab.Screen name="Admin" component={AdminScreen} />}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="AppTabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddBorrowing" component={AddBorrowingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
