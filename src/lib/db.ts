import { supabase } from "./supabaseClient";
import type { PaymentSettings } from "./localStorage";

export const fetchPaymentSettings = async (): Promise<PaymentSettings> => {
  const { data } = await supabase.from("payment_settings").select("*");
  const rows = Array.isArray(data) ? data : [];
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
  const payloads = [
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
  await supabase.from("payment_settings").upsert(payloads, {
    onConflict: "method,currency",
  });
};

