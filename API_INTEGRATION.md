# API Integration Documentation

## Overview
This document describes the API integration implemented for the Call Center CRM application.

## API Endpoint
- **Base URL**: `https://callcenter.skillmissionassam.org`
- **Login Endpoint**: `/nw/login`
- **Method**: POST
- **Content-Type**: application/json

## Login Request Format
```json
{
  "user": "ASDM_MIS",
  "password": "Asdm@4321"
}
```

## API Response Format

### Success Response
```json
{
  "message": "Login Successfully",
  "status": "true",
  "username": "ASDM_MIS",
  "token": "sadfsfsafsafasfasfasf"
}
```

### Error Response
```json
{
  "message": "Invalid password",
  "status": "false"
}
```

## Implementation Details

### 1. API Service (`src/services/api.js`)
- Centralized API service class for all HTTP requests
- Handles authentication tokens
- Provides error handling for different HTTP status codes
- Supports both authenticated and unauthenticated requests

### 2. Authentication Context (`src/context/AuthContext.jsx`)
- Manages authentication state across the application
- Provides login/logout functions
- Handles token storage and retrieval
- Checks authentication status on app load
- **Token Storage**: Tokens are automatically saved to localStorage for future use
- **Token Access**: Use `getToken()` method to access current token

### 3. Protected Routes (`src/components/ProtectedRoute.jsx`)
- Guards routes that require authentication
- Redirects unauthenticated users to login
- Shows loading state while checking authentication

### 4. Updated Components

#### LoginForm (`src/components/LoginForm.jsx`)
- Integrated with API service
- Added loading states and error handling
- Uses AuthContext for login functionality
- Handles specific API response format

#### Navbar (`src/components/Navbar.jsx`)
- Integrated with AuthContext for logout
- Displays username directly (no dropdown icon)
- Shows "Welcome, [username]" format
- Proper logout functionality

## Features Implemented

### Authentication Flow
1. User enters credentials
2. API call to `/nw/login` endpoint
3. On success: Store token and user data
4. Navigate to dashboard
5. On failure: Show error message

### Token Management
- **Automatic Storage**: Tokens are automatically saved to localStorage
- **Persistent Sessions**: Tokens persist across browser sessions
- **Secure Access**: Use `useAuth().getToken()` to access current token
- **Automatic Cleanup**: Tokens are removed on logout

### Security Features
- Token-based authentication
- Protected routes
- Automatic logout on token expiration
- Secure token storage in localStorage

### Error Handling
- Network error detection
- HTTP status code handling
- User-friendly error messages
- Loading states during API calls

## Usage

### Testing the Login
1. Start the application
2. Navigate to the login page
3. Use the provided credentials:
   - Username: `ASDM_MIS`
   - Password: `Asdm@4321`
4. The system will make an API call to the login endpoint
5. On successful authentication, you'll be redirected to the dashboard

### Accessing the Token
```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { getToken } = useAuth();
  const token = getToken();
  
  // Use token for authenticated API calls
  console.log('Current token:', token);
};
```

### Adding New API Endpoints
To add new API endpoints, extend the `ApiService` class in `src/services/api.js`:

```javascript
// Example: Adding a new endpoint
async getGrievances() {
  return this.authenticatedRequest('/api/grievances', {
    method: 'GET'
  });
}
```

## Error Codes Handled
- 401: Unauthorized (Invalid credentials)
- 403: Forbidden (Access denied)
- 404: Not found
- 500: Server error
- Network errors
- JSON parsing errors

## Security Considerations
- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- All authenticated requests include the Authorization header
- Automatic logout on authentication failure
- Protected routes prevent unauthorized access
- Tokens are automatically saved and retrieved for future use 