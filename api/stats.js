export default async function handler(req, res) {

  const RPC = process.env.RPC_URL;
  const WALLET = process.env.WALLET;

  try {

    const sigRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [WALLET, { limit: 20 }]
      })
    });

    const sigData = await sigRes.json();

    let total = 0;

    for (let tx of sigData.result) {

      if (tx.err !== null) continue;

      const txRes = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [tx.signature, "json"]
        })
      });

      const txData = await txRes.json();

      const meta = txData.result?.meta;

      if (!meta) continue;

      const pre = meta.preBalances[0];
      const post = meta.postBalances[0];

      const diff = (post - pre) / 1e9;

      if (diff > 0) {
        total += diff;
      }
    }

    res.status(200).json({ total });

  } catch (e) {
    res.status(500).json({ error: "fail" });
  }
}
