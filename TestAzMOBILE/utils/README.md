# Exception Handler

The `ExceptionHandler` is a centralized error handling utility that provides user-friendly notifications instead of error logs.

## Usage

### Basic Usage

```typescript
import { ExceptionHandler } from '@/utils/exceptionHandler';

try {
  // Your API call or operation
  await api.someMethod();
} catch (error) {
  ExceptionHandler.handle(error, 'context');
}
```

### With Navigation Callback

```typescript
try {
  await api.signup(userData);
} catch (error) {
  ExceptionHandler.handle(error, 'signup', () => router.replace('/login'));
}
```

### Silent Error Handling

For non-critical errors that shouldn't show user notifications:

```typescript
try {
  await api.loadBackgroundData();
} catch (error) {
  ExceptionHandler.handleSilently(error, 'backgroundData');
}
```

### Custom Actions

```typescript
try {
  await api.deleteTest(testId);
} catch (error) {
  ExceptionHandler.handleWithActions(error, [
    { text: 'OK', style: 'default' },
    { 
      text: 'Retry', 
      onPress: () => retryDelete(),
      style: 'default'
    }
  ], 'deleteTest');
}
```

## Error Types

The handler automatically categorizes errors into:

- **Error**: Critical issues that need immediate attention
- **Warning**: Issues that should be brought to user's attention but aren't critical
- **Info**: Informational messages

## Supported Error Messages

The handler recognizes and maps these common error messages:

### Authentication
- "User already exists" → Warning with login option
- "Invalid credentials" → Error message
- "Please verify your email" → Warning

### Network
- "Network Error" → Connection error message
- "Request failed with status code 500" → Server error
- "Request failed with status code 404" → Not found

### API Specific
- "Authentication required" → Login prompt
- "Admin privileges required" → Permission warning

### Test Related
- "Test not found" → Error message
- "Failed to create test" → Error message
- "Failed to load test" → Error message

### Premium Related
- "already premium" → Info message
- "Premium request submitted" → Info message

## Benefits

1. **No more error logs**: Users see friendly messages instead of technical errors
2. **Consistent UX**: All errors are handled uniformly across the app
3. **Localized**: All messages use the translation system
4. **Context-aware**: Different handling based on error type and context
5. **Navigation support**: Can include navigation callbacks for specific actions 