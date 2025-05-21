import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Main Menu',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="create-test" 
        options={{ 
          title: 'Create Test',
          headerShown: true,
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
} 