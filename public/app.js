const RPC = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const RECEIVER = "Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec";

const connection = new solanaWeb3.Connection(RPC);

let wallet = null;

const walletBtn = document.getElementById("walletBtn");
const walletText = document.getElementById("wallet");
const amountInput = document.getElementById("amount");
const slider = document.getElementById("slider");
const result = document.getElementById("result");
const statusText = document.getElementById("status");
const fill = document.getElementById("fill");
const progressText = document.getElementById("progressText");
const percent = document.getElementById("percent");

let totalSOL = 0;
const TARGET = 100;

walletBtn.onclick = async () => {
  if (!window.solana) return alert("Install Phantom");

  if (!wallet) {
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();
    walletText.innerText = wallet.slice(0,4)+"..."+wallet.slice(-4);
    walletBtn.innerText = "Disconnect";
  } else {
    wallet = null;
    walletText.innerText = "Not connected";
    walletBtn.innerText = "Connect Wallet";
  }
};

amountInput.addEventListener("input", () => {
  let val = parseFloat(amountInput.value) || 0;
  slider.value = val;
  updateWAR(val);
});

slider.addEventListener("input", () => {
  let val = parseFloat(slider.value);
  amountInput.value = val;
  updateWAR(val);
});

function setAmount(v){
  amountInput.value = v;
  slider.value = v;
  updateWAR(v);
}

function updateWAR(val){
  if(val < 0.1) return result.innerText = "Min 0.1";
  if(val > 1) return result.innerText = "Max 1";
  result.innerText = (val * 100000).toLocaleString()+" WAR";
}

document.getElementById("mintBtn").onclick = async () => {
  if(!wallet) return alert("Connect wallet");

  let val = parseFloat(amountInput.value);
  if(!val || val < 0.1 || val > 1) return alert("Invalid amount");

  try{
    statusText.innerText = "Processing...";

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(wallet),
        toPubkey: new solanaWeb3.PublicKey(RECEIVER),
        lamports: val * solanaWeb3.LAMPORTS_PER_SOL
      })
    );

    tx.feePayer = new solanaWeb3.PublicKey(wallet);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await window.solana.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    statusText.innerText = "Success: " + sig;

    totalSOL += val;
    updateProgress();

  } catch(e){
    statusText.innerText = "Error";
    console.error(e);
  }
};

function updateProgress(){
  let percentVal = (totalSOL / TARGET) * 100;
  fill.style.width = percentVal + "%";
  progressText.innerText = totalSOL.toFixed(2)+" / "+TARGET+" SOL";
  percent.innerText = percentVal.toFixed(2)+"%";
}

function countdown(){
  const end = new Date();
  end.setDate(end.getDate()+7);

  setInterval(()=>{
    const now = new Date();
    const diff = end - now;

    const d = Math.floor(diff/1000/60/60/24);
    const h = Math.floor(diff/1000/60/60)%24;

    document.getElementById("countdown").innerText = d+"D "+h+"H";
  },1000);
}

countdown();
