import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { API_CONFIG } from '../config/api';

interface Test {
    id: number;
    title: string;
    description: string;
}

export default function CreateTest() {
    const router = useRouter();
    const [tests, setTests] = useState<Test[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [newTest, setNewTest] = useState({
        title: '',
        description: ''
    });

    // Test API connection on component mount
    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Testing API connection...');
            const response = await apiService.get(API_CONFIG.ENDPOINTS.TESTS);
            console.log('API connection test response:', response);
            if (response.data) {
                Alert.alert('Success', 'API connection successful!');
            }
        } catch (err) {
            console.error('API connection test failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect to API');
            Alert.alert('Error', 'Failed to connect to API. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching tests...');
            const response = await apiService.get<Test[]>(API_CONFIG.ENDPOINTS.TESTS);
            console.log('Fetch tests response:', response);
            if (response.data) {
                setTests(response.data);
            }
        } catch (err) {
            console.error('Fetch tests failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const createTest = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Creating test with data:', newTest);
            const response = await apiService.post<Test>(API_CONFIG.ENDPOINTS.TESTS, newTest);
            console.log('Create test response:', response);
            if (response.data) {
                setTests(prev => [...prev, response.data!]);
                setNewTest({ title: '', description: '' });
                Alert.alert('Success', 'Test created successfully!');
            }
        } catch (err) {
            console.error('Create test failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to create test');
            Alert.alert('Error', 'Failed to create test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Create New Test</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Test Title"
                    value={newTest.title}
                    onChangeText={(text) => setNewTest(prev => ({ ...prev, title: text }))}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Test Description"
                    value={newTest.description}
                    onChangeText={(text) => setNewTest(prev => ({ ...prev, description: text }))}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.createButton]}
                        onPress={createTest}
                        disabled={loading || !newTest.title || !newTest.description}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating...' : 'Create Test'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.backButton]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Back to Main Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>API Connection</Text>
                <TouchableOpacity 
                    style={[styles.button, styles.testButton]}
                    onPress={testConnection}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Test API Connection</Text>
                </TouchableOpacity>
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>Error:</Text>
                        <Text style={styles.error}>{error}</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Recent Tests</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={fetchTests}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Refresh Tests</Text>
                </TouchableOpacity>
                
                {tests.map(test => (
                    <View key={test.id} style={styles.testItem}>
                        <Text style={styles.testTitle}>{test.title}</Text>
                        <Text>{test.description}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    createButton: {
        backgroundColor: '#007AFF',
    },
    backButton: {
        backgroundColor: '#6c757d',
    },
    testButton: {
        backgroundColor: '#17a2b8',
        marginBottom: 15,
    },
    refreshButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#f8d7da',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    errorTitle: {
        color: '#721c24',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    error: {
        color: '#721c24',
        fontSize: 16,
    },
    testItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: '#f8f9fa',
    },
    testTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
}); 