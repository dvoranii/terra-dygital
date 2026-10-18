import { useEffect, useRef, useState } from "react";
import { INITIAL_NODES, INITIAL_TRAFFIC } from "../data";

export interface TrafficPoint {
  time: string;
  throughput: number;
  apiRequests: number;
}

export interface NodeMetrics {
  latency: number;
  packetLoss: number;
}

const TICK_MS = 2000;
const MAX_POINTS = 12;

// Post-flush catch-up burst
const BURST_TICKS = 3;
const BURST_THROUGHPUT_MULT = 2;
const BURST_API_MULT = 1.7;
const BURST_RATE = 0.6;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const jitter = (v: number, amount: number) =>
  v + (Math.random() - 0.5) * 2 * amount;
// Glide toward a target instead of jumping
const approach = (current: number, target: number, rate = 0.3) =>
  current + (target - current) * rate;
const round1 = (v: number) => Math.round(v * 10) / 10;

const baseTraffic = INITIAL_TRAFFIC[INITIAL_TRAFFIC.length - 1];

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function seedTraffic(): TrafficPoint[] {
  const now = Date.now();
  return Array.from({ length: MAX_POINTS }, (_, i) => ({
    time: formatTime(now - (MAX_POINTS - 1 - i) * TICK_MS),
    throughput: Math.round(
      jitter(baseTraffic.throughput, baseTraffic.throughput * 0.06)
    ),
    apiRequests: Math.round(
      jitter(baseTraffic.apiRequests, baseTraffic.apiRequests * 0.06)
    ),
  }));
}

function seedNodeMetrics(): Record<string, NodeMetrics> {
  return Object.fromEntries(
    INITIAL_NODES.map((n) => [
      n.id,
      { latency: n.latency, packetLoss: n.packetLoss },
    ])
  );
}

export function useLiveMetrics(isOffline: boolean, flushCount: number) {
  const [traffic, setTraffic] = useState<TrafficPoint[]>(seedTraffic);
  const [nodeMetrics, setNodeMetrics] =
    useState<Record<string, NodeMetrics>>(seedNodeMetrics);

  // How many more ticks the catch-up burst should last
  const burstTicksLeft = useRef(0);

  // A flush just completed: arm the burst
  useEffect(() => {
    if (flushCount > 0) burstTicksLeft.current = BURST_TICKS;
  }, [flushCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      const bursting = !isOffline && burstTicksLeft.current > 0;
      if (bursting) burstTicksLeft.current -= 1;
      if (isOffline) burstTicksLeft.current = 0; // an outage cancels any burst

      setTraffic((prev) => {
        const last = prev[prev.length - 1];

        let throughputTarget = baseTraffic.throughput;
        let apiTarget = baseTraffic.apiRequests;
        let rate = 0.3;

        if (isOffline) {
          throughputTarget = baseTraffic.throughput * 0.12;
          apiTarget = baseTraffic.apiRequests * 0.08;
        } else if (bursting) {
          throughputTarget = baseTraffic.throughput * BURST_THROUGHPUT_MULT;
          apiTarget = baseTraffic.apiRequests * BURST_API_MULT;
          rate = BURST_RATE;
        }

        const next: TrafficPoint = {
          time: formatTime(Date.now()),
          throughput: Math.round(
            Math.max(
              0,
              jitter(
                approach(last.throughput, throughputTarget, rate),
                baseTraffic.throughput * 0.05
              )
            )
          ),
          apiRequests: Math.round(
            Math.max(
              0,
              jitter(
                approach(last.apiRequests, apiTarget, rate),
                baseTraffic.apiRequests * 0.05
              )
            )
          ),
        };
        return [...prev.slice(-(MAX_POINTS - 1)), next];
      });

      setNodeMetrics((prev) => {
        const next: Record<string, NodeMetrics> = {};
        for (const base of INITIAL_NODES) {
          const cur = prev[base.id];
          const latencyTarget = isOffline ? base.latency * 3.5 : base.latency;
          const lossTarget = isOffline ? base.packetLoss + 6 : base.packetLoss;

          next[base.id] = {
            latency: Math.round(
              clamp(
                jitter(
                  approach(cur.latency, latencyTarget),
                  base.latency * 0.05
                ),
                1,
                999
              )
            ),
            packetLoss: round1(
              clamp(jitter(approach(cur.packetLoss, lossTarget), 0.15), 0, 100)
            ),
          };
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isOffline]);

  return { traffic, nodeMetrics };
}
