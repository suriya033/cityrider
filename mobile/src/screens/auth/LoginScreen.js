import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Snackbar,
  Avatar,
  Card,
} from 'react-native-paper';
import { authAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      setError('');

      if (!email || !email.trim()) {
        setError('Please enter your email or User ID');
        return;
      }

      if (!password) {
        setError('Please enter your password');
        return;
      }

      setLoading(true);

      const response = await authAPI.login({
        email: email.trim(),
        password
      });

      if (response && response.data) {
        const { token, user } = response.data;

        if (token && user) {
          await signIn(token, user);
        } else {
          setError('Invalid response from server. Please try again.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (err && err.message) {
        errorMessage = err.message;
      } else if (err && err.response && err.response.data) {
        const data = err.response.data;
        errorMessage = data.details || data.message || errorMessage;
      } else if (err && err.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Avatar.Icon
                  size={80}
                  icon="car-multiple"
                  style={styles.logo}
                  color="#fff"
                />
                <Text variant="displaySmall" style={styles.title}>
                  CityRider
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Sign in to continue
                </Text>
              </View>

              <View style={styles.form}>
                <TextInput
                  label="Email or User ID"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={loading}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  theme={{ roundness: 12 }}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  disabled={loading}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  theme={{ roundness: 12 }}
                />

                <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate('ForgotPassword')}
                    labelStyle={{ color: '#6200ee' }}
                  >
                    Forgot Password?
                  </Button>
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  icon="login"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                  style={styles.linkButton}
                >
                  Don't have an account? Sign Up
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Text variant="bodySmall" style={styles.footer}>
            By signing in, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    borderRadius: 24,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    backgroundColor: '#6200ee',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6200ee',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  snackbar: {
    backgroundColor: '#f44336',
  },
});
