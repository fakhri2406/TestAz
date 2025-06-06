import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { translations } from '@/constants/translations';

export default function PremiumScreen() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleRequestPremium = async () => {
        if (!user) return;

        if (user.isPremium) {
            Alert.alert(translations.error, translations.alreadyPremium);
            return;
        }

        setLoading(true);
        try {
            await apiService.createPremiumRequest();
            Alert.alert(
                translations.success,
                translations.premiumRequestSubmitted,
                [{ text: 'OK', onPress: refreshUser }]
            );
        } catch (error: any) {
            if (error.message && (error.message.includes("already have a pending premium request") || (error.response && error.response.status === 400))) {
                Alert.alert(translations.warning, translations.pendingPremiumRequest);
            } else {
                Alert.alert(translations.error, translations.failedToSubmitPremiumRequest);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{translations.pleaseLogIn}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    name={user.isPremium ? 'star' : 'star-outline'}
                    size={48}
                    color={user.isPremium ? '#FFD700' : '#666'}
                />
                <Text style={styles.title}>
                    {user.isPremium ? 'Premium Member' : 'Upgrade to Premium'}
                </Text>
            </View>

            {user.isPremium ? (
                <View style={styles.premiumInfo}>
                    <Text style={styles.premiumText}>
                        You are enjoying premium benefits until{' '}
                        {user.premiumExpirationDate
                            ? format(new Date(user.premiumExpirationDate), 'MMMM d, yyyy')
                            : 'indefinitely'}
                    </Text>
                    <View style={styles.benefitsContainer}>
                        <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.benefitText}>Unlimited access to all features</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.benefitText}>Priority support</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.benefitText}>Exclusive content</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.upgradeContainer}>
                    <Text style={styles.upgradeText}>
                        Get access to all premium features and exclusive content
                    </Text>
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={handleRequestPremium}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="star" size={20} color="white" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Request Premium Access</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.noteText}>
                        Your request will be reviewed by an administrator
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    premiumInfo: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    premiumText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    benefitsContainer: {
        marginTop: 16,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    upgradeContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    upgradeText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    upgradeButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    noteText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
}); 