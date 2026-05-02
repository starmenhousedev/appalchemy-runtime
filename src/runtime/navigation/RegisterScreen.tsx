import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCustomer } from "../customer/CustomerContext";
import type { StackParamList } from "./types";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  marginBottom: 12,
};

export function RegisterScreen() {
  const { register } = useCustomer();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    const res = await register({
      email: email.trim(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      // Pop both Register and the preceding Login off the stack.
      navigation.getParent()?.goBack();
      return;
    }
    setError(res.errors[0]?.message ?? "Couldn't create account.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}>
          Create account
        </Text>
        <Text style={{ color: "#666", marginBottom: 24 }}>
          Speed up checkout, save addresses, and view order history.
        </Text>

        <TextInput
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="given-name"
          style={inputStyle}
        />
        <TextInput
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
          autoComplete="family-name"
          style={inputStyle}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={inputStyle}
        />
        <TextInput
          placeholder="Password (min 8 chars)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          style={inputStyle}
        />

        {error && (
          <Text style={{ color: "#b91c1c", marginBottom: 8, fontSize: 13 }}>{error}</Text>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={submitting || !email || password.length < 8}
          style={{
            backgroundColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
            opacity: submitting || !email || password.length < 8 ? 0.5 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Create account</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
