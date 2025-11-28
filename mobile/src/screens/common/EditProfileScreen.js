import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Snackbar,
    Avatar,
    Card,
    RadioButton,
} from 'react-native-paper';
import { authAPI, usersAPI } from '../../services/api';
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

export default function EditProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const { updateUser } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [city, setCity] = useState('');
    const [gender, setGender] = useState(''); // male, female, other
    const [profileImage, setProfileImage] = useState(null); // uri
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getCurrentUser();
            const user = response.data;

            setName(user.name || '');
            if (user.dateOfBirth) {
                setDateOfBirth(new Date(user.dateOfBirth));
            }
            setMobileNumber(user.mobileNumber || '');
            setAadharNumber(user.aadharNumber || '');
            setCity(user.city || '');
            setGender(user.gender || '');
            setProfileImage(user.profilePicture || null);
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
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

    const handleUpdate = async () => {
        try {
            setError('');
            // Validation - only check if we have data, no need to validate read-only fields

            setLoading(true);

            const updateData = {
                profilePicture: profileImage,
            };

            const response = await usersAPI.updateProfile(updateData);

            if (response && response.data) {
                updateUser(response.data);
                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                setError('Update failed');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError(err.message || 'Update failed');
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
                                <Text variant="displaySmall" style={styles.title}>Edit Profile Picture</Text>
                                <Text variant="bodyLarge" style={styles.subtitle}>Update your profile image only</Text>
                            </View>
                            <View style={styles.form}>

                                {/* Profile Image */}
                                <View style={styles.imagePickerContainer}>
                                    <TouchableOpacity onPress={pickImage} disabled={loading}>
                                        {profileImage ? (
                                            <Avatar.Image size={100} source={{ uri: profileImage }} />
                                        ) : (
                                            <Avatar.Icon size={100} icon="camera" />
                                        )}
                                    </TouchableOpacity>
                                    <Text variant="bodySmall" style={styles.imagePickerLabel}>Tap to change profile picture</Text>
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

                                <TextInput label="Full Name" value={name} mode="outlined" disabled={true} style={styles.input} left={<TextInput.Icon icon="account" />} theme={{ roundness: 12 }} />

                                <TextInput label="Date of Birth" value={dateOfBirth ? format(dateOfBirth, 'MMM dd, yyyy') : ''} disabled={true} mode="outlined" style={styles.input} left={<TextInput.Icon icon="calendar" />} right={age !== null && (
                                    <TextInput.Affix text={`Age: ${age}`} textStyle={{ color: age >= 18 ? '#4caf50' : '#ff9800', fontWeight: 'bold' }} />
                                )} theme={{ roundness: 12 }} />

                                <TextInput label="Mobile Number" value={mobileNumber} mode="outlined" disabled={true} style={styles.input} left={<TextInput.Icon icon="phone" />} theme={{ roundness: 12 }} />
                                <TextInput label="Aadhar Number" value={aadharNumber} mode="outlined" disabled={true} style={styles.input} left={<TextInput.Icon icon="card-account-details" />} theme={{ roundness: 12 }} />
                                <TextInput label="City" value={city} mode="outlined" disabled={true} style={styles.input} left={<TextInput.Icon icon="city" />} theme={{ roundness: 12 }} />

                                <Text style={styles.genderLabel}>Gender</Text>
                                <RadioButton.Group value={gender}>
                                    <View style={styles.radioRow}>
                                        <RadioButton value="male" disabled={true} />
                                        <Text style={styles.radioLabel}>Male</Text>
                                        <RadioButton value="female" disabled={true} />
                                        <Text style={styles.radioLabel}>Female</Text>
                                        <RadioButton value="other" disabled={true} />
                                        <Text style={styles.radioLabel}>Other</Text>
                                    </View>
                                </RadioButton.Group>

                                <Button mode="contained" onPress={handleUpdate} loading={loading} disabled={loading} style={styles.button} contentStyle={styles.buttonContent} icon="content-save">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button mode="outlined" onPress={() => navigation.goBack()} disabled={loading} style={styles.cancelButton}>
                                    Cancel
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
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
    header: { alignItems: 'center', marginBottom: 24 },
    title: { fontWeight: 'bold', marginBottom: 8, color: '#6200ee' },
    subtitle: { textAlign: 'center', color: '#666' },
    form: { width: '100%' },
    input: { marginBottom: 16, backgroundColor: '#fff' },
    button: { marginTop: 8, marginBottom: 12, borderRadius: 12, backgroundColor: '#6acffdff' },
    cancelButton: { marginBottom: 16, borderRadius: 12 },
    buttonContent: { paddingVertical: 8 },
    snackbar: { backgroundColor: '#f44336' },
    imagePickerContainer: { alignItems: 'center', marginBottom: 16 },
    imagePickerLabel: { marginTop: 8, fontSize: 12, color: '#666' },
    radioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 12 },
    radioLabel: { fontSize: 14, color: '#333' },
    genderLabel: { fontSize: 16, color: '#666', marginBottom: 8, marginLeft: 4 },
    defaultAvatarsContainer: { marginBottom: 16, alignItems: 'center' },
    defaultAvatarsLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
    avatarScroll: { flexDirection: 'row' },
    avatarOption: { marginHorizontal: 8, padding: 2, borderRadius: 27 },
    selectedAvatar: { borderWidth: 2, borderColor: '#6200ee' },
});
