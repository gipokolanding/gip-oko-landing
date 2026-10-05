export type DemoConfig =
  | { status: "ready"; href: string }
  | { status: "unavailable" };

export function isValidDemoUrl(value: string): boolean {
  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed === "#" ||
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed === "/demo" ||
    trimmed.startsWith("/demo?") ||
    trimmed.startsWith("/demo#")
  ) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveDemoUrl(
  raw: string | undefined,
  nodeEnv: string,
): DemoConfig {
  void nodeEnv;

  if (typeof raw === "string" && isValidDemoUrl(raw)) {
    return { status: "ready", href: raw.trim() };
  }

  return { status: "unavailable" };
}
