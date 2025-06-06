import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { apiService, PremiumRequest } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { translations } from '@/constants/translations';

export default function PremiumRequestsScreen() {
    const [requests, setRequests] = useState<PremiumRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<PremiumRequest | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role !== 'Admin') {
            router.replace('/');
            return;
        }
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const data = await apiService.getPremiumRequests();
            setRequests(data);
        } catch (error) {
            Alert.alert(translations.error, translations.failedToFetchRequests);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        try {
            await apiService.approvePremiumRequest(requestId);
            Alert.alert(translations.success, translations.requestApproved);
            setShowModal(false);
            fetchRequests();
        } catch (error) {
            Alert.alert(translations.error, translations.failedToApproveRequest);
        }
    };

    const handleReject = async (requestId: string, reason: string) => {
        if (!reason.trim()) {
            Alert.alert(translations.error, translations.provideRejectReason);
            return;
        }

        try {
            await apiService.rejectPremiumRequest(requestId, reason);
            Alert.alert(translations.success, translations.requestRejected);
            setShowModal(false);
            fetchRequests();
        } catch (error) {
            Alert.alert(translations.error, translations.failedToRejectRequest);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.title}>{translations.premiumRequestTitle}</Text>
                <TouchableOpacity onPress={() => router.replace('/')} style={{ padding: 8, backgroundColor: '#e0e0e0', borderRadius: 4 }}>
                    <Text>{translations.returnToMain}</Text>
                </TouchableOpacity>
            </View>
            {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#666" />
                    <Text style={styles.emptyText}>{translations.noPendingRequests}</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    {requests.map((request) => (
                        <TouchableOpacity
                            key={request.id}
                            style={styles.requestCard}
                            onPress={() => {
                                setSelectedRequest(request);
                                setShowModal(true);
                            }}
                        >
                            <View style={styles.requestHeader}>
                                <Text style={styles.userName}>{request.userName}</Text>
                                <Text style={styles.userEmail}>{request.userEmail}</Text>
                            </View>
                            <View style={styles.requestDetails}>
                                <Text style={styles.date}>
                                    {translations.requestedOn} {format(new Date(request.createdAt), 'MMM d, yyyy')}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: '#FFA500' }]}>
                                    <Text style={styles.statusText}>{translations.pending}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {showModal && selectedRequest && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{translations.premiumRequest}</Text>
                        <View style={styles.modalInfo}>
                            <Text style={styles.modalLabel}>{translations.user}:</Text>
                            <Text style={styles.modalValue}>{selectedRequest.userName}</Text>
                            <Text style={styles.modalLabel}>{translations.email}:</Text>
                            <Text style={styles.modalValue}>{selectedRequest.userEmail}</Text>
                            <Text style={styles.modalLabel}>{translations.requestedDate}:</Text>
                            <Text style={styles.modalValue}>
                                {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy')}
                            </Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.approveButton]}
                                onPress={() => handleApprove(selectedRequest.id)}
                            >
                                <Text style={styles.buttonText}>{translations.approve}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.rejectButton]}
                                onPress={() => {
                                    Alert.prompt(
                                        translations.rejectRequest,
                                        translations.provideRejectReason,
                                        [
                                            {
                                                text: translations.cancel,
                                                style: 'cancel',
                                            },
                                            {
                                                text: translations.reject,
                                                onPress: (reason) => {
                                                    if (reason) {
                                                        handleReject(selectedRequest.id, reason);
                                                    }
                                                },
                                            },
                                        ],
                                        'plain-text'
                                    );
                                }}
                            >
                                <Text style={styles.buttonText}>{translations.reject}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.closeButtonText}>{translations.close}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    requestCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    requestHeader: {
        marginBottom: 8,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    requestDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalInfo: {
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    modalValue: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
    },
    closeButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    closeButtonText: {
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
    },
}); 