/** Normalize UI phone input to E.164 +255… for duplicate checks and Supabase. */
export function normalizeTanzanianPhoneInput(val: string): string {
  let v = val.trim();
  if (/^0\d{9}$/.test(v)) v = v.slice(1);
  if (/^[1-9]\d{8}$/.test(v)) v = `+255${v}`;
  return v;
}
