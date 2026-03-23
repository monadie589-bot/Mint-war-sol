const RPC = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const connection = new solanaWeb3.Connection(RPC);

const supabase = supabase.createClient(
  "https://zdwolnqdknlnzktbpfig.supabase.co",
  "sb_publishable__dDKpBQAKtUo_Xxal9x4kQ_UcpaNn0N"
);

const receiver = "Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec";

let wallet = null;

const walletBtn = document.getElementById("walletBtn");
const walletText = document.getElementById("wallet");
const amountInput = document.getElementById("amount");
const warText = document.getElementById("war");
const status = document.getElementById("status");

walletBtn.onclick = async () => {
  if (!wallet) {
    wallet = await window.solana.connect();
    walletText.innerText = wallet.publicKey.toString().slice(0,4)+"..."+wallet.publicKey.toString().slice(-4);
    walletBtn.innerText = "Disconnect";
  } else {
    wallet = null;
    walletText.innerText = "Not connected";
    walletBtn.innerText = "Connect Wallet";
  }
};

amountInput.oninput = () => {
  const val = parseFloat(amountInput.value);
  if (!val) return warText.innerText = "0 WAR";
  warText.innerText = (val * 100000).toLocaleString() + " WAR";
};

document.getElementById("mintBtn").onclick = async () => {
  if (!wallet) return alert("Connect wallet");

  const amount = parseFloat(amountInput.value);
  if (amount < 0.1 || amount > 1) return alert("Min 0.1 - Max 1");

  try {
    status.innerText = "Processing...";

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new solanaWeb3.PublicKey(receiver),
        lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
      })
    );

    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(sig);

    await supabase.from("mints").insert([{
      wallet: wallet.publicKey.toString(),
      amount_sol: amount,
      amount_war: amount * 100000
    }]);

    status.innerText = "Success";
    loadData();

  } catch (e) {
    status.innerText = "Failed";
  }
};

async function loadData() {
  const { data } = await supabase.from("mints").select("*");

  let total = 0;
  data.forEach(i => total += i.amount_sol);

  document.getElementById("progressText").innerText = total + " / 100 SOL";
  document.getElementById("barFill").style.width = (total / 100 * 100) + "%";

  const top = data.sort((a,b)=>b.amount_sol-a.amount_sol).slice(0,5);
  const ul = document.getElementById("leaderboard");
  ul.innerHTML = "";

  top.forEach(i => {
    const li = document.createElement("li");
    li.innerText = i.wallet.slice(0,4)+"..."+i.wallet.slice(-4)+" - "+i.amount_sol+" SOL";
    ul.appendChild(li);
  });
}

loadData();
