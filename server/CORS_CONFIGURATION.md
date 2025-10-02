# CORS Configuration

## Overview

The TalonCRM server now supports configurable CORS origins through environment variables, making it easy to manage allowed origins across different environments.

## Environment Variable

### `CORS_ORIGINS`

A comma-delimited list of allowed origins for CORS requests.

**Format**: `origin1,origin2,origin3`

**Examples**:
```bash
# Development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Production
CORS_ORIGINS=https://app.taloncrm.com,https://admin.taloncrm.com

# Multiple environments
CORS_ORIGINS=http://localhost:3000,https://staging.taloncrm.com,https://app.taloncrm.com
```

## Default Behavior

If `CORS_ORIGINS` is not set, the server will use these default origins:
- `http://localhost:3000` (Frontend development)
- `http://localhost:3001` (Server development)
- `https://app.taloncrm.com` (Production frontend)

## CORS Configuration Details

The server is configured with the following CORS settings:

- **Origins**: Configurable via `CORS_ORIGINS` environment variable
- **Credentials**: `true` (allows cookies and authorization headers)
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- **Headers**: `Content-Type`, `Authorization`, `Accept`

## Usage Examples

### Development
```bash
# .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Staging
```bash
# .env
CORS_ORIGINS=https://staging.taloncrm.com,https://staging-admin.taloncrm.com
```

### Production
```bash
# .env
CORS_ORIGINS=https://app.taloncrm.com,https://admin.taloncrm.com
```

## Implementation

The CORS configuration is handled in `src/main.ts`:

```typescript
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://app.taloncrm.com',
    ];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

## Security Notes

- Always use HTTPS origins in production
- Avoid using wildcard (`*`) origins in production
- Regularly review and update allowed origins
- Consider using environment-specific configuration files
