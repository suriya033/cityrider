import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ImageBackground,
    Dimensions,
} from 'react-native';
import {
    Text,
    Avatar,
    Card,
    List,
    Divider,
    Button,
} from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';

export default function ViewProfileScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { profile } = route.params;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return format(new Date(dateString), 'MMM dd, yyyy');
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <Avatar.Image
                                size={100}
                                source={{
                                    uri: profile.profilePicture || 'https://api.dicebear.com/7.x/avataaars/png?seed=Default'
                                }}
                                style={styles.avatar}
                            />
                            <Text variant="headlineSmall" style={styles.name}>{profile.name}</Text>
                            {profile.uniqueId && (
                                <Text variant="titleMedium" style={{ color: '#6200ee', fontWeight: 'bold', marginTop: 4 }}>ID: {profile.uniqueId}</Text>
                            )}
                            <Text variant="bodyMedium" style={styles.role}>{profile.role.toUpperCase()}</Text>
                        </View>

                        <Divider style={styles.divider} />
                        <Text variant="titleMedium" style={styles.sectionTitle}>Registration Details (Read-only)</Text>

                        <List.Item
                            title="Email"
                            description={profile.email}
                            left={props => <List.Icon {...props} icon="email" />}
                        />
                        <Divider />

                        <List.Item
                            title="Mobile Number"
                            description={profile.mobileNumber || 'Not set'}
                            left={props => <List.Icon {...props} icon="phone" />}
                        />
                        <Divider />

                        <List.Item
                            title="Date of Birth"
                            description={formatDate(profile.dateOfBirth)}
                            left={props => <List.Icon {...props} icon="calendar" />}
                        />
                        <Divider />

                        <List.Item
                            title="Gender"
                            description={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'}
                            left={props => <List.Icon {...props} icon="gender-male-female" />}
                        />
                        <Divider />

                        <List.Item
                            title="Aadhar Number"
                            description={profile.aadharNumber || 'Not set'}
                            left={props => <List.Icon {...props} icon="card-account-details" />}
                        />
                        <Divider />

                        <List.Item
                            title="City"
                            description={profile.city || 'Not set'}
                            left={props => <List.Icon {...props} icon="city" />}
                        />

                        <Button
                            mode="contained"
                            onPress={() => navigation.goBack()}
                            style={styles.button}
                        >
                            Back
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 20, paddingTop: 40 },
    card: { borderRadius: 24, elevation: 8, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
    header: { alignItems: 'center', marginBottom: 20 },
    avatar: { marginBottom: 16 },
    name: { fontWeight: 'bold', color: '#6200ee' },
    role: { color: '#666', marginTop: 4 },
    sectionTitle: { fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#333' },
    divider: { marginVertical: 8 },
    button: { marginTop: 24, borderRadius: 12, backgroundColor: '#6acffdff' },
});
