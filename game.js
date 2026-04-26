// --- INITIAL STATE ---
const INTEREST_RATE = 0.15; 
const COLUMNS = 7;
const TOTAL_YEARS = 42; 

let player = {
    pos: 0, money: 5000, roth: 0, debt: 0, age: 20,
    salary: 1800, hasApt: false, hasInsurance: false,
    isInjured: false, turnsUntilHealed: 0, isStressed: false,
    isMarried: false, hasPet: false, parentsLiveIn: false
};

const boardPath = [];
for (let i = 0; i <= TOTAL_YEARS; i++) {
    let row = Math.floor(i / COLUMNS);
    let col = i % COLUMNS;
    if (row % 2 !== 0) col = (COLUMNS - 1) - col;

    let label = "Quiet Year";
    let type = "";

    if (i === 0) label = "Start";
    else if (i === 3) { label = "Apt Hunt"; type = "special"; }
    else if (i === 12) { label = "Insurance?"; type = "special"; }
    else if (i === 10 || i === 22 || i === 35) { label = "Roth IRA"; type = "special"; }
    else if (i % 5 === 0) { label = "Gig Work"; type = "gig"; }
    else if (i === TOTAL_YEARS) { label = "Retire!"; type = "finish"; }

    boardPath.push({ id: i, label: label, x: col, y: row, type: type });
}

function initBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = ""; 
    boardPath.forEach(tile => {
        const el = document.createElement('div');
        el.className = `tile ${tile.type || ''}`;
        el.innerHTML = `<span>${tile.label}</span><br><small>Age ${tile.id + 20}</small>`;
        el.style.gridColumnStart = tile.x + 1;
        el.style.gridRowStart = tile.y + 1;
        boardEl.appendChild(el);
    });
    movePlayer();
}

function movePlayer() {
    const target = boardPath[player.pos];
    const playerEl = document.getElementById('player');
    const tileSize = 80;
    const gap = 10;

    playerEl.style.left = `${target.x * (tileSize + gap) + 40}px`;
    playerEl.style.top = `${target.y * (tileSize + gap) + 40}px`;
    
    document.getElementById('money').innerText = Math.floor(player.money).toLocaleString();
    document.getElementById('roth').innerText = Math.floor(player.roth).toLocaleString();
    document.getElementById('debt').innerText = Math.floor(player.debt).toLocaleString();
    document.getElementById('ageDisplay').innerText = player.age;
    document.getElementById('insStatus').innerText = player.hasInsurance ? "Active" : "None";

    const sidebar = document.getElementById('sidebar');
    if (player.isInjured || player.debt > 3000) sidebar.classList.add('sidebar-danger');
    else sidebar.classList.remove('sidebar-danger');
}

function triggerImpact(isMega = false) {
    const sidebar = document.getElementById('sidebar');
    const anim = isMega ? 'apply-mega-jump' : 'apply-jump';
    sidebar.classList.add(anim);
    setTimeout(() => sidebar.classList.remove(anim), isMega ? 500 : 300);
}

async function rollDice() {
    document.getElementById('rollBtn').disabled = true;
    const diceEl = document.getElementById('dice');
    let roll = 0;
    for(let i=0; i<10; i++){
        roll = Math.floor(Math.random() * 3) + 1;
        diceEl.innerText = roll;
        await new Promise(r => setTimeout(r, 50));
    }

    player.money += player.salary;
    if(player.debt > 0) player.debt *= (1 + INTEREST_RATE);
    
    if(player.isInjured) {
        player.money -= 300; 
        player.turnsUntilHealed -= 1;
        if(player.turnsUntilHealed <= 0) player.isInjured = false;
    }

    if(player.isStressed && roll > 1) roll -= 1;

    if (player.money < -5000) {
        alert("BANKRUPTCY! Game Over.");
        location.reload();
        return;
    }

    player.pos += roll;
    player.age += roll;
    if (player.pos >= boardPath.length - 1) player.pos = boardPath.length - 1;
    
    movePlayer();
    handleSquare(player.pos);
}

