# Frontend Environment Configuration

## Required Environment Variables

### `NEXT_PUBLIC_API_URL`

The base URL for the backend API server. This should match the server's CORS configuration.

**Type**: String  
**Required**: Yes  
**Default**: `http://localhost:3001`

#### Examples

**Development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Staging:**
```bash
NEXT_PUBLIC_API_URL=https://api-staging.taloncrm.com
```

**Production:**
```bash
NEXT_PUBLIC_API_URL=https://api.taloncrm.com
```

## Setup Instructions

1. **Create Environment File**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Or create manually
   touch .env.local
   ```

2. **Configure API URL**
   ```bash
   # Add to .env.local
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env.local
   ```

3. **Verify Configuration**
   The application will log a warning if `NEXT_PUBLIC_API_URL` is not set:
   ```
   NEXT_PUBLIC_API_URL environment variable is not set. Using default: http://localhost:3001
   ```

## API Client Features

The frontend API client automatically:

- ✅ **Uses Environment Variable**: Reads from `NEXT_PUBLIC_API_URL`
- ✅ **Fallback Handling**: Uses default URL if not configured
- ✅ **URL Normalization**: Removes trailing slashes
- ✅ **Warning Logs**: Alerts when using fallback URL
- ✅ **Type Safety**: Full TypeScript support

## CORS Configuration

Ensure your backend server's `CORS_ORIGINS` includes your frontend URL:

**Development:**
```bash
# Backend .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Production:**
```bash
# Backend .env
CORS_ORIGINS=https://app.taloncrm.com,https://api.taloncrm.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `NEXT_PUBLIC_API_URL` matches server's CORS configuration
   - Check that the server is running and accessible

2. **Environment Variable Not Loading**
   - Restart the development server after changing `.env.local`
   - Ensure the variable name starts with `NEXT_PUBLIC_`
   - Check for typos in the variable name

3. **API Connection Issues**
   - Verify the server is running on the specified URL
   - Check network connectivity
   - Review server logs for errors

### Debugging

The API client logs warnings when environment variables are not properly configured. Check the browser console for:

```
NEXT_PUBLIC_API_URL environment variable is not set. Using default: http://localhost:3001
```

## Implementation Details

The API client is implemented in `src/lib/api.ts`:

```typescript
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    console.warn(
      'NEXT_PUBLIC_API_URL environment variable is not set. Using default: http://localhost:3001'
    );
    return 'http://localhost:3001';
  }
  
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();
```

## Security Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive data (API keys, secrets) in `NEXT_PUBLIC_` variables
- Use server-side environment variables for sensitive configuration
