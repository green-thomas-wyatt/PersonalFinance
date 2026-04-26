const COLUMNS = 7;
const TOTAL_YEARS = 42; 

let player = {
    pos: 0, money: 5000, roth: 0, debt: 0, shares: 0, age: 20,
    salary: 0, jobTitle: "", injuryRisk: 0, injuryMult: 1,
    hasInsurance: false, isInjured: false, turnsUntilHealed: 0,
    creditScore: 700, currentInterest: 0.15,
    retirementGoalName: "", retirementGoalAmount: 0,
    lifestyle: "Normal", hasHouse: false, hasCar: false,
    stockRumor: null, stress: 0,
    stockPrice: 100 // NEW: Starting stock price
};

const boardPath = [];
for (let i = 0; i <= TOTAL_YEARS; i++) {
    let row = Math.floor(i / COLUMNS);
    let col = i % COLUMNS;
    if (row % 2 !== 0) col = (COLUMNS - 1) - col;
    
    let label = "Quiet Year";
    let type = "";
    
    if (i < 14) type += " stage-city";
    else if (i < 28) type += " stage-suburb";
    else type += " stage-paradise";

    if (i === 0) label = "Start";
    else if (i === TOTAL_YEARS) { label = "Retire!"; type += " finish"; }
    else if (i % 10 === 5) { label = "Tax Season"; type += " tax"; }
    else if (i === 4 || i === 18) { label = "Buy Car?"; type += " special"; }
    else if (i === 12 || i === 26) { label = "Buy House?"; type += " house"; }
    else if (i === 10 || i === 22 || i === 35) { label = "Roth IRA"; type += " special"; }
    else if (i % 7 === 0) { label = "Gig Work"; type += " gig"; }

    boardPath.push({ id: i, label: label, x: col, y: row, type: type });
}

function selectRetirementGoal() {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    text.innerHTML = "<strong>Step 1: What is your retirement dream?</strong>";
    
    const goals = [
        { name: "RV Traveler", cost: 500000 },
        { name: "Suburban Comfort", cost: 1200000 },
        { name: "Luxury Mansion", cost: 2500000 }
    ];

    goals.forEach(g => {
        addButton(g.name + ` ($${(g.cost/1000000).toFixed(1)}M)`, () => {
            player.retirementGoalName = g.name;
            player.retirementGoalAmount = g.cost;
            document.getElementById('goalDisplay').innerText = g.name;
            choices.innerHTML = "";
            selectJob(); 
        });
    });
}

