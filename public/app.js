const RPC = "https://mainnet.helius-rpc.com/?api-key=ddaf427f-5b96-4dd1-adb3-d928888a109b";
const RECEIVER = "Egp6tFjnQV9pZ277rS2m16fQbFPKYeZKGQ5RVYd9Mxec";

const connection = new solanaWeb3.Connection(RPC);

let wallet = null;
let lastMint = 0;

const maxCap = 100;
const saleEnd = new Date("2026-04-01");

const connectBtn = document.getElementById("connectBtn");
const walletText = document.getElementById("wallet");
const amountInput = document.getElementById("amount");
const resultText = document.getElementById("result");

connectBtn.onclick = async ()=>{
  if(!window.solana) return alert("Install Phantom");

  if(!wallet){
    const res = await window.solana.connect();
    wallet = res.publicKey.toString();
    walletText.innerText = wallet.slice(0,4)+"..."+wallet.slice(-4);
    connectBtn.innerText="Disconnect";
  }else{
    wallet=null;
    walletText.innerText="Not connected";
    connectBtn.innerText="Connect Wallet";
  }
};

amountInput.oninput = ()=>{
  const val = parseFloat(amountInput.value)||0;

  if(val<0.1) return resultText.innerText="Min 0.1";
  if(val>1) return resultText.innerText="Max 1";

  resultText.innerText = (val*100000).toLocaleString()+" WAR";
};

document.getElementById("mintBtn").onclick = async ()=>{
  if(!wallet) return alert("Connect wallet");

  const now = Date.now();
  if(now - lastMint < 5000) return alert("Slow down");

  const val = parseFloat(amountInput.value);
  if(!val || val<0.1 || val>1) return alert("Invalid");

  try{
    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey:new solanaWeb3.PublicKey(wallet),
        toPubkey:new solanaWeb3.PublicKey(RECEIVER),
        lamports:val*1e9
      })
    );

    tx.feePayer=new solanaWeb3.PublicKey(wallet);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;

    const signed=await window.solana.signTransaction(tx);
    const sig=await connection.sendRawTransaction(signed.serialize());

    lastMint=now;

    alert("SUCCESS "+sig);

  }catch(e){
    alert("FAILED");
  }
};

async function updateProgress(){
  try{
    const pubkey=new solanaWeb3.PublicKey(RECEIVER);

    const sigs = await connection.getSignaturesForAddress(pubkey,{limit:50});

    let total=0;

    for(let s of sigs){
      const tx = await connection.getParsedTransaction(s.signature);

      if(!tx) continue;

      const instr = tx.transaction.message.instructions;

      instr.forEach(i=>{
        if(i.program==="system" && i.parsed?.type==="transfer"){
          const lamports = i.parsed.info.lamports;
          const sol = lamports / 1e9;

          if(sol >= 0.1 && sol <= 1){
            total += sol;
          }
        }
      });
    }

    const percent = Math.min((total/maxCap)*100,100);

    document.getElementById("fill").style.width=percent+"%";
    document.getElementById("percent").innerText=percent.toFixed(2)+"%";
    document.getElementById("raised").innerText =
      total.toFixed(2)+" / "+maxCap+" SOL";

  }catch(e){}
}

setInterval(updateProgress,5000);
updateProgress();

function countdown(){
  const now=new Date();
  const diff=saleEnd-now;

  if(diff<=0){
    document.getElementById("countdown").innerText="ENDED";
    return;
  }

  const d=Math.floor(diff/86400000);
  const h=Math.floor((diff%86400000)/3600000);

  document.getElementById("countdown").innerText =
    d+"D "+h+"H";
}

setInterval(countdown,1000);
countdown();
