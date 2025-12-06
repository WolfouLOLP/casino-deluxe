// ---------------------------
// INITIALISATION DU JOUEUR
// ---------------------------
let playerTokens = parseInt(localStorage.getItem('playerTokens'), 10);
if (isNaN(playerTokens)) playerTokens = 100;

if (!localStorage.getItem('playerName')) {
  const pseudo = prompt("Bienvenue au casino ! Choisis ton pseudo :", "Joueur");
  localStorage.setItem('playerName', pseudo || "Joueur");
}

updateTokens();

// ---------------------------
// FONCTIONS UTILES
// ---------------------------
function updateTokens() {
  const balance = document.getElementById('token-balance');
  balance.innerText = `Jetons : ${playerTokens}`;
  localStorage.setItem('playerTokens', playerTokens);
  saveLeaderboard();

  balance.classList.add('animate');
  setTimeout(()=> balance.classList.remove('animate'), 300);
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ---------------------------
// LEADERBOARD
// ---------------------------
function saveLeaderboard() {
  const name = localStorage.getItem('playerName') || 'Joueur';
  let lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');

  const existing = lb.find(e=>e.name===name);
  if(existing){
    if(playerTokens > existing.tokens) existing.tokens = playerTokens;
  } else {
    lb.push({name, tokens: playerTokens});
  }

  lb.sort((a,b)=>b.tokens-a.tokens);
  localStorage.setItem('leaderboard', JSON.stringify(lb.slice(0,10)));
}

function openLeaderboard() {
  saveLeaderboard();
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game-area').classList.add('hidden');
  const area = document.getElementById('leaderboard-area');
  area.classList.remove('hidden');

  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';

  const lb = JSON.parse(localStorage.getItem('leaderboard')||'[]');
  if(lb.length===0) list.innerHTML="<li>Aucun joueur</li>";
  else lb.forEach((e,i)=>{
    const li = document.createElement('li');
    li.innerText = `${i+1}. ${e.name} — ${e.tokens} jetons`;
    list.appendChild(li);
  });
}

function closeLeaderboard(){
  document.getElementById('leaderboard-area').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
}

// ---------------------------
// RECHARGER JETONS
// ---------------------------
document.getElementById('refill-tokens').onclick = () => {
  if(playerTokens>0){
    alert("Tu as encore des jetons !");
    return;
  }
  playerTokens = 100;
  updateTokens();
  alert("Tes jetons ont été rechargés !");
}

// ---------------------------
// ANIMATION JETONS QUI TOMBENT
// ---------------------------
function animateTokens(count){
  const container = document.getElementById('token-animation');
  for(let i=0;i<count;i++){
    const token = document.createElement('div');
    token.innerText='💰';
    token.style.position='absolute';
    token.style.fontSize=`${10+Math.random()*20}px`;
    token.style.left=`${Math.random()*window.innerWidth}px`;
    token.style.top='-30px';
    token.style.opacity=1;
    token.style.transition='transform 2s ease, opacity 2s ease';
    container.appendChild(token);

    setTimeout(()=>{
      token.style.transform=`translateY(${window.innerHeight+50}px) rotate(${Math.random()*360}deg)`;
      token.style.opacity=0;
    },50);

    setTimeout(()=>container.removeChild(token),2100);
  }
}

// ---------------------------
// OUVRIR / FERMER JEUX
// ---------------------------
function openGame(name){
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('leaderboard-area').classList.add('hidden');
  const area = document.getElementById('game-area');
  const container = document.getElementById('game-container');
  area.classList.remove('hidden');
  container.innerHTML='';

  if(name==='slots') loadSlots(container);
  if(name==='roulette') loadRoulette(container);
  if(name==='dice') loadDice(container);
  if(name==='wheel') loadWheel(container);
  if(name==='coinFlip') loadCoinFlip(container);
  if(name==='guessNumber') loadGuessNumber(container);
  if(name==='blackjack') loadBlackjack(container); // <- AJOUTÉ
}

function closeGame(){
  document.getElementById('game-area').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  updateTokens();
}

// ---------------------------
// MINI-JEUX
// ---------------------------

// 🎰 Slots
function loadSlots(container){
  container.innerHTML=`
    <h2>🎰 Machine à sous</h2>
    <div id="slot-reel">🍒 🍋 🍉</div>
    <input id="slot-bet" type="number" min="1" value="10" />
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
    setTimeout(()=>{
      reel.innerText=r.join(' ');
      reel.style.transform='scale(1)';
    },150);

    let gain=0;
    if(r[0]===r[1] && r[1]===r[2]) gain=bet*10;
    else if(r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) gain=bet*2;
    playerTokens+=gain;
    msg.innerText=gain>0?`Bravo! +${gain} jetons`:'Perdu';
    if(gain>0) animateTokens(Math.min(gain/5,20));
    updateTokens();
  }
}

// 🎡 Roulette
function loadRoulette(container){
  container.innerHTML=`
    <h2>🎡 Roulette</h2>
    <input id="roulette-bet" type="number" min="1" value="10" />
    <button id="roulette-spin">TOURNER</button>
    <p id="roulette-msg"></p>
  `;
  const msg=document.getElementById('roulette-msg');
  document.getElementById('roulette-spin').onclick=()=>{
    const bet=parseInt(document.getElementById('roulette-bet').value,10);
    if(isNaN(bet)||bet<=0){msg.innerText="Mise invalide"; return;}
    if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
    playerTokens-=bet;
    updateTokens();

    const num=Math.floor(Math.random()*36);
    const win=Math.random()<0.5?bet*2:0;
    playerTokens+=win;
    msg.innerText=`Numéro: ${num} — Gain: ${win}`;
    if(win>0) animateTokens(Math.min(win/5,20));
    updateTokens();
  }
}

// 🎲 Dés
function loadDice(container){
  container.innerHTML=`
    <h2>🎲 Dés</h2>
    <input id="dice-bet" type="number" min="1" value="5" />
    <button id="dice-roll">LANCER</button>
    <p id="dice-msg"></p>
  `;
  const msg=document.getElementById('dice-msg');
  document.getElementById('dice-roll').onclick=()=>{
    const bet=parseInt(document.getElementById('dice-bet').value,10);
    if(isNaN(bet)||bet<=0){msg.innerText="Mise invalide"; return;}
    if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
    playerTokens-=bet;
    updateTokens();

    const r1=1+Math.floor(Math.random()*6);
    const r2=1+Math.floor(Math.random()*6);
    let gain=0;
    if(r1===r2) gain=bet*6;
    playerTokens+=gain;
    msg.innerText=gain>0?`Double ${r1}! +${gain} jetons`:`Résultat: ${r1}&${r2} — Perdu`;
    if(gain>0) animateTokens(Math.min(gain/5,20));
    updateTokens();
  }
}

// 🌀 Roue
function loadWheel(container){
  container.innerHTML=`
    <h2>🌀 Roue de la fortune</h2>
    <input id="wheel-bet" type="number" min="1" value="5" />
    <button id="wheel-spin">TOURNER</button>
    <p id="wheel-msg"></p>
  `;
  const msg=document.getElementById('wheel-msg');
  document.getElementById('wheel-spin').onclick=()=>{
    const bet=parseInt(document.getElementById('wheel-bet').value,10);
    if(isNaN(bet)||bet<=0){msg.innerText="Mise invalide"; return;}
    if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
    playerTokens-=bet;
    updateTokens();

    const multipliers=[0,0,1,2,3,5];
    const m=multipliers[Math.floor(Math.random()*multipliers.length)];
    const gain=bet*m;
    playerTokens+=gain;
    msg.innerText=`Multiplier: x${m} — Gain: ${gain}`;
    if(gain>0) animateTokens(Math.min(gain/5,20));
    updateTokens();
  }
}

// 🪙 Pile ou Face
function loadCoinFlip(container){
  container.innerHTML=`
    <h2>🪙 Pile ou Face</h2>
    <input id="coin-bet" type="number" min="1" value="10" />
    <select id="coin-choice">
      <option value="pile">Pile</option>
      <option value="face">Face</option>
    </select>
    <button id="coin-spin">Lancer</button>
    <p id="coin-msg"></p>
  `;
  const msg=document.getElementById('coin-msg');
  document.getElementById('coin-spin').onclick=()=>{
    const bet=parseInt(document.getElementById('coin-bet').value,10);
    const choice=document.getElementById('coin-choice').value;
    if(isNaN(bet)||bet<=0){msg.innerText="Mise invalide"; return;}
    if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
    playerTokens-=bet;
    updateTokens();

    const result=Math.random()<0.5?'pile':'face';
    const gain = choice===result? bet*2 : 0;
    playerTokens+=gain;
    msg.innerText=gain>0?`C'est ${result}! +${gain} jetons`:`C'est ${result}! Perdu`;
    if(gain>0) animateTokens(Math.min(gain/5,20));
    updateTokens();
  }
}

// 🔢 Chiffre Mystère
function loadGuessNumber(container){
  container.innerHTML=`
    <h2>🔢 Chiffre Mystère (1-5)</h2>
    <input id="guess-bet" type="number" min="1" value="10" />
    <input id="guess-number" type="number" min="1" max="5" value="1" />
    <button id="guess-btn">Deviner</button>
    <p id="guess-msg"></p>
  `;
  const msg=document.getElementById('guess-msg');
  document.getElementById('guess-btn').onclick=()=>{
    const bet=parseInt(document.getElementById('guess-bet').value,10);
    const guess=parseInt(document.getElementById('guess-number').value,10);
    if(isNaN(bet)||bet<=0||isNaN(guess)||guess<1||guess>5){msg.innerText="Mise ou chiffre invalide"; return;}
    if(playerTokens<bet){msg.innerText='Pas assez de jetons'; return;}
    playerTokens-=bet;
    updateTokens();

    const num=1+Math.floor(Math.random()*5);
    const gain=guess===num? bet*5 : 0;
    playerTokens+=gain;
    msg.innerText=gain>0?`Bravo ! ${num} ✅ +${gain} jetons`:`Perdu ! Le chiffre était ${num}`;
    if(gain>0) animateTokens(Math.min(gain/5,20));
    updateTokens();
  }
}

// 🃏 Blackjack
function loadBlackjack(container) {
  container.innerHTML = `
    <h2>🃏 Blackjack</h2>
    <input id="blackjack-bet" type="number" min="1" value="10" />
    <button id="blackjack-deal">DISTRIBUER</button>
    <button id="blackjack-hit">TIRER</button>
    <button id="blackjack-stand">STAND</button>
    <div id="blackjack-msg"></div>
    <div id="blackjack-cards" class="control-group"></div>
  `;

  const betInput = document.getElementById('blackjack-bet');
  const msg = document.getElementById('blackjack-msg');
  const cardsDiv = document.getElementById('blackjack-cards');
  let playerHand = [];
  let dealerHand = [];
  let bet = 0;
  let gameOver = true;

  function handValue(hand) {
    let sum = 0, aces = 0;
    for (let card of hand) {
      if (['J','Q','K'].includes(card)) sum += 10;
      else if (card === 'A') { sum += 11; aces++; }
      else sum += card;
    }
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    return sum;
  }

  function showHands(showDealer=false) {
    cardsDiv.innerHTML = `
      <div>🧑 Toi: ${playerHand.join(' ')} (Total: ${handValue(playerHand)})</div>
      <div>🤖 Dealer: ${showDealer ? dealerHand.join(' ') + ' (Total: ' + handValue(dealerHand) + ')' : dealerHand[0] + ' ?'}</div>
    `;
  }

  function dealCard(hand) {
    const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    hand.push(rand(cards));
  }

  document.getElementById('blackjack-deal').onclick = () => {
    bet = parseInt(betInput.value,10);
    if (isNaN(bet) || bet <= 0) { msg.innerText="Mise invalide"; return; }
    if (playerTokens < bet) { msg.innerText='Pas assez de jetons'; return; }

    playerTokens -= bet;
    updateTokens();
    playerHand = []; dealerHand = [];
    gameOver = false;
    dealCard(playerHand); dealCard(playerHand);
    dealCard(dealerHand); dealCard(dealerHand);
    msg.innerText = '';
    showHands();
  };

  document.getElementById('blackjack-hit').onclick = () => {
    if(gameOver){ msg.innerText="Clique sur DISTRIBUER d'abord !"; return; }
    dealCard(playerHand);
    showHands();
    const val = handValue(playerHand);
    if(val > 21){
      msg.innerText = `Bust! Tu perds ${bet} jetons`;
      gameOver = true;
      updateTokens();
    }
  };

  document.getElementById('blackjack-stand').onclick = () => {
    if(gameOver){ msg.innerText="Clique sur DISTRIBUER d'abord !"; return; }
    while(handValue(dealerHand)<17) dealCard(dealerHand);
    const playerVal = handValue(playerHand);
    const dealerVal = handValue(dealerHand);
    showHands(true);

    let gain = 0;
    if(dealerVal>21 || playerVal>dealerVal) gain = bet*2;
    else if(playerVal === dealerVal) gain = bet;
    playerTokens += gain;
    if(gain > 0) animateTokens(Math.min(gain/5,20));
    msg.innerText = gain > 0 ? `Tu gagnes ${gain} jetons!` : `Tu perds ${bet} jetons!`;
    gameOver = true;
    updateTokens();
  };
}