function selectJob() {
    // Salary here now represents BASE ANNUAL SAVINGS (Income minus living expenses)
    const jobs = [
        { title: "Teacher", salary: 12000, risk: 0.05, mult: 1 },
        { title: "Welder", salary: 28000, risk: 0.30, mult: 3 },
        { title: "Software Dev", salary: 45000, risk: 0.02, mult: 1 }
    ];

    const overlay = document.createElement('div');
    overlay.className = "job-overlay";
    const modal = document.createElement('div');
    modal.className = "job-modal";
    modal.innerHTML = `<h2>Step 2: Select Career</h2><div class="job-grid"></div>`;
    
    const grid = modal.querySelector('.job-grid');
    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = "job-card";
        card.innerHTML = `<h3>${job.title}</h3><p>Saves ~$${job.salary.toLocaleString()}/yr</p>`;
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

function movePlayer() {
    const target = boardPath[player.pos];
    const playerEl = document.getElementById('player');
    playerEl.style.left = `${target.x * 90 + 40}px`;
    playerEl.style.top = `${target.y * 90 + 40}px`;
    
    document.getElementById('money').innerText = Math.floor(player.money).toLocaleString();
    document.getElementById('shares').innerText = player.shares;
    document.getElementById('roth').innerText = Math.floor(player.roth).toLocaleString();
    document.getElementById('debt').innerText = Math.floor(player.debt).toLocaleString();
    document.getElementById('creditScore').innerText = player.creditScore;
    document.getElementById('ageDisplay').innerText = player.age;
    document.getElementById('jobDisplay').innerText = player.jobTitle;

    // UPDATE STRESS UI
    document.getElementById('stressDisplay').innerText = `${player.stress}%`;
    const stressBar = document.getElementById('stress-bar');
    stressBar.style.width = `${player.stress}%`;
    if (player.stress < 50) stressBar.style.background = "#2ecc71"; // Green
    else if (player.stress < 80) stressBar.style.background = "#f1c40f"; // Yellow
    else stressBar.style.background = "#e74c3c"; // Red
}

function showFloatText(amount) {
    const isPositive = amount >= 0;
    const floatEl = document.createElement('div');
    floatEl.className = 'float-text';
    floatEl.style.color = isPositive ? '#2ecc71' : '#e74c3c';
    floatEl.innerText = isPositive ? `+$${amount.toLocaleString()}` : `-$${Math.abs(amount).toLocaleString()}`;
    document.getElementById('player').appendChild(floatEl);
    setTimeout(() => { floatEl.remove(); }, 1500);
}

function handlePayment(amount) {
    if (player.money >= amount) {
        player.money -= amount;
        showFloatText(-amount);
    } else { 
        let left = amount - player.money; 
        player.money = 0; 
        player.debt += left;
        player.creditScore -= 30; 
        showFloatText(-amount);
        alert(`You didn't have enough cash! You took on $${left.toLocaleString()} in high-interest debt. Credit score dropped!`);
    }
}

async function rollDice() {
    const rollBtn = document.getElementById('rollBtn');
    const diceEl = document.getElementById('dice');
    rollBtn.disabled = true;
    diceEl.classList.add('dice-spin');
    
    let roll = 0;
    for(let i=0; i<10; i++){
        roll = Math.floor(Math.random() * 3) + 1;
        diceEl.innerText = roll;
        await new Promise(r => setTimeout(r, 50));
    }
    diceEl.classList.remove('dice-spin');

    // LIFESTYLE STRESS MODIFIERS
    let annualSavings = player.salary;
    if (player.lifestyle === "Frugal") { annualSavings += 8000; player.stress += (5 * roll); }
    if (player.lifestyle === "Luxury") { annualSavings -= 15000; player.stress = Math.max(0, player.stress - (10 * roll)); }
    
    let totalEarned = annualSavings * roll;

    // BURNOUT CHECK: If stress is 100+, you don't earn money this turn!
    if (player.stress >= 100) {
        totalEarned = 0; 
    }

    player.money += totalEarned;
    if (totalEarned > 0) showFloatText(totalEarned);

    if(player.debt > 0) player.debt *= (1 + player.currentInterest);
// FLUCTUATE STOCK MARKET (-20% to +30% generally)
let marketShift = (Math.random() * 0.50) - 0.20; 
    
// Apply rumors if they exist, then clear them
if (player.stockRumor === "boom") marketShift += 0.40;
if (player.stockRumor === "bust") marketShift -= 0.40;
player.stockRumor = null; 
// Add this inside initBoard(), right next to where you enable the rollBtn
document.getElementById('marketBtn').onclick = () => openStockMarket(player, movePlayer);
player.stockPrice = Math.max(5, Math.floor(player.stockPrice * (1 + marketShift)));

    player.pos = Math.min(player.pos + roll, boardPath.length - 1);
    player.age += roll;
    movePlayer(); 
    handleSquare(player.pos);
}

function handleSquare(pos) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    const currentTile = boardPath[pos];
    choices.innerHTML = "";

    // 🚨 Always offer Debt Repayment if they have debt and cash
// 🚨 Always offer Debt Repayment if they have debt and cash
if (player.debt > 0 && player.money > 0 && pos !== TOTAL_YEARS) {
    addButton(`🚨 REPAY DEBT`, () => { 
        // FIX: Now checks player.debt so you don't overpay!
        let pay = Math.min(player.money, player.debt, 5000); 
        player.money -= pay; 
        player.debt -= pay; 
        player.creditScore = Math.min(850, player.creditScore + 15); 
        movePlayer(); handleSquare(pos); 
    }, "pay-debt");
}

    // 📊 DECADE MILESTONES: Budget Review
    if (player.age % 10 === 0 && pos !== TOTAL_YEARS) {
        text.innerHTML = `<strong>Budget Review (Age ${player.age}):</strong> Choose your lifestyle for the next decade.`;
        addButton("Frugal (+ $8k/yr Savings, High Stress)", () => { player.lifestyle = "Frugal"; nextTurn(); });
        addButton("Normal (Balanced)", () => { player.lifestyle = "Normal"; nextTurn(); });
        addButton("Luxury (- $15k/yr Savings, Safe)", () => { player.lifestyle = "Luxury"; nextTurn(); });
        return; // Stop here so they must choose
    }

    // --- SPECIFIC TILE LOGIC ---
    if (currentTile.label === "Tax Season") {
        let taxAmount = Math.floor(player.salary * 0.20 * 2); 
        text.innerHTML = `<strong>Tax Season!</strong> Owe ~$${taxAmount.toLocaleString()}.`;
        addButton("Do them yourself (Free, 20% Audit Risk)", () => {
            if (Math.random() < 0.20) {
                alert("AUDIT! You made a mistake. Penalty: $3000.");
                handlePayment(taxAmount + 3000);
            } else handlePayment(taxAmount);
            nextTurn();
        });
        addButton("Hire CPA (-$500, Safe)", () => { handlePayment(taxAmount + 500); nextTurn(); });
    }
    else if (currentTile.label.includes("Buy Car")) {
        text.innerHTML = `<strong>Transportation:</strong> You need a vehicle. Credit Score: ${player.creditScore}.`;
        let goodRate = player.creditScore > 720 ? 0.05 : 0.15;
        addButton(`Reliable Car ($15k Loan @ ${goodRate*100}%)`, () => { player.debt += 15000; player.currentInterest = goodRate; player.hasCar = true; nextTurn(); });
        addButton("Used Beater (-$4000 Cash, Breakdowns likely)", () => { handlePayment(4000); player.hasCar = true; nextTurn(); });
    }
    else if (currentTile.label.includes("Buy House")) {
        text.innerHTML = `<strong>Real Estate:</strong> Stop renting? Credit Score: ${player.creditScore}.`;
        let mortgageRate = player.creditScore > 740 ? 0.03 : 0.08;
        addButton(`Buy House ($60k Downpayment @ ${mortgageRate*100}%)`, () => { 
            if(player.money >= 60000) { player.money -= 60000; player.hasHouse = true; player.creditScore += 20; nextTurn(); }
            else alert("Not enough cash for downpayment!"); 
        });
        addButton("Keep Renting", nextTurn);
    }
    else if (currentTile.label.includes("Roth IRA")) {
        text.innerHTML = `<strong>Retirement:</strong> Invest in your Roth IRA? (Tax-free growth!)`;
        addButton("Max out ($7,000)", () => { 
            if (player.money >= 7000) { player.money -= 7000; player.roth += 25000; showFloatText(-7000); nextTurn(); } 
            else alert("Not enough cash!"); 
        });
        addButton("Skip", nextTurn);
    }
    else if (currentTile.label.includes("Gig Work")) {
        let gigPay = 1000 + Math.floor(Math.random() * 4000);
        text.innerHTML = `<strong>Side Hustle:</strong> You completed a big project! Earned $${gigPay.toLocaleString()}.`;
        addButton("Collect Cash", () => { player.money += gigPay; showFloatText(gigPay); nextTurn(); });
    }
    else if (pos === TOTAL_YEARS) {
        // 🎉 GAME OVER LOGIC
        let netWorth = player.money + player.roth + (player.shares * 350) - player.debt; 
        if (player.hasHouse) netWorth += 350000; 
        
        let won = netWorth >= player.retirementGoalAmount;
        text.innerHTML = `<strong>RETIREMENT!</strong><br>Final Net Worth: $${Math.floor(netWorth).toLocaleString()}.<br>Goal: ${player.retirementGoalName} ($${player.retirementGoalAmount.toLocaleString()}).<br>`;
        text.innerHTML += won ? `<span style='color:green'>🎉 YOU ACHIEVED YOUR DREAM!</span>` : `<span style='color:red'>❌ YOU FELL SHORT OF YOUR GOAL.</span>`;
    } 
    // --- EMPTY TILE LOGIC ---
    else {
        // 1. BURNOUT EVENT OVERRIDE (Takes priority over everything else on an empty square)
        if (player.stress >= 100) {
            text.innerHTML = `<strong>🚨 BURNOUT BREAKDOWN!</strong><br>Your stress hit 100%. You couldn't work this round (earned $0) and had to check into a wellness retreat/hospital.`;
            addButton("Pay $5,000 & Recover", () => {
                handlePayment(5000);
                player.stress = 0; // Reset stress
                nextTurn();
            });
            return;
        }

        // 2. STOCK MARKET & RANDOM EVENTS
        if (player.stockRumor) {
            // If they heard a rumor last turn, trigger the market now
            openStockMarket(player, movePlayer, nextTurn);
            player.stockRumor = null; 
        } 
        else if (Math.random() < 0.15) { // 15% chance to hear a Stock Market Rumor
            let isBoom = Math.random() > 0.4;
            text.innerHTML = `<strong>Market News:</strong> Rumors say a ${isBoom ? "Tech Boom 📈" : "Recession 📉"} is coming next year.`;
            player.stockRumor = isBoom ? "boom" : "bust";
            addButton("Prepare", nextTurn);
        } 
        else { 
            // ALMOST 100% CHANCE FOR A LIFE EVENT NOW!
            triggerLifeEvent(player, handlePayment, nextTurn, addButton, movePlayer);
        }
    }
}

function addButton(l, a, c = "") {
    const b = document.createElement('button'); b.innerText = l; b.onclick = a;
    if (c) b.classList.add(c); document.getElementById('choices').appendChild(b);
}

function nextTurn() { 
    document.getElementById('choices').innerHTML = ""; 
    document.getElementById('event-text').innerText = "Ready to advance.";
    document.getElementById('rollBtn').disabled = false; 
    movePlayer(); 
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
// Link "Open Stock Market" to your original stocks.js logic
    document.getElementById('marketBtn').onclick = () => {
        openStockMarket(player, movePlayer);
    };

    // Link "Volatility Slots" to your slots.js logic
    document.getElementById('slotsBtn').onclick = () => {
        openSlotMachine();
    };

    document.getElementById('rollBtn').onclick = rollDice;
    document.getElementById('rollBtn').disabled = false;
    movePlayer();
}
document.addEventListener("DOMContentLoaded", selectRetirementGoal);