function handleSquare(pos) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    const currentTile = boardPath[pos];
    choices.innerHTML = "";

    if (player.debt > 0 && player.money > 0 && pos !== TOTAL_YEARS) {
        const payAmount = Math.min(player.money, 1000);
        addButton(`🚨 REPAY LOAN: $${payAmount}`, () => {
            player.money -= payAmount;
            player.debt -= payAmount;
            movePlayer();
            handleSquare(pos);
        }, true);
    }

    if (currentTile.type === 'gig') {
        let gigPay = 100 + Math.floor(Math.random() * 200); 
        text.innerHTML = `<strong>Gig Work:</strong> Earned $${gigPay}.`;
        addButton("Collect Pay", () => { player.money += gigPay; nextTurn(); });
    }
    else if (pos === 3 && !player.hasApt) {
        text.innerHTML = `<strong>Apt Hunt:</strong> Security deposit is $2,200.`;
        addButton("Pay Cash", () => { player.money -= 2200; player.hasApt = true; nextTurn(); });
        addButton("Take Loan", () => { player.debt += 2200; player.hasApt = true; nextTurn(); });
    } 
    else if (pos === 12) {
        text.innerHTML = `<strong>Insurance:</strong> coverage for $500.`;
        addButton("Buy Insurance", () => { player.money -= 500; player.hasInsurance = true; nextTurn(); });
        addButton("Risk it", nextTurn);
    }
    else if (currentTile.label === "Roth IRA") {
        text.innerHTML = `<strong>Roth IRA:</strong> Invest $1,500?`;
        addButton("Invest $1,500", () => { player.money -= 1500; player.roth += 1500; nextTurn(); });
        addButton("Skip", nextTurn);
    }
    else if (pos === TOTAL_YEARS) {
        let total = player.money + player.roth - player.debt;
        text.innerHTML = `<strong>RETIREMENT:</strong> Net Worth: $${Math.floor(total).toLocaleString()}.`;
    }
    else {
        const eventRoll = Math.random();
        if (eventRoll < 0.15) {
            text.innerHTML = "<strong>CRITICAL YEAR:</strong> Double Event!";
            triggerImpact(true);
            triggerStackedEvents(2);
        } else if (eventRoll < 0.60) {
            triggerImpact(false);
            triggerStackedEvents(1);
        } else {
            text.innerText = "A quiet year.";
            document.getElementById('rollBtn').disabled = false;
        }
    }
}

function triggerStackedEvents(count) {
    const text = document.getElementById('event-text');
    let pool = [
        { title: "Marriage", desc: "Wedding costs $5,000. Shared salary boost (+$400).", action: () => { player.money -= 5000; player.salary += 400; player.isMarried = true; }},
        { title: "New Pet", desc: "Vet & food cost $1,200 annually.", action: () => { player.money -= 1200; player.salary -= 100; player.hasPet = true; }},
        { title: "Parents Move In", desc: "Support costs increase (-$300/turn).", action: () => { player.salary -= 300; player.parentsLiveIn = true; }},
        { title: "Medical", desc: "Injury leak!", action: () => { if(!player.hasInsurance) { player.isInjured = true; player.turnsUntilHealed = 4; } else player.money -= 300; }},
        { title: "Laptop", desc: "New gear needed (-$1,000).", action: () => { player.money -= 1000; }}
    ];

    let chosen = [];
    for(let i=0; i<count; i++) chosen.push(pool[Math.floor(Math.random()*pool.length)]);

    text.innerHTML = count === 2 ? "<strong>DOUBLE EVENT!</strong><br><br>" : "";
    chosen.forEach(e => text.innerHTML += `<strong>${e.title}:</strong> ${e.desc}<br><br>`);

    addButton("Accept Fate", () => {
        chosen.forEach(e => e.action());
        nextTurn();
    });
}

function addButton(label, action, isDebt = false) {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = action;
    if(isDebt) btn.className = "pay-debt";
    document.getElementById('choices').appendChild(btn);
}

function nextTurn() {
    document.getElementById('choices').innerHTML = "";
    document.getElementById('event-text').innerText = "Progress logged.";
    document.getElementById('rollBtn').disabled = false;
    movePlayer();
}

document.getElementById('rollBtn').onclick = rollDice;
window.onload = initBoard;