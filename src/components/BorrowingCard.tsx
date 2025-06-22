// components/BorrowingCard.tsx
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

type Borrowing = {
  id: number;
  from_user: string;
  to_user: string;
  item_name: string;
  date_given: string;
  date_due?: string | null;
  returned: boolean;
};

type Props = {
  borrowing: Borrowing;
  currentUser: string;
  onMarkReturned?: (id: number) => void;
  backgroundColor?: string;
};

export default function BorrowingCard({
  borrowing,
  currentUser,
  onMarkReturned,
  backgroundColor,
}: Props) {
  const isLent = borrowing.from_user === currentUser;

  const cardColor = backgroundColor
    ? backgroundColor
    : isLent
    ? "#e0f7fa"
    : "#ffebee";

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <Text style={styles.text}>
        <Text style={styles.bold}>{borrowing.from_user}</Text> →{" "}
        <Text style={styles.bold}>{borrowing.to_user}</Text>
      </Text>
      <Text style={styles.text}>
        Item: <Text style={styles.bold}>{borrowing.item_name}</Text>
      </Text>
      <Text style={styles.text}>Given: {borrowing.date_given}</Text>
      {borrowing.date_due && (
        <Text style={styles.text}>Due: {borrowing.date_due}</Text>
      )}
      {onMarkReturned && !borrowing.returned && (
        <Button
          title="Mark as returned"
          onPress={() => onMarkReturned(borrowing.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: { fontSize: 16 },
  bold: { fontWeight: "bold" },
});
