document.addEventListener('DOMContentLoaded', () => {
  let playerTokens = 0;

  const loginBox = document.getElementById('login-box');
  const mainApp = document.getElementById('main-app');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const usernameInput = document.getElementById('username');
  const loginMsg = document.getElementById('login-msg');
  const playerNameEl = document.getElementById('player-name');
  const tokenBalanceEl = document.getElementById('token-balance');

  const gameArea = document.getElementById('game-area');
  const gameContainer = document.getElementById('game-container');

  const storeArea = document.getElementById('store-area');

  const tokenAnim = document.getElementById('token-animation');

  // --------- Connexion / Création compte ---------
  const users = JSON.parse(localStorage.getItem('users')||'{}');
  const currentUser = localStorage.getItem('currentUser');
  if(currentUser && users[currentUser]) {
    playerTokens = users[currentUser].tokens;
    showMainApp(currentUser);
  } else {
    loginBox.classList.remove('hidden');
  }

  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if(!username) { loginMsg.innerText="Entrez un pseudo !"; return; }
    let users = JSON.parse(localStorage.getItem('users')||'{}');
    if(!users[username]) users[username]={tokens:100};
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', username);
    playerTokens = users[username].tokens;
    showMainApp(username);
  });

  logoutBtn.addEventListener('click', () => {
    saveTokens();
    localStorage.removeItem('currentUser');
    mainApp.classList.add('hidden');
    loginBox.classList.remove('hidden');
    loginMsg.innerText='';
  });

  function showMainApp(username) {
    loginBox.classList.add('hidden');
    mainApp.classList.remove('hidden');
    playerNameEl.innerText = username;
    updateTokens();
  }

  function updateTokens() {
    tokenBalanceEl.innerText = playerTokens;
    tokenBalanceEl.classList.add('animate');
    setTimeout(()=> tokenBalanceEl.classList.remove('animate'),300);
  }

  function saveTokens() {
    const username = localStorage.getItem('currentUser');
    if(!username) return;
    let users = JSON.parse(localStorage.getItem('users')||'{}');
    users[username].tokens = playerTokens;
    localStorage.setItem('users', JSON.stringify(users));
  }

  // --------- GAMES ---------
  window.openGame = function(name){
    gameArea.classList.remove('hidden');
    gameContainer.innerHTML='';
    storeArea.classList.add('hidden');

    if(name==='slots') loadSlots();
    if(name==='roulette') loadRoulette();
    if(name==='dice') loadDice();
    if(name==='wheel') loadWheel();
    if(name==='coinFlip') loadCoinFlip();
    if(name==='guessNumber') loadGuessNumber();
    if(name==='blackjack') loadBlackjack();
  }

  window.closeGame = function(){
    gameArea.classList.add('hidden');
    saveTokens();
  }

  // --------- STORE ---------
  window.openStore = function() {
    storeArea.classList.remove('hidden');
    gameArea.classList.add('hidden');
  }
  window.closeStore = function() {
    storeArea.classList.add('hidden');
  }
  window.buyItem = function(item,price){
    if(playerTokens<price){ alert("Pas assez de jetons !"); return; }
    playerTokens -= price;
    updateTokens();
    saveTokens();
    const pop = document.createElement('div');
    pop.innerText=`+${item} acheté !`;
    pop.style.position='fixed';
    pop.style.top='50%';
    pop.style.left='50%';
    pop.style.transform='translate(-50%,-50%)';
    pop.style.fontSize='30px';
    pop.style.color='gold';
    pop.classList.add('animate-pop');
    document.body.appendChild(pop);
    setTimeout(()=> document.body.removeChild(pop),1000);
  }

  // --------- MINI-JEUX CLASSIQUES ---------
  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function animateTokens(count){
    for(let i=0;i<count;i++){
      const t = document.createElement('div');
      t.innerText='💰';
      t.style.position='absolute';
      t.style.fontSize=`${10+Math.random()*20}px`;
      t.style.left=`${Math.random()*window.innerWidth}px`;
      t.style.top='-30px';
      t.style.opacity=1;
      t.style.transition='transform 2s ease, opacity 2s ease';
      tokenAnim.appendChild(t);
      setTimeout(()=>{ t.style.transform=`translateY(${window.innerHeight+50}px) rotate(${Math.random()*360}deg)`; t.style.opacity=0; },50);
      setTimeout(()=> tokenAnim.removeChild(t),2100);
    }
  }

  function loadSlots(){
    gameContainer.innerHTML=`
      <h2>🎰 Machine à sous</h2>
      <div id="slot-reel">🍒 🍋 🍉</div>
      <input id="slot-bet" type="number" min="1" value="10">
      <button id="slot-spin">SPIN</button>
      <p id="slot-msg"></p>
    `;
    const reel=document.getElementById('slot-reel');
    const msg=document.getElementById('slot-msg');
    document.getElementById('slot-spin').onclick=()=>{
      const bet=parseInt(document.getElementById('slot-bet').value,10);
      if(isNaN(bet)||bet<=0){msg.innerText="Mise invalide"; return;}
      if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
      playerTokens-=bet;
      updateTokens();
      const sy=['🍒','🍋','🍉','⭐','7️⃣'];
      const r=[rand(sy),rand(sy),rand(sy)];
      reel.style.transform='scale(1.2)';
      setTimeout(()=>{ reel.innerText=r.join(' '); reel.style.transform='scale(1)'; },150);
      let gain=0;
      if(r[0]===r[1] && r[1]===r[2]) gain=bet*10;
      else if(r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) gain=bet*2;
      playerTokens+=gain;
      msg.innerText=gain>0?`Bravo! +${gain} jetons`:'Perdu';
      if(gain>0) animateTokens(Math.min(gain/5,20));
      updateTokens();
    }
  }

  // Pour l'exemple, les autres jeux peuvent être recréés de manière similaire
  // ----------------- BLACKJACK -----------------
  function loadBlackjack(){
    gameContainer.innerHTML=`
      <h2>🂡 Blackjack</h2>
      <button id="bj-deal">Distribuer</button>
      <div id="bj-msg"></div>
      <div id="bj-hand"></div>
    `;
    const msg = document.getElementById('bj-msg');
    const handDiv = document.getElementById('bj-hand');

    document.getElementById('bj-deal').onclick=()=>{
      const bet = 50;
      if(playerTokens<bet){ msg.innerText="Pas assez de jetons pour jouer !"; return;}
      playerTokens-=bet;
      updateTokens();

      const player = rand([15,16,17,18,19,20,21]);
      const dealer = rand([16,17,18,19,20,21]);

      handDiv.innerText = `Joueur: ${player} — Dealer: ${dealer}`;
      let gain=0;
      if(player>21) msg.innerText="Bust! Perdu";
      else if(player>dealer) { gain=bet*2; playerTokens+=gain; msg.innerText=`Gagné ! +${gain} jetons`; animateTokens(10); }
      else if(player===dealer){ gain=bet; playerTokens+=gain; msg.innerText="Égalité ! Jetons rendus"; }
      else msg.innerText="Perdu!";
      updateTokens();
    }
  }

});
