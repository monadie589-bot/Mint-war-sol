import { supabase } from "../lib/db.js";

export default async function handler(req, res){

  const { data } = await supabase
    .from("global")
    .select("*")
    .eq("id",1)
    .single();

  res.json(data);
}
