import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

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

  return <Stack />;
} 