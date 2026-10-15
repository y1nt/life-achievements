// Next.js can normalize the internal URL to localhost while the browser uses
// 127.0.0.1. Validate the actual Host header, with same-port loopback aliases.
export function allowedOrigin(
  origin: string | null,
  host: string | null,
  requestUrl: string,
) {
  if (!origin) return true;
  try {
    const source = new URL(origin);
    const internal = new URL(requestUrl);
    const target = new URL(`${internal.protocol}//${host || internal.host}`);
    if (source.origin !== origin || source.username || source.password)
      return false;
    if (source.origin === target.origin) return true;
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return (
      loopback.has(source.hostname) &&
      loopback.has(target.hostname) &&
      source.protocol === target.protocol &&
      source.port === target.port
    );
  } catch {
    return false;
  }
}
