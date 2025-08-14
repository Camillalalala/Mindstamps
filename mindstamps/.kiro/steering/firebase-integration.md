---
inclusion: fileMatch
fileMatchPattern: '*firebase*'
---

# Firebase Integration Guidelines for Mindstamps

## Authentication Setup

### User Authentication
- Use Firebase Auth with email/password authentication
- Implement proper error handling for auth operations
- Store user state using `react-firebase-hooks/auth` for consistency
- Always check user authentication before accessing protected features

### Auth State Management
```javascript
const [user, loading] = useAuthState(auth);

// Always check loading state first
if (loading) return <LoadingComponent />;

// Then check authentication
if (!user) return <LoginComponent />;
```

## Firestore Database Structure

### Collections
- **memories**: User-generated memory entries
  - Document ID: Auto-generated
  - Fields: `title`, `story`, `location`, `imageData`, `userId`, `createdAt`

### Security Rules
Ensure Firestore rules enforce user-specific data access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memories/{memoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Data Operations

### Memory Creation
- Always include `userId` field with `user.uid`
- Use `addDoc` for creating new memories
- Include proper error handling and user feedback
- Convert images to base64 for storage (temporary solution for free tier)

### Memory Retrieval
- Use `query` with `where` clause to filter by `userId`
- Order by `createdAt` for consistent display
- Handle empty collections gracefully
- Implement loading states during data fetching

### Example Query Pattern
```javascript
const loadMemories = useCallback(async () => {
  if (!user) return;
  
  try {
    setLoading(true);
    const q = query(
      collection(db, 'memories'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const memoriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMemories(memoriesData);
  } catch (error) {
    console.error('Error loading memories:', error);
    // Handle error appropriately
  } finally {
    setLoading(false);
  }
}, [user]);
```

## Environment Configuration

### Environment Variables
Use Vite environment variables for Firebase config:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Configuration Pattern
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "fallback-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-id",
  // ... other config
};
```

## Error Handling

### Authentication Errors
- Provide user-friendly error messages
- Handle common scenarios (invalid email, weak password, etc.)
- Implement retry mechanisms where appropriate

### Database Errors
- Log errors for debugging while showing friendly messages to users
- Implement fallback states for failed data operations
- Provide retry buttons for transient failures

### Network Issues
- Handle offline scenarios gracefully
- Show appropriate loading states during network operations
- Implement timeout handling for long-running operations

## Performance Considerations

### Data Loading
- Use `useCallback` for data loading functions to prevent unnecessary re-renders
- Implement proper dependency arrays in `useEffect` hooks
- Cache data appropriately to minimize Firebase reads

### Image Storage
- Current implementation uses base64 storage in Firestore (free tier limitation)
- Consider image compression before storage
- Plan for Firebase Storage upgrade when scaling

### Query Optimization
- Use indexes for complex queries
- Limit query results when appropriate
- Implement pagination for large datasets

## Security Best Practices

### Client-Side Security
- Never expose sensitive Firebase configuration
- Use environment variables for all configuration
- Implement proper input validation before database operations

### Data Validation
- Validate all user inputs before saving to Firestore
- Sanitize text content to prevent XSS
- Ensure location data is properly formatted

### User Data Protection
- Only store necessary user data
- Implement proper data cleanup when users delete accounts
- Follow privacy best practices for user-generated content