const RPC = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const connection = new solanaWeb3.Connection(RPC);

let wallet = null;

const walletBtn = document.getElementById("walletBtn");
const walletText = document.getElementById("wallet");

walletBtn.onclick = async () => {
  if (!window.solana) return alert("Install Phantom");

  if (!wallet) {
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();

    walletText.innerText = wallet.slice(0,4)+"..."+wallet.slice(-4);
    walletBtn.innerText = "DISCONNECT";
  } else {
    await window.solana.disconnect();
    wallet = null;

    walletText.innerText = "Not connected";
    walletBtn.innerText = "CONNECT WALLET";
  }
};

/* SLIDER */
const slider = document.getElementById("slider");
const input = document.getElementById("solInput");
const warText = document.getElementById("warAmount");

slider.oninput = () => {
  input.value = slider.value;
  updateWAR();
};

input.oninput = () => {
  slider.value = input.value;
  updateWAR();
};

function updateWAR(){
  let sol = parseFloat(input.value || 0);
  let war = sol * 100000;
  warText.innerText = war.toLocaleString() + " WAR";
}

/* MINT FUNCTION */
document.getElementById("mintBtn").onclick = async () => {

  if (!wallet) return alert("Connect wallet first");

  let amount = parseFloat(input.value);

  if (!amount || amount < 0.1 || amount > 1){
    return alert("Min 0.1 - Max 1 SOL");
  }

  try{

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: window.solana.publicKey,
        toPubkey: new solanaWeb3.PublicKey("Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec"),
        lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
      })
    );

    tx.feePayer = window.solana.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await window.solana.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    alert("SUCCESS: " + sig);

    updateProgress(amount);

  } catch(e){
    alert("ERROR: " + e.message);
  }
};

/* PROGRESS */
let total = 0;

function updateProgress(amount){
  total += amount;

  document.getElementById("progressText").innerText =
    total.toFixed(2) + " / 100 SOL";

  let percent = (total / 100) * 100;
  document.getElementById("fill").style.width = percent + "%";
}
