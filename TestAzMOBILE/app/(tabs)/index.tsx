import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
    ]}>
      <Text style={[
        styles.title,
        { color: colorScheme === 'dark' ? '#fff' : '#000' }
      ]}>
        Welcome to TestAz
      </Text>
      <Text style={[
        styles.subtitle,
        { color: colorScheme === 'dark' ? '#ccc' : '#666' }
      ]}>
        Your learning journey starts here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 