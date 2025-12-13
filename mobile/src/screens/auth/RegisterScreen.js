import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Snackbar,
  Avatar,
  Card,
  ProgressBar,
  RadioButton,
} from 'react-native-paper';
import { authAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Abby&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Brian&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Chloe&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=David&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Emma&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Frank&mouth=smile',
];

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { signIn } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState(''); // male, female, other
  const [profileImage, setProfileImage] = useState(null); // uri
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 0.25;
    if (password.length >= 8) strength += 0.25;
    if (/[A-Z]/.test(password)) strength += 0.25;
    if (/[0-9]/.test(password)) strength += 0.25;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 0.25) return '#f44336';
    if (strength <= 0.5) return '#ff9800';
    if (strength <= 0.75) return '#ffc107';
    return '#4caf50';
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    try {
      setError('');
      // Validation
      if (!name.trim()) { setError('Please enter your full name'); return; }
      if (!email.trim()) { setError('Please enter your email address'); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address'); return; }
      if (!password || password.length < 6) { setError('Password must be at least 6 characters long'); return; }
      if (!confirmPassword) { setError('Please confirm your password'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (!dateOfBirth) { setError('Please select your date of birth'); return; }
      const age = calculateAge(dateOfBirth);
      if (age < 13) { setError('You must be at least 13 years old to register'); return; }
      if (!mobileNumber.trim() || mobileNumber.trim().length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
      if (!aadharNumber.trim() || aadharNumber.trim().length !== 12) { setError('Please enter a valid 12-digit Aadhar number'); return; }
      if (!city.trim()) { setError('Please enter your city'); return; }

      setLoading(true);

      const response = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        dateOfBirth: dateOfBirth.toISOString(),
        mobileNumber: mobileNumber.trim(),
        aadharNumber: aadharNumber.trim(),
        city: city.trim(),
        gender,
        profilePicture: profileImage,
        role: 'passenger',
        canSwitchRole: age >= 18,
      });

      if (response && response.data) {
        const { token, user } = response.data;
        if (token && user) await signIn(token, user);
        else setError('Invalid response from server');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Avatar.Icon size={80} icon="account-plus" style={styles.logo} color="#fff" />
                <Text variant="displaySmall" style={styles.title}>Create Account</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>Sign up to get started</Text>
              </View>
              <View style={styles.form}>
                <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" autoCapitalize="words" disabled={loading} style={styles.input} left={<TextInput.Icon icon="account" />} theme={{ roundness: 12 }} />
                <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} disabled={loading} style={styles.input} left={<TextInput.Icon icon="email" />} theme={{ roundness: 12 }} />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput label="Date of Birth" value={dateOfBirth ? format(dateOfBirth, 'MMM dd, yyyy') : ''} editable={false} mode="outlined" style={styles.input} left={<TextInput.Icon icon="calendar" />} right={age !== null && (
                    <TextInput.Affix text={`Age: ${age}`} textStyle={{ color: age >= 18 ? '#4caf50' : '#ff9800', fontWeight: 'bold' }} />
                  )} theme={{ roundness: 12 }} />
                </TouchableOpacity>
                {age !== null && age < 18 && (
                  <Text variant="bodySmall" style={styles.ageWarning}>⚠️ Users under 18 can only access Passenger mode</Text>
                )}
                {age !== null && age >= 18 && (
                  <Text variant="bodySmall" style={styles.ageSuccess}>✅ You can access both Passenger and Driver modes</Text>
                )}
                {showDatePicker && (
                  <DateTimePicker value={dateOfBirth || new Date(2000, 0, 1)} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} minimumDate={new Date(1940, 0, 1)} />
                )}
                <TextInput label="Mobile Number" value={mobileNumber} onChangeText={text => setMobileNumber(text.replace(/[^0-9]/g, ''))} mode="outlined" keyboardType="phone-pad" maxLength={10} disabled={loading} style={styles.input} left={<TextInput.Icon icon="phone" />} theme={{ roundness: 12 }} />
                <TextInput label="Aadhar Number" value={aadharNumber} onChangeText={text => setAadharNumber(text.replace(/[^0-9]/g, ''))} mode="outlined" keyboardType="number-pad" maxLength={12} disabled={loading} style={styles.input} left={<TextInput.Icon icon="card-account-details" />} theme={{ roundness: 12 }} />
                <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" autoCapitalize="words" disabled={loading} style={styles.input} left={<TextInput.Icon icon="city" />} theme={{ roundness: 12 }} />
                {/* Gender & Profile Image - Available for all */}
                <View style={styles.imagePickerContainer}>
                  <TouchableOpacity onPress={pickImage} disabled={loading}>
                    {profileImage ? (
                      <Avatar.Image size={80} source={{ uri: profileImage }} />
                    ) : (
                      <Avatar.Icon size={80} icon="camera" />
                    )}
                  </TouchableOpacity>
                  <Text variant="bodySmall" style={styles.imagePickerLabel}>Tap to select profile picture</Text>
                </View>

                <View style={styles.defaultAvatarsContainer}>
                  <Text style={styles.defaultAvatarsLabel}>Or choose a default avatar:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
                    {DEFAULT_AVATARS.map((avatarUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setProfileImage(avatarUrl)}
                        style={[
                          styles.avatarOption,
                          profileImage === avatarUrl && styles.selectedAvatar
                        ]}
                      >
                        <Avatar.Image size={50} source={{ uri: avatarUrl }} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <RadioButton.Group onValueChange={setGender} value={gender}>
                  <View style={styles.radioRow}>
                    <RadioButton value="male" />
                    <Text style={styles.radioLabel}>Male</Text>
                    <RadioButton value="female" />
                    <Text style={styles.radioLabel}>Female</Text>
                    <RadioButton value="other" />
                    <Text style={styles.radioLabel}>Other</Text>
                  </View>
                </RadioButton.Group>
                <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry={!showPassword} disabled={loading} style={styles.input} left={<TextInput.Icon icon="lock" />} right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />} theme={{ roundness: 12 }} />
                {password.length > 0 && (
                  <View style={styles.passwordStrength}>
                    <Text variant="bodySmall" style={styles.strengthLabel}>Password Strength</Text>
                    <ProgressBar progress={getPasswordStrength()} color={getPasswordStrengthColor()} style={styles.progressBar} />
                  </View>
                )}
                <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry={!showConfirmPassword} disabled={loading} style={styles.input} left={<TextInput.Icon icon="lock-check" />} right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />} theme={{ roundness: 12 }} />
                <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.button} contentStyle={styles.buttonContent} icon="account-plus">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
                <Button mode="text" onPress={() => navigation.navigate('Login')} disabled={loading} style={styles.linkButton}>
                  Already have an account? Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>
          <Text variant="bodySmall" style={styles.footer}>By signing up, you agree to our Terms & Privacy Policy</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.snackbar}>
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 40, paddingBottom: 40 },
  card: { borderRadius: 24, elevation: 8, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { backgroundColor: '#6200ee', marginBottom: 16 },
  title: { fontWeight: 'bold', marginBottom: 8, color: '#6200ee' },
  subtitle: { textAlign: 'center', color: '#666' },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  ageWarning: { color: '#ff9800', marginTop: -12, marginBottom: 16, paddingLeft: 12, fontWeight: '600' },
  ageSuccess: { color: '#4caf50', marginTop: -12, marginBottom: 16, paddingLeft: 12, fontWeight: '600' },
  passwordStrength: { marginBottom: 16, marginTop: -8 },
  strengthLabel: { color: '#666', marginBottom: 4 },
  progressBar: { height: 6, borderRadius: 3 },
  button: { marginTop: 8, marginBottom: 16, borderRadius: 12, backgroundColor: '#6200ee' },
  buttonContent: { paddingVertical: 8 },
  linkButton: { marginTop: 8 },
  footer: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)', marginTop: 24, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  snackbar: { backgroundColor: '#f44336' },
  imagePickerContainer: { alignItems: 'center', marginBottom: 16 },
  imagePickerLabel: { marginTop: 8, fontSize: 12, color: '#666' },
  radioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 12 },
  radioLabel: { fontSize: 14, color: '#333' },
  defaultAvatarsContainer: { marginBottom: 16, alignItems: 'center' },
  defaultAvatarsLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  avatarScroll: { flexDirection: 'row' },
  avatarOption: { marginHorizontal: 8, padding: 2, borderRadius: 27 },
  selectedAvatar: { borderWidth: 2, borderColor: '#6200ee' },
});
