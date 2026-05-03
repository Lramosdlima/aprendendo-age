const POLL_MS = 60_000;

function versionUrl(): string {
  const base = import.meta.env.BASE_URL;
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}version.json`;
}

async function fetchRemoteBuild(): Promise<string | null> {
  try {
    const res = await fetch(versionUrl(), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "build" in data &&
      typeof (data as { build: unknown }).build === "string"
    ) {
      return (data as { build: string }).build;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Em produção, compara o build embutido com `/version.json` no servidor.
 * Se o deploy tiver uma versão mais nova, força `location.reload()`.
 */
export function startAppUpdateWatcher(): () => void {
  if (!import.meta.env.PROD) return () => {};

  const clientBuild = __APP_BUILD_ID__;
  if (!clientBuild || clientBuild === "dev") return () => {};

  let checking = false;
  const check = async () => {
    if (checking) return;
    checking = true;
    try {
      const remote = await fetchRemoteBuild();
      if (remote !== null && remote !== clientBuild) {
        window.location.reload();
      }
    } finally {
      checking = false;
    }
  };

  void check();
  const intervalId = window.setInterval(() => void check(), POLL_MS);
  const onVisible = () => {
    if (document.visibilityState === "visible") void check();
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
