import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native';
import { apiService } from '../services/api';
import { API_CONFIG } from '../config/api';

interface Test {
    id: number;
    title: string;
    description: string;
}

export function ExampleApiUsage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [newTest, setNewTest] = useState({
        title: '',
        description: ''
    });

    const fetchTests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.get<Test[]>(API_CONFIG.ENDPOINTS.TESTS);
            if (response.data) {
                setTests(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createTest = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.post<Test>(API_CONFIG.ENDPOINTS.TESTS, newTest);
            if (response.data) {
                setTests(prev => [...prev, response.data!]);
                setNewTest({ title: '', description: '' });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create test');
            console.error(err);
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
                <Button 
                    title="Create Test" 
                    onPress={createTest}
                    disabled={loading || !newTest.title || !newTest.description}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Tests List</Text>
                <Button 
                    title="Refresh Tests" 
                    onPress={fetchTests}
                    disabled={loading}
                />
                
                {error && <Text style={styles.error}>{error}</Text>}
                
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
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    error: {
        color: 'red',
        marginVertical: 10,
    },
    testItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginTop: 10,
    },
    testTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
}); 