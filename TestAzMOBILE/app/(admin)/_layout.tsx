import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { translations } from '@/constants/translations';

export default function AdminLayout() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            router.replace('/');
        }
    }, [user]);

    if (!user || user.role !== 'Admin') {
        return null;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                },
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTintColor: '#333',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            {user?.role === 'Admin' && (
                <>
                    <Tabs.Screen
                        name="users"
                        options={{
                            title: 'Users',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="people" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="premium-requests"
                        options={{
                            title: translations.premiumRequests,
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="star" size={size} color={color} />
                            ),
                        }}
                    />
                </>
            )}
        </Tabs>
    );
} 