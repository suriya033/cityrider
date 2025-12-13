import React, { useState } from 'react';
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

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP & New Password
    const [identifier, setIdentifier] = useState(''); // Email or Mobile
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOTP = async () => {
        if (!identifier.trim()) {
            setError('Please enter your Email or Mobile Number');
            return;
        }

        // Basic validation
        const isEmail = identifier.includes('@');
        const isMobile = /^\d{10}$/.test(identifier.trim());

        if (!isEmail && !isMobile) {
            setError('Please enter a valid Email or 10-digit Mobile Number');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            setMessage(`OTP sent to ${identifier}`);
            // In a real app, you would trigger the backend to send OTP here
        }, 1500);
    };

    const handleResetPassword = async () => {
        if (!otp.trim()) {
            setError('Please enter the OTP');
            return;
        }
        if (!newPassword) {
            setError('Please enter a new password');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setMessage('Password reset successful! Please login.');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 1500);
        }, 1500);
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
                                    icon="lock-reset"
                                    style={styles.logo}
                                    color="#fff"
                                />
                                <Text variant="displaySmall" style={styles.title}>
                                    Reset Password
                                </Text>
                                <Text variant="bodyLarge" style={styles.subtitle}>
                                    {step === 1
                                        ? 'Enter your details to receive an OTP'
                                        : 'Enter OTP and new password'}
                                </Text>
                            </View>

                            <View style={styles.form}>
                                {step === 1 ? (
                                    <>
                                        <TextInput
                                            label="Email or Mobile Number"
                                            value={identifier}
                                            onChangeText={setIdentifier}
                                            mode="outlined"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            disabled={loading}
                                            style={styles.input}
                                            left={<TextInput.Icon icon="account-search" />}
                                            theme={{ roundness: 12 }}
                                        />
                                        <Button
                                            mode="contained"
                                            onPress={handleSendOTP}
                                            loading={loading}
                                            disabled={loading}
                                            style={styles.button}
                                            contentStyle={styles.buttonContent}
                                            icon="email-send"
                                        >
                                            {loading ? 'Sending OTP...' : 'Send OTP'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <TextInput
                                            label="Enter OTP"
                                            value={otp}
                                            onChangeText={setOtp}
                                            mode="outlined"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            disabled={loading}
                                            style={styles.input}
                                            left={<TextInput.Icon icon="message-processing" />}
                                            theme={{ roundness: 12 }}
                                        />
                                        <TextInput
                                            label="New Password"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            mode="outlined"
                                            secureTextEntry={!showPassword}
                                            disabled={loading}
                                            style={styles.input}
                                            left={<TextInput.Icon icon="lock" />}
                                            right={
                                                <TextInput.Icon
                                                    icon={showPassword ? 'eye-off' : 'eye'}
                                                    onPress={() => setShowPassword(!showPassword)}
                                                />
                                            }
                                            theme={{ roundness: 12 }}
                                        />
                                        <TextInput
                                            label="Confirm New Password"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            mode="outlined"
                                            secureTextEntry={!showConfirmPassword}
                                            disabled={loading}
                                            style={styles.input}
                                            left={<TextInput.Icon icon="lock-check" />}
                                            right={
                                                <TextInput.Icon
                                                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                />
                                            }
                                            theme={{ roundness: 12 }}
                                        />
                                        <Button
                                            mode="contained"
                                            onPress={handleResetPassword}
                                            loading={loading}
                                            disabled={loading}
                                            style={styles.button}
                                            contentStyle={styles.buttonContent}
                                            icon="lock-reset"
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </Button>
                                        <Button
                                            mode="text"
                                            onPress={() => setStep(1)}
                                            disabled={loading}
                                            style={styles.linkButton}
                                        >
                                            Change Email/Mobile
                                        </Button>
                                    </>
                                )}

                                <Button
                                    mode="text"
                                    onPress={() => navigation.navigate('Login')}
                                    disabled={loading}
                                    style={styles.linkButton}
                                >
                                    Back to Login
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar
                visible={!!error || !!message}
                onDismiss={() => {
                    setError('');
                    setMessage('');
                }}
                duration={4000}
                style={[styles.snackbar, error ? styles.errorSnackbar : styles.successSnackbar]}
            >
                {error || message}
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
    snackbar: {
        marginBottom: 20,
    },
    errorSnackbar: {
        backgroundColor: '#f44336',
    },
    successSnackbar: {
        backgroundColor: '#4caf50',
    },
});
