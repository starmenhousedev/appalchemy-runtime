import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
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

export function LoginScreen() {
  const { login, recover } = useCustomer();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);
    if (res.ok) {
      navigation.goBack();
      return;
    }
    setError(res.errors[0]?.message ?? "Login failed.");
  }

  async function onRecover() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email first, then tap Forgot password.");
      return;
    }
    const res = await recover(email.trim());
    if (res.ok) {
      setInfo("Check your inbox for a password reset link.");
    } else {
      setError(res.errors[0]?.message ?? "Couldn't send reset link.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}>
          Welcome back
        </Text>
        <Text style={{ color: "#666", marginBottom: 24 }}>
          Log in to track orders, manage your wishlist, and check out faster.
        </Text>

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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          style={inputStyle}
        />

        {error && (
          <Text style={{ color: "#b91c1c", marginBottom: 8, fontSize: 13 }}>{error}</Text>
        )}
        {info && (
          <Text style={{ color: "#15803d", marginBottom: 8, fontSize: 13 }}>{info}</Text>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={submitting || !email || !password}
          style={{
            backgroundColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
            opacity: submitting || !email || !password ? 0.5 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Log in</Text>
          )}
        </Pressable>

        <Pressable onPress={onRecover} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ color: "#008060", fontSize: 13 }}>Forgot password?</Text>
        </Pressable>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 24 }} />

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{
            borderWidth: 1,
            borderColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#008060", fontWeight: "600" }}>Create an account</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
