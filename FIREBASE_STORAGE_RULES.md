# Firebase Storage Rules Configuration

## Important: Update Your Firebase Storage Rules

To enable image uploads, you need to configure Firebase Storage rules.

### Steps:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `ai-integrated-rice-assistant`
3. Navigate to **Storage** → **Rules**
4. Update the rules to:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/images/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### What This Does:
- ✅ Allows authenticated users to upload images
- ✅ Users can only access their own images
- ✅ Organized by user ID for security

### Also Enable Realtime Database Rules:

Navigate to **Realtime Database** → **Rules** and set:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```
