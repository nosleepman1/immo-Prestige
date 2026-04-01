import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // TODO: connecter à votre backend
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 1000);
  };

  const handleGoogleSignup = () => {
    // TODO: expo-auth-session Google OAuth
    console.log("Google signup");
  };

  const handleFacebookSignup = () => {
    // TODO: expo-auth-session Facebook OAuth
    console.log("Facebook signup");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1a1a2e" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez ImmoConnect dès aujourd'hui</Text>
          </View>

          {/* Social Quick Signup */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleSignup}
              activeOpacity={0.8}
            >
              <AntDesign name="google" size={20} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleFacebookSignup}
              activeOpacity={0.8}
            >
              <FontAwesome name="facebook" size={20} color="#1877F2" />
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou avec email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Téléphone (optionnel)"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            {/* Password hint */}
            <Text style={styles.hint}>Minimum 8 caractères</Text>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Inscription..." : "Créer mon compte"}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              En vous inscrivant, vous acceptez nos{" "}
              <Text style={styles.termsLink}>Conditions d'utilisation</Text>
              {" "}et notre{" "}
              <Text style={styles.termsLink}>Politique de confidentialité</Text>
            </Text>
          </View>

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.switchLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f4ff" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  backBtn: {
    marginTop: 12,
    marginBottom: 8,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  header: { marginBottom: 28, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#6b7280", marginTop: 6 },

  socialRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  socialBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#374151" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { fontSize: 13, color: "#9ca3af", fontWeight: "500" as const },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#1a1a2e" },
  eyeBtn: { padding: 4 },
  hint: { fontSize: 12, color: "#9ca3af", marginBottom: 20, marginLeft: 2 },

  primaryBtn: {
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold", letterSpacing: 0.3 },

  terms: { fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 18 },
  termsLink: { color: "#6366f1", fontWeight: "600" as const },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  switchText: { fontSize: 14, color: "#6b7280" },
  switchLink: { fontSize: 14, color: "#1a1a2e", fontWeight: "bold" },
});
