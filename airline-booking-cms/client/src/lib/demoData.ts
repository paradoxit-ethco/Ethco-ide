export type Role = "super" | "technical" | "client";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Pending";
  initials: string;
};

export type DemoBooking = {
  id: string;
  passenger: string;
  route: string;
  departure: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  total: string;
};

export const seedUsers: DemoUser[] = [
  { id: "USR-001", name: "Selam Tesfaye", email: "selam@mila.travel", role: "super", status: "Active", initials: "ST" },
  { id: "USR-002", name: "Kebede Worku", email: "kebede@mila.travel", role: "technical", status: "Active", initials: "KW" },
  { id: "USR-003", name: "Mekdes Tadesse", email: "mekdes@client.demo", role: "client", status: "Active", initials: "MT" },
  { id: "USR-004", name: "Daniel Bekele", email: "daniel@client.demo", role: "client", status: "Pending", initials: "DB" },
];

export const seedBookings: DemoBooking[] = [
  { id: "ML-20841", passenger: "Mekdes Tadesse", route: "ADD → DXB", departure: "Aug 14 · 06:40", status: "Confirmed", total: "$482.00" },
  { id: "ML-20839", passenger: "Daniel Bekele", route: "LHR → ADD", departure: "Aug 14 · 11:15", status: "Confirmed", total: "$729.00" },
  { id: "ML-20836", passenger: "Sara Ahmed", route: "ADD → NBO", departure: "Aug 15 · 09:20", status: "Pending", total: "$318.50" },
  { id: "ML-20831", passenger: "Yonas Tesfaye", route: "CAI → ADD", departure: "Aug 15 · 17:55", status: "Confirmed", total: "$396.00" },
];

export const seedRoutes = [
  { code: "ET 602", route: "ADD → DXB", gate: "B12", health: "On time", load: "78%" },
  { code: "ML 118", route: "ADD → LHR", gate: "A08", health: "Boarding", load: "91%" },
  { code: "ET 909", route: "ADD → NBO", gate: "C02", health: "On time", load: "64%" },
];

export const seedIncidents = [
  { id: "INC-104", title: "Payment webhook latency", owner: "Technical team", severity: "Medium", updated: "12 min ago" },
  { id: "INC-102", title: "Route sync completed", owner: "Integration bot", severity: "Low", updated: "38 min ago" },
];

export const demoCredentials = [
  { role: "super" as Role, email: "admin@mila.demo", password: "mila123" },
  { role: "technical" as Role, email: "tech@mila.demo", password: "mila123" },
  { role: "client" as Role, email: "client@mila.demo", password: "mila123" },
];
