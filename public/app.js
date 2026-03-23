const rpc = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const connection = new solanaWeb3.Connection(rpc);

let wallet = null;

const walletBtn = document.getElementById("walletBtn");
const walletAddress = document.getElementById("walletAddress");
const mintBtn = document.getElementById("mintBtn");
const amountInput = document.getElementById("amount");
const warAmount = document.getElementById("warAmount");
const statusText = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

walletBtn.onclick = async () => {
  if (!window.solana) {
    alert("Install Phantom Wallet");
    return;
  }

  if (!wallet) {
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();

    walletAddress.innerText = wallet.slice(0,4) + "..." + wallet.slice(-4);
    walletBtn.innerText = "Disconnect";
  } else {
    wallet = null;
    walletAddress.innerText = "Not connected";
    walletBtn.innerText = "Connect Wallet";
  }
};

amountInput.oninput = () => {
  const val = parseFloat(amountInput.value) || 0;
  const war = val * 100000;
  warAmount.innerText = war.toLocaleString() + " WAR";
};

mintBtn.onclick = async () => {
  if (!wallet) {
    alert("Connect wallet first");
    return;
  }

  const amount = parseFloat(amountInput.value);

  if (amount < 0.1 || amount > 1) {
    alert("Min 0.1 SOL, Max 1 SOL");
    return;
  }

  try {
    statusText.innerText = "Processing...";

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(wallet),
        toPubkey: new solanaWeb3.PublicKey("Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec"),
        lamports: amount * 1e9
      })
    );

    tx.feePayer = new solanaWeb3.PublicKey(wallet);

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signed = await window.solana.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(sig);

    statusText.innerText = "Success: " + sig;

    updateProgress(amount);

  } catch (err) {
    statusText.innerText = "Error";
    console.log(err);
  }
};

let total = 0;
function updateProgress(amount) {
  total += amount;
  const percent = Math.min((total / 100) * 100, 100);
  progressBar.style.width = percent + "%";
}
