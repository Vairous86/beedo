import type { PaymentSettings } from "./localStorage";

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
