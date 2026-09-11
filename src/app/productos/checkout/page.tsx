import { createClient } from "@/lib/supabase/server";
import type { Informacion } from "@/lib/types";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("informacion").select("*").eq("id", 1).single();
  const info = data as Informacion | null;

  return <CheckoutForm direccionLocal={info?.direccion} cuentasBancarias={info?.cuentas_bancarias ?? []} />;
}
