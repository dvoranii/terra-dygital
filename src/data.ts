export interface ClientNode {
  id: string;
  name: string;
  type: string;
  latency: number;
  packetLoss: number;
  status: "Operational" | "Degraded" | "Offline";
  queueCount: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: "success" | "warning" | "error";
  message: string;
}

export interface TrafficPoint {
  time: string;
  throughput: number;
  apiRequests: number;
}

export const INITIAL_NODES: ClientNode[] = [
  {
    id: "node-1",
    name: "Remote Mine Site (OT/IT)",
    type: "Resource & Field Operations",
    latency: 42,
    packetLoss: 0.1,
    status: "Operational",
    queueCount: 0,
  },
  {
    id: "node-2",
    name: "Regional Office",
    type: "Corporate IT & Branch Network",
    latency: 18,
    packetLoss: 0.0,
    status: "Operational",
    queueCount: 0,
  },
  {
    id: "node-3",
    name: "Cloud Gateway (M365 / Azure)",
    type: "Identity & SaaS Infrastructure",
    latency: 24,
    packetLoss: 0.0,
    status: "Operational",
    queueCount: 0,
  },
];

export const INITIAL_TRAFFIC: TrafficPoint[] = [
  { time: "01:00", throughput: 45, apiRequests: 22 },
  { time: "03:00", throughput: 88, apiRequests: 40 },
  { time: "05:00", throughput: 62, apiRequests: 55 },
  { time: "07:00", throughput: 110, apiRequests: 80 },
  { time: "09:00", throughput: 145, apiRequests: 112 },
  { time: "11:00", throughput: 95, apiRequests: 70 },
  { time: "13:00", throughput: 130, apiRequests: 90 },
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: "sec-1",
    timestamp: "16:58:10",
    type: "success",
    message: "Identity baseline check passed (simulated)",
  },
  {
    id: "sec-2",
    timestamp: "16:59:02",
    type: "warning",
    message: "Rate-limiting triggered on API Gateway",
  },
  {
    id: "sec-3",
    timestamp: "17:00:15",
    type: "success",
    message: "NIST CSF-inspired control check complete",
  },
];
