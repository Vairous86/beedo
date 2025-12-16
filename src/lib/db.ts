import type { PaymentSettings, Service, Platform, PackageOption, Order, AnalyticsEvent } from "./localStorage";

const resJson = async (res: Response) => {
  const j = await res.json();
  return j;
};

export const fetchPaymentSettings = async (): Promise<PaymentSettings> => {
  const res = await fetch("/api/json/payment_settings", { method: "GET" });
  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  const find = (m: string, c: string) =>
    rows.find((r: any) => r.method === m && r.currency === c);
  const stc = find("STC Pay", "SAR");
  const rajhi = find("Al Rajhi", "SAR");
  const voda = find("Vodafone Cash", "EGP");
  return {
    stcPayNumber: stc?.account_number || "",
    alRajhiAccount: rajhi?.account_number || "",
    vodafoneCash: voda?.account_number || "",
    stcPayQr: stc?.qr_url || "",
    alRajhiQr: rajhi?.qr_url || "",
    vodafoneQr: voda?.qr_url || "",
  };
};

export const savePaymentSettings = async (
  s: PaymentSettings
): Promise<void> => {
  const payloads: Array<{
    id?: string;
    method: string;
    account_number: string;
    qr_url: string;
    currency: string;
  }> = [
    {
      method: "STC Pay",
      account_number: s.stcPayNumber,
      qr_url: s.stcPayQr || "",
      currency: "SAR",
    },
    {
      method: "Al Rajhi",
      account_number: s.alRajhiAccount,
      qr_url: s.alRajhiQr || "",
      currency: "SAR",
    },
    {
      method: "Vodafone Cash",
      account_number: s.vodafoneCash,
      qr_url: s.vodafoneQr || "",
      currency: "EGP",
    },
  ];
  const res = await fetch("/api/json/payment_settings", { method: "GET" });
  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  for (const p of payloads) {
    const existing = rows.find(
      (r: any) => r.method === p.method && r.currency === p.currency
    );
    if (existing) {
      await fetch("/api/json/payment_settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existing.id, ...p }),
      });
    } else {
      await fetch("/api/json/payment_settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    }
  }
};

export async function getPlatforms() {
  const res = await fetch("/api/json/platforms");
  return await resJson(res);
}

export async function addPlatform(payload: any) {
  const res = await fetch("/api/json/platforms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await resJson(res);
}

export async function getServices() {
  const res = await fetch("/api/json/services");
  return await resJson(res);
}

export async function addService(payload: Omit<Service, "id">) {
  const res = await fetch("/api/json/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload }),
  });
  return await resJson(res);
}

export async function updateService(id: string, updates: Partial<Service>) {
  const res = await fetch("/api/json/services", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  return await resJson(res);
}

export async function deleteService(id: string) {
  const res = await fetch("/api/json/services", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return await resJson(res);
}

export async function getAllPackages() {
  const res = await fetch("/api/json/packages");
  return await resJson(res);
}

export async function addPackage(pkg: Omit<PackageOption, "id">) {
  const res = await fetch("/api/json/packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...pkg }),
  });
  return await resJson(res);
}

export async function updatePackage(id: string, updates: Partial<PackageOption>) {
  const res = await fetch("/api/json/packages", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  return await resJson(res);
}

export async function deletePackage(id: string) {
  const res = await fetch("/api/json/packages", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return await resJson(res);
}

export async function getMostRequested() {
  const res = await fetch("/api/json/most_requested");
  return await resJson(res);
}

export async function upsertMostRequested(items: { service_id: string; visible: boolean; position?: number }[]) {
  for (const it of items) {
    await fetch("/api/json/most_requested", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...it, id: it.service_id }),
    });
  }
}

export async function getOrdersByUser(userId: string) {
  const res = await fetch("/api/json/orders");
  const json = await resJson(res);
  const arr = Array.isArray(json?.data) ? json.data : [];
  return { data: arr.filter((o: any) => o.user_id === userId) };
}

export async function addOrder(order: Omit<Order, "id" | "createdAt">) {
  const res = await fetch("/api/json/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return await resJson(res);
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const res = await fetch("/api/json/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return await resJson(res);
}

export async function addAnalytics(event: Omit<AnalyticsEvent, "id" | "timestamp">) {
  const res = await fetch("/api/json/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return await resJson(res);
}
