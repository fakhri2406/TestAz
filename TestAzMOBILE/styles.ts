import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Common container styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },

  // Common button styles
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },

  // Common text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },

  // Common scroll view styles
  scrollView: {
    flex: 1,
    padding: 16,
  },

  // Common premium badge styles
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 