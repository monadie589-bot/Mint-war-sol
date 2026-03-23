import { supabase } from "../lib/supabase.js";

export default async function handler(req, res){

  const { data } = await supabase
    .from("mints")
    .select("*")
    .order("total_sol", { ascending:false })
    .limit(10);

  res.json(data);
}
