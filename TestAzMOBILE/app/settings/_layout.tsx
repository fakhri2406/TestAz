import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { translations } from '@/constants/translations';

export default function SettingsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerBackTitle: ' ',
      }}
    >
      <Stack.Screen
        name="parameters"
        options={{
          title: translations.parameters,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: translations.help,
        }}
      />
    </Stack>
  );
} 