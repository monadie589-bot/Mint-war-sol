async function loadStats(){

  try{
    const res = await fetch("/api/stats");
    const data = await res.json();

    let total = data.total || 0;

    document.getElementById("progressText").innerText =
      total.toFixed(2) + " / 100 SOL";

    let percent = (total / 100) * 100;
    document.getElementById("fill").style.width = percent + "%";

  }catch(e){
    console.log("stats error");
  }
}

setInterval(loadStats, 5000);
loadStats();

let wallet = null;

const walletBtn = document.getElementById("walletBtn");
const walletText = document.getElementById("wallet");

walletBtn.onclick = async () => {
  if (!window.solana) return alert("Install Phantom");

  if (!wallet) {
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();
    walletText.innerText = wallet.slice(0,4)+"..."+wallet.slice(-4);
    walletBtn.innerText = "Disconnect";
  } else {
    await window.solana.disconnect();
    wallet = null;
    walletText.innerText = "Not connected";
    walletBtn.innerText = "Connect Wallet";
  }
};

const slider = document.getElementById("slider");
const input = document.getElementById("solInput");
const warText = document.getElementById("warAmount");

slider.oninput = () => {
  input.value = slider.value;
  update();
};

input.oninput = () => {
  slider.value = input.value;
  update();
};

function update(){
  let val = parseFloat(input.value || 0);
  warText.innerText = (val * 100000).toLocaleString()+" WAR";
}

let lastClick = 0;

document.getElementById("mintBtn").onclick = async () => {

  if (Date.now() - lastClick < 5000){
    return alert("Wait 5 seconds...");
  }

  lastClick = Date.now();

  if (!window.solana) return alert("Install wallet");

  const provider = window.solana;
  await provider.connect();

  const amount = parseFloat(document.getElementById("solInput").value);

  const tx = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: new solanaWeb3.PublicKey("Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec"),
      lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
    })
  );

  const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await provider.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());

  alert("Success: " + sig);
};

let total = 0;

function updateProgress(amount){
  total += amount;

  document.getElementById("progressText").innerText =
    total.toFixed(2)+" / 100 SOL";

  let percent = (total/100)*100;
  document.getElementById("fill").style.width = percent+"%";
}
