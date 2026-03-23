import { supabase } from "../lib/db.js";

export default async function handler(req, res){

  const { wallet, amount } = req.body;

  if(!wallet || !amount){
    return res.json({ error: "Invalid request" });
  }

  if(amount < 0.1 || amount > 1){
    return res.json({ error: "Min 0.1 / Max 1 SOL" });
  }

  const { data } = await supabase
    .from("mints")
    .select("*")
    .eq("wallet", wallet)
    .single();

  const total = data?.total_sol || 0;

  if(total + amount > 1){
    return res.json({ error: "Max 1 SOL per wallet" });
  }

  await supabase.from("mints").upsert({
    wallet,
    total_sol: total + amount
  });

  await supabase.rpc("increment_global", { amount });

  res.json({ success: true });
}
