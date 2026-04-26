// --- INITIAL STATE ---
// NOTE: Imports are removed so this runs as a standard script. 
// Ensure events.js and stocks.js are listed ABOVE this file in index.html.

const COLUMNS = 7;
const TOTAL_YEARS = 42; 

let player = {
    pos: 0, money: 5000, roth: 0, debt: 0, shares: 0, age: 20,
    salary: 0, jobTitle: "", injuryRisk: 0, injuryMult: 1,
    hasApt: false, hasInsurance: false, isInjured: false,
    turnsUntilHealed: 0, isMarried: false, hasPet: false,
    petAgeLeft: 0, parentsLiveIn: false,
    creditScore: 700, isStressed: false, currentInterest: 0.15 
};

// --- BOARD PATH GENERATION ---
const boardPath = [];
for (let i = 0; i <= TOTAL_YEARS; i++) {
    let row = Math.floor(i / COLUMNS);
    let col = i % COLUMNS;
    if (row % 2 !== 0) col = (COLUMNS - 1) - col;
    let label = i === 0 ? "Start" : i === 3 ? "Apt Hunt" : i === 12 ? "Insurance?" : (i === 10 || i === 22 || i === 35) ? "Roth IRA" : i % 5 === 0 ? "Gig Work" : i === TOTAL_YEARS ? "Retire!" : "Quiet Year";
    let type = i === 3 || i === 12 || (i % 10 === 0 && i !== 0) ? "special" : i % 5 === 0 ? "gig" : i === TOTAL_YEARS ? "finish" : "";
    boardPath.push({ id: i, label: label, x: col, y: row, type: type });
}

// --- 1. BOOTUP: JOB SELECTION ---
function selectJob() {
    const jobs = [
        { title: "Teacher", salary: 3750, annual: 45000, risk: 0.05, mult: 1, desc: "Low risk, stable life." },
        { title: "Welder", salary: 7900, annual: 95000, risk: 0.40, mult: 3, desc: "High danger, triple costs!" },
        { title: "Junior Dev", salary: 10800, annual: 130000, risk: 0.02, mult: 1, desc: "Safe and high paying." }
    ];

    const overlay = document.createElement('div');
    overlay.className = "job-overlay";
    const modal = document.createElement('div');
    modal.className = "job-modal";
    modal.innerHTML = `<h2>Select Career</h2><div class="job-grid"></div>`;
    
    const grid = modal.querySelector('.job-grid');
    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = "job-card";
        card.innerHTML = `<h3>${job.title}</h3><p>$${job.annual.toLocaleString()}/yr</p>`;
        card.onclick = () => {
            Object.assign(player, { salary: job.salary, jobTitle: job.title, injuryRisk: job.risk, injuryMult: job.mult });
            document.body.removeChild(overlay);
            initBoard(); 
        };
        grid.appendChild(card);
    });
    overlay.appendChild(modal); 
    document.body.appendChild(overlay);
}

// --- 2. BOARD INIT ---
function initBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = ""; // Clear any existing content
    boardPath.forEach(tile => {
        const el = document.createElement('div');
        el.className = `tile ${tile.type || ''}`;
        el.innerHTML = `<span>${tile.label}</span><br><small>Age ${tile.id + 20}</small>`;
        el.style.gridColumnStart = tile.x + 1; 
        el.style.gridRowStart = tile.y + 1;
        boardEl.appendChild(el);
    });
    document.getElementById('rollBtn').onclick = rollDice;
    document.getElementById('rollBtn').disabled = false;
    movePlayer();
}

// --- 3. UI UPDATES ---
function movePlayer() {
    const target = boardPath[player.pos];
    const playerEl = document.getElementById('player');
    // Using 90 to match tile size (80px) + gap (10px)
    playerEl.style.left = `${target.x * 90 + 40}px`;
    playerEl.style.top = `${target.y * 90 + 40}px`;
    
    document.getElementById('money').innerText = Math.floor(player.money).toLocaleString();
    document.getElementById('shares').innerText = player.shares;
    document.getElementById('roth').innerText = Math.floor(player.roth).toLocaleString();
    document.getElementById('debt').innerText = Math.floor(player.debt).toLocaleString();
    document.getElementById('ageDisplay').innerText = player.age;
    document.getElementById('insStatus').innerText = player.hasInsurance ? "Active" : "None";
    document.getElementById('jobDisplay').innerText = player.jobTitle;
}

function handlePayment(amount) {
    if (player.money >= amount) player.money -= amount; 
    else { let left = amount - player.money; player.money = 0; player.debt += left; }
}

// --- 4. GAME LOOP ---
async function rollDice() {
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = true;
    let roll = 0;
    for(let i=0; i<10; i++){
        roll = Math.floor(Math.random() * 3) + 1;
        document.getElementById('dice').innerText = roll;
        await new Promise(r => setTimeout(r, 50));
    }

    player.money += player.salary;
    if(player.debt > 0) player.debt *= (1 + player.currentInterest);
    
    if(player.isInjured) { 
        handlePayment(300 * player.injuryMult); 
        player.turnsUntilHealed -= 1; 
        if(player.turnsUntilHealed <= 0) player.isInjured = false; 
    }

    if(player.isStressed && roll > 1) roll -= 1;

    player.pos = Math.min(player.pos + roll, boardPath.length - 1);
    player.age += roll;
    movePlayer(); 
    handleSquare(player.pos);
}

// --- 5. SQUARE LOGIC ---
function handleSquare(pos) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    const currentTile = boardPath[pos];
    choices.innerHTML = "";

    // Debt check
    if (player.debt > 0 && player.money > 0 && pos !== TOTAL_YEARS) {
        addButton(`🚨 REPAY DEBT`, () => { 
            let pay = Math.min(player.money, 2000);
            player.money -= pay; 
            player.debt -= pay; 
            movePlayer(); 
            handleSquare(pos); 
        }, "pay-debt");
    }

    if (currentTile.type === 'gig') {
        let pay = 150 + Math.floor(Math.random() * 200);
        text.innerHTML = `<strong>Gig Work:</strong> Task completed! Earned $${pay}.`;
        addButton("Collect Pay", () => { player.money += pay; nextTurn(); });
    } else if (pos === TOTAL_YEARS) {
        let netWorth = player.money + player.roth + (player.shares * 200) - player.debt;
        text.innerHTML = `<strong>RETIREMENT:</strong> Final Net Worth: $${Math.floor(netWorth).toLocaleString()}.`;
    } else {
        const r = Math.random();
        // CALLING GLOBAL FUNCTIONS (from events.js and stocks.js)
        if (r < player.injuryRisk) {
            processLifeEvents(1, true, player, movePlayer, nextTurn, addButton, handlePayment); 
        } 
        else if (r < 0.15) {
            openStockMarket(player, movePlayer, nextTurn); 
        } 
        else if (r < 0.65) {
            processLifeEvents(r < 0.25 ? 2 : 1, false, player, movePlayer, nextTurn, addButton, handlePayment);
        } 
        else { 
            text.innerText = "A quiet year. No major expenses."; 
            nextTurn(); 
        }
    }
}

// --- 6. UTILITIES ---
function addButton(l, a, c = "") {
    const b = document.createElement('button'); b.innerText = l; b.onclick = a;
    if (c) b.classList.add(c); document.getElementById('choices').appendChild(b);
}

function nextTurn() { 
    document.getElementById('choices').innerHTML = ""; 
    document.getElementById('rollBtn').disabled = false; 
    movePlayer(); 
}

// --- 7. STARTUP ---
document.addEventListener("DOMContentLoaded", selectJob);