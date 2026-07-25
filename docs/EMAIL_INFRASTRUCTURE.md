# Email Infrastructure Strategy

## Development Environment

To bypass Resend `550 Testing emails can only be sent to your own verified email` restrictions during local development:

1. **Toggle Email Confirmations OFF** in the Supabase Dashboard:
   - Navigate to **Authentication → Providers → Email**
   - Set **"Enable Email Confirmations"** to `FALSE`

2. Alternatively, use Supabase's local email hook or auto-confirm user settings during local test execution.

> [!NOTE]
> With email confirmations disabled, new users are automatically confirmed upon registration, allowing immediate login without email verification.

## Production Environment

Before deploying to production:

1. **Re-enable email confirmation** in Supabase Dashboard.
2. **Configure custom domain DNS settings** (SPF, DKIM, DMARC) inside Resend.
3. **Update `SYSTEM_EMAIL_FROM`** to match the verified domain (e.g., `noreply@yourdomain.com`).
4. **Verify delivery** by testing the full registration → email verification → login flow.

## Email Flow Architecture

```
User Registration
  → Supabase Auth creates user in auth.users
  → handle_new_user() trigger creates profile in public.profiles
  → If email confirmation enabled:
      → Supabase sends verification email via configured provider
      → User clicks verification link
      → Redirected to /auth/callback with auth code
      → Code exchanged for session
  → If email confirmation disabled:
      → User is immediately confirmed
      → Can log in immediately after registration
```

## Environment Variables

| Variable | Development | Production |
|----------|------------|------------|
| Email Confirmations | OFF | ON |
| SYSTEM_EMAIL_FROM | N/A | noreply@yourdomain.com |
| Resend API Key | Not required | Required |
