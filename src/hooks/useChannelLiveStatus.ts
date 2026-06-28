import { useCallback, useEffect, useRef, useState } from "react";

import type { Channel } from "@/data/channels";
import { fetchChannelLiveStatus } from "@/lib/channelLiveStatus";

const POLL_INTERVAL_MS = 3 * 60 * 1000;

export function useChannelLiveStatus(channels: Channel[]) {
  const [liveIds, setLiveIds] = useState<Set<string>>(() => new Set());
  const [checking, setChecking] = useState(false);
  const channelsRef = useRef(channels);
  channelsRef.current = channels;

  const runCheck = useCallback(async () => {
    const list = channelsRef.current;
    const streamable = list.filter((c) => c.category === "youtube" || c.category === "twitch");
    if (streamable.length === 0) {
      setLiveIds(new Set());
      return;
    }

    setChecking(true);
    try {
      const ids = await fetchChannelLiveStatus(list);
      setLiveIds(ids);
    } catch {
      /* fail-open: mantém estado anterior */
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const streamable = channels.filter((c) => c.category === "youtube" || c.category === "twitch");
    if (streamable.length === 0) {
      setLiveIds(new Set());
      return;
    }

    let cancelled = false;

    void (async () => {
      setChecking(true);
      try {
        const ids = await fetchChannelLiveStatus(channels);
        if (!cancelled) setLiveIds(ids);
      } catch {
        /* fail-open */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    const intervalId = window.setInterval(() => {
      void runCheck();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [channels, runCheck]);

  return { liveIds, checking, refreshLiveStatus: runCheck };
}
