# Profile API Documentation

## Update User Profile

### Endpoint
`PUT /api/auth/profile`

### Authentication
Required - Bearer Token in Authorization header

### Request Format
- Content-Type: `multipart/form-data`

### Request Body Parameters

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | String | Yes | 2-50 characters | User's full name |
| email | String | Yes | Valid email format | User's email address (must be unique) |
| username | String | No | 3-20 chars, alphanumeric + underscore | Unique username (lowercase, optional) |
| phone | String | No | Valid phone format | User's phone number |
| profileImage | File | No | JPG/PNG/GIF, max 5MB | Profile picture file |

### Validation Rules

#### Name
- Required
- Minimum 2 characters
- Maximum 50 characters
- Trimmed automatically

#### Email
- Required
- Must be valid email format
- Must be unique across all users
- Converted to lowercase

#### Username
- Optional field
- If provided:
  - Minimum 3 characters
  - Maximum 20 characters
  - Only letters, numbers, and underscores allowed
  - Must be unique across all users
  - Converted to lowercase
  - Regex: `/^[a-zA-Z0-9_]+$/`

#### Phone
- Optional
- If provided, must match valid phone format
- Trimmed automatically

#### Profile Image
- Optional
- Allowed types: JPEG, JPG, PNG, GIF, WebP
- Maximum size: 5MB
- Stored in `/uploads/profiles/` directory

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "username": "johndoe",
    "profileImage": "/uploads/profiles/profile-1234567890.jpg",
    "role": "user",
    "isVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLogin": "2025-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "message": "Name and email are required"
}
```

#### 400 Bad Request - Invalid Email Format
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

#### 400 Bad Request - Email Already Taken
```json
{
  "success": false,
  "message": "Email already in use"
}
```

#### 400 Bad Request - Invalid Username Format
```json
{
  "success": false,
  "message": "Username can only contain letters, numbers, and underscores"
}
```

#### 400 Bad Request - Username Length
```json
{
  "success": false,
  "message": "Username must be between 3 and 20 characters"
}
```

#### 400 Bad Request - Username Already Taken
```json
{
  "success": false,
  "message": "Username already taken"
}
```

#### 401 Unauthorized - No Token
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

#### 404 Not Found - User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error while updating profile",
  "error": "Error details..."
}
```

## Frontend Implementation

### Using Axios with FormData

```javascript
import { updateProfile } from '../services/api';

const handleSubmit = async (formData, profileImage) => {
  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name.trim());
  formDataToSend.append('email', formData.email.trim());
  formDataToSend.append('username', formData.username.trim());
  formDataToSend.append('phone', formData.phone.trim() || '');
  
  if (profileImage) {
    formDataToSend.append('profileImage', profileImage);
  }

  try {
    const response = await updateProfile(formDataToSend);
    
    if (response.success) {
      // Update context/state with new user data
      updateUser(response.user);
      console.log('Profile updated successfully');
    }
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
  }
};
```

## Data Persistence

### MongoDB Schema
The username field is added with these properties:
- Optional field (`required: false`)
- Unique across users (`unique: true`)
- Sparse index (`sparse: true`) - allows multiple null values
- Lowercase conversion
- Trimmed automatically

### Backward Compatibility
- Existing users without username: Field will be null/undefined
- No breaking changes to existing data
- Can be populated later via profile update or migration script

### Migration Script
Use `/backend/scripts/addUsernameField.js` to add usernames to existing users:

```bash
cd backend
node scripts/addUsernameField.js
```

This script will:
1. Find all users without username
2. Generate username from email (part before @)
3. Ensure uniqueness (add number suffix if needed)
4. Update all users safely

## Security Features

1. **Authentication Required**: All profile updates require valid JWT token
2. **User Isolation**: Users can only update their own profile
3. **Uniqueness Validation**: Email and username checked for duplicates
4. **Input Sanitization**: All strings are trimmed
5. **File Validation**: Image uploads validated for type and size
6. **XSS Protection**: Data is properly escaped/validated
7. **Rate Limiting**: Should be implemented on production

## Best Practices

1. **Always validate on both frontend and backend**
2. **Handle file uploads securely**
3. **Update UI immediately after successful response**
4. **Store updated user data in localStorage and context**
5. **Show loading states during API calls**
6. **Display clear error messages to users**
7. **Persist data across page refreshes**
