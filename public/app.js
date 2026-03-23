const RPC = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const RECEIVER = "Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec";

const connection = new solanaWeb3.Connection(RPC);

let wallet = null;
let lastMintTime = 0;

const maxCap = 100; // total target SOL
const saleEnd = new Date("2026-04-01T00:00:00");

const connectBtn = document.getElementById("connectBtn");
const walletText = document.getElementById("wallet");
const amountInput = document.getElementById("amount");
const resultText = document.getElementById("result");
const mintBtn = document.getElementById("mintBtn");

connectBtn.onclick = async () => {
  if (!window.solana) return alert("Install Phantom");

  if (!wallet) {
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();

    walletText.innerText = wallet.slice(0,4)+"..."+wallet.slice(-4);
    connectBtn.innerText = "Disconnect";
  } else {
    wallet = null;
    walletText.innerText = "Not connected";
    connectBtn.innerText = "Connect Wallet";
  }
};

amountInput.oninput = () => {
  const val = parseFloat(amountInput.value)||0;

  if (val < 0.1) return resultText.innerText="Min 0.1 SOL";
  if (val > 1) return resultText.innerText="Max 1 SOL";

  resultText.innerText = (val*100000).toLocaleString()+" WAR";
};

mintBtn.onclick = async () => {
  if (!wallet) return alert("Connect wallet");

  const now = Date.now();
  if (now - lastMintTime < 5000) return alert("Slow down");

  const val = parseFloat(amountInput.value);
  if (!val || val < 0.1 || val > 1) return alert("Invalid");

  try {
    mintBtn.disabled = true;

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(wallet),
        toPubkey: new solanaWeb3.PublicKey(RECEIVER),
        lamports: val * solanaWeb3.LAMPORTS_PER_SOL
      })
    );

    tx.feePayer = new solanaWeb3.PublicKey(wallet);

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signed = await window.solana.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    lastMintTime = now;
    alert("SUCCESS: "+sig);

  } catch(e) {
    alert("FAILED");
  }

  mintBtn.disabled = false;
};

async function updateProgress() {
  try {
    const pubkey = new solanaWeb3.PublicKey(RECEIVER);
    const balance = await connection.getBalance(pubkey);

    const sol = balance / solanaWeb3.LAMPORTS_PER_SOL;
    const percent = Math.min((sol / maxCap)*100, 100);

    document.getElementById("progressFill").style.width = percent+"%";
    document.getElementById("progressPercent").innerText = percent.toFixed(2)+"%";

  } catch(e) {}
}

setInterval(updateProgress, 5000);

function updateCountdown() {
  const now = new Date();
  const diff = saleEnd - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerText = "SALE ENDED";
    return;
  }

  const d = Math.floor(diff/86400000);
  const h = Math.floor((diff%86400000)/3600000);
  const m = Math.floor((diff%3600000)/60000);

  document.getElementById("countdown").innerText =
    d+"D "+h+"H "+m+"M";
}

setInterval(updateCountdown, 1000);
updateCountdown();
updateProgress();
