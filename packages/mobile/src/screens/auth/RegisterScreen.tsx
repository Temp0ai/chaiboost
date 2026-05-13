import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { validateEmail, validatePhone, validatePassword, validateName } from '../../utils/validators';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading, error, clearError } = useAuth();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error!;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) newErrors.email = emailValidation.error!;

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) newErrors.phone = phoneValidation.error!;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) newErrors.password = passwordValidation.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    try {
      const result = await register({ name, email, phone, password });
      navigation.navigate('OTPVerify', { phone: result.phone });
    } catch (err: any) {
      Alert.alert('Registration Failed', error || 'Please try again.');
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: string,
    key: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      secureTextEntry?: boolean;
      autoCapitalize?: 'none' | 'words' | 'sentences';
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, errors[key] && styles.inputError]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setErrors((prev) => ({ ...prev, [key]: '' }));
          }}
          keyboardType={options?.keyboardType || 'default'}
          secureTextEntry={options?.secureTextEntry}
          autoCapitalize={options?.autoCapitalize || 'none'}
          autoCorrect={false}
        />
        {key === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Create Account" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Join ChaiBoost ☕</Text>
            <Text style={styles.subtitle}>
              Start growing your chai business with AI
            </Text>
          </View>

          <View style={styles.form}>
            {renderInput('Full Name', name, setName, 'Enter your name', 'account-outline', 'name', {
              autoCapitalize: 'words',
            })}
            {renderInput('Email', email, setEmail, 'Enter your email', 'email-outline', 'email', {
              keyboardType: 'email-address',
            })}
            {renderInput('Phone', phone, setPhone, 'Enter your phone number', 'phone-outline', 'phone', {
              keyboardType: 'phone-pad',
            })}
            {renderInput('Password', password, setPassword, 'Create a password', 'lock-outline', 'password', {
              secureTextEntry: !showPassword,
            })}

            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.registerButton}
            />

            {error && <Text style={styles.apiError}>{error}</Text>}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    height: 52,
    gap: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    height: '100%',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  apiError: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});
