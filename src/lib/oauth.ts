const GOOGLE_CLIENT_ID_PLACEHOLDERS = new Set([
  "google-client-id",
  "your-google-client-id",
  "replace-with-google-client-id",
]);

const GOOGLE_CLIENT_SECRET_PLACEHOLDERS = new Set([
  "google-client-secret",
  "your-google-client-secret",
  "replace-with-google-client-secret",
]);

function hasRealEnvValue(
  value: string | undefined,
  placeholders: ReadonlySet<string>,
): value is string {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return !placeholders.has(trimmed.toLowerCase());
}

export function isGoogleOAuthConfigured(): boolean {
  return (
    hasRealEnvValue(process.env.GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID_PLACEHOLDERS) &&
    hasRealEnvValue(process.env.GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_SECRET_PLACEHOLDERS)
  );
}
