const COLUMNS = 7;
const TOTAL_YEARS = 42; 

let player = {
    pos: 0, money: 5000, roth: 0, debt: 0, shares: 0, age: 20,
    salary: 0, jobTitle: "", injuryRisk: 0, injuryMult: 1,
    insurance: { health: false, auto: false, home: false }, // Feature 1: Specific Insurances
    hysa: 0, // Feature 2: High Yield Savings
    ccDebt: 0, // Feature 4: Credit Card Debt
    inflationMult: 1.0, // Feature 5: Inflation
    creditScore: 700, currentInterest: 0.15,
    retirementGoalName: "", retirementGoalAmount: 0,
    lifestyle: "Normal", hasHouse: false, hasCar: false,
    stockRumor: null, stress: 0,
    stockPrice: 100, spShares: 0, spPrice: 100 
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
    else if (i === 3) { label = "Night School"; type += " special"; } // Feature 3: Upskilling Tile
    else if (i % 7 === 0 && i !== 0) { label = "Gig Work"; type += " gig"; }

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
            player.retirementGoalName = g.name; player.retirementGoalAmount = g.cost;
            document.getElementById('goalDisplay').innerText = g.name;
            choices.innerHTML = ""; selectJob(); 
        });
    });
}

function selectJob() {
    const jobs = [
        { title: "Teacher", salary: 15000, risk: 0.05, mult: 1 },
        { title: "Welder", salary: 30000, risk: 0.30, mult: 3 },
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
        card.innerHTML = `<h3>${job.title}</h3><p>Base Savings ~$${job.salary.toLocaleString()}/yr</p>`;
        card.onclick = () => {
            Object.assign(player, { salary: job.salary, jobTitle: job.title, injuryRisk: job.risk, injuryMult: job.mult });
            document.body.removeChild(overlay); initBoard(); 
        };
        grid.appendChild(card);
    });
    overlay.appendChild(modal); document.body.appendChild(overlay);
}

function movePlayer() {
    const target = boardPath[player.pos];
    const playerEl = document.getElementById('player');
    playerEl.style.left = `${target.x * 90 + 40}px`;
    playerEl.style.top = `${target.y * 90 + 40}px`;
    
    document.getElementById('money').innerText = Math.floor(player.money).toLocaleString();
    document.getElementById('hysaDisplay').innerText = Math.floor(player.hysa).toLocaleString();
    document.getElementById('shares').innerText = player.shares;
    document.getElementById('spShares').innerText = player.spShares;
    
    document.getElementById('ccDebt').innerText = Math.floor(player.ccDebt).toLocaleString();
    document.getElementById('debt').innerText = Math.floor(player.debt).toLocaleString();
    
    document.getElementById('creditScore').innerText = player.creditScore;
    document.getElementById('ageDisplay').innerText = player.age;
    document.getElementById('jobDisplay').innerText = player.jobTitle;

    // Build Insurance Status String
    let insArr = [];
    if (player.insurance.health) insArr.push("Health");
    if (player.insurance.auto) insArr.push("Auto");
    if (player.insurance.home) insArr.push("Home");
    document.getElementById('insStatus').innerText = insArr.length > 0 ? insArr.join(", ") : "None";

    // STRESS UI
    document.getElementById('stressDisplay').innerText = `${player.stress}%`;
    const stressBar = document.getElementById('stress-bar');
    stressBar.style.width = `${player.stress}%`;
    if (player.stress < 50) stressBar.style.background = "#2ecc71"; 
    else if (player.stress < 80) stressBar.style.background = "#f1c40f"; 
    else stressBar.style.background = "#e74c3c"; 
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

// FEATURE 4: Good Debt vs Bad Debt
function handlePayment(amount) {
    if (player.money >= amount) {
        player.money -= amount;
        showFloatText(-amount);
    } else { 
        let left = amount - player.money; 
        player.money = 0; 
        
        // Put up to $10,000 on Credit Card, the rest goes to toxic Payday Loans
        if (player.ccDebt < 10000) {
            let spaceOnCard = 10000 - player.ccDebt;
            let charge = Math.min(left, spaceOnCard);
            player.ccDebt += charge;
            left -= charge;
            showFloatText(-charge);
            alert(`Used Credit Card for $${charge.toLocaleString()}. Pay it off next turn to avoid interest!`);
        }
        
        // If there's STILL debt left, it's a toxic Payday Loan
        if (left > 0) {
            player.debt += left;
            player.creditScore -= 30; 
            alert(`Credit maxed out! Took a toxic Payday Loan for $${left.toLocaleString()}. Credit score plummeted!`);
        }
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
        diceEl.innerText = roll; await new Promise(r => setTimeout(r, 50));
    }
    diceEl.classList.remove('dice-spin');

    // LIFESTYLE & INFLATION
    let annualSavings = player.salary;
    let baseExpense = 15000;
    
    // Feature 5: Inflation applies to your living expenses
    let actualExpense = baseExpense * player.inflationMult; 
    
    if (player.lifestyle === "Frugal") { actualExpense *= 0.6; player.stress += (5 * roll); }
    if (player.lifestyle === "Luxury") { actualExpense *= 1.8; player.stress = Math.max(0, player.stress - (10 * roll)); }
    
    let netAnnual = annualSavings - actualExpense;
    
    // Deduct Insurance Premiums
    if(player.insurance.health) netAnnual -= 1500;
    if(player.insurance.auto) netAnnual -= 800;
    if(player.insurance.home) netAnnual -= 500;

    let totalEarned = netAnnual * roll;

    // BURNOUT
    if (player.stress >= 100) totalEarned = 0; 

    player.money += totalEarned;
    if (totalEarned > 0) showFloatText(totalEarned);

    // FEATURE 2: HYSA Compound Interest (4.5% per year)
    for(let i=0; i<roll; i++) player.hysa *= 1.045;

    // FEATURE 4: Debt Compound Interest
    // Credit card interest is moderate (20% APY)
    for(let i=0; i<roll; i++) if (player.ccDebt > 0) { player.ccDebt *= 1.20; player.creditScore -= 5; }
    // Payday loan is bad, but survivable (40% APY)
    for(let i=0; i<roll; i++) if (player.debt > 0) player.debt *= 1.40;

    // Stocks
    let marketShift = (Math.random() * 0.50) - 0.20; 
    if (player.stockRumor === "boom") marketShift += 0.40;
    if (player.stockRumor === "bust") marketShift -= 0.40;
    player.stockRumor = null; 
    player.stockPrice = Math.max(5, Math.floor(player.stockPrice * (1 + marketShift)));
    let spShift = (Math.random() * 0.30) - 0.05; 
    player.spPrice = Math.max(10, Math.floor(player.spPrice * (1 + spShift)));

    player.pos = Math.min(player.pos + roll, boardPath.length - 1);
    player.age += roll; movePlayer(); handleSquare(player.pos);
}

function handleSquare(pos) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    const currentTile = boardPath[pos];
    choices.innerHTML = "";

    // 🚨 Repay Debts
    if ((player.ccDebt > 0 || player.debt > 0) && player.money > 0 && pos !== TOTAL_YEARS) {
        if (player.ccDebt > 0) {
            addButton(`💳 Pay Credit Card`, () => { 
                let pay = Math.min(player.money, player.ccDebt); 
                player.money -= pay; player.ccDebt -= pay; 
                if (player.ccDebt === 0) player.creditScore = Math.min(850, player.creditScore + 20); 
                movePlayer(); handleSquare(pos); 
            }, "pay-debt");
        }
        if (player.debt > 0) {
            addButton(`🚨 Pay Payday Loan`, () => { 
                let pay = Math.min(player.money, player.debt); 
                player.money -= pay; player.debt -= pay; movePlayer(); handleSquare(pos); 
            }, "pay-debt");
        }
    }

    // 📊 DECADE MILESTONES: Inflation & Budget
    if (player.age % 10 === 0 && pos !== TOTAL_YEARS) {
        player.inflationMult *= 1.20; // 20% Inflation Hit!
        text.innerHTML = `<strong>Budget Review (Age ${player.age}):</strong> Inflation just increased the cost of living by 20%. Choose your lifestyle.`;
        addButton("Frugal (Saves cash, High Stress)", () => { player.lifestyle = "Frugal"; nextTurn(); });
        addButton("Normal (Balanced)", () => { player.lifestyle = "Normal"; nextTurn(); });
        addButton("Luxury (Expensive, Safe)", () => { player.lifestyle = "Luxury"; nextTurn(); });
        return; 
    }

    // --- SPECIFIC TILES ---
    if (currentTile.label === "Night School") {
        text.innerHTML = `<strong>🎓 Invest in Yourself!</strong> Night school or a bootcamp will cost $10,000 and greatly increase your stress, but permanently boost your salary by $12,000/yr.`;
        addButton("Enroll (-$10k, +30% Stress)", () => {
            handlePayment(10000);
            player.salary += 12000;
            player.stress += 30;
            nextTurn();
        });
        addButton("Skip it", nextTurn);
    }
    else if (currentTile.label === "Tax Season") {
        let taxAmount = Math.floor(player.salary * 0.20 * 2); 
        text.innerHTML = `<strong>Tax Season!</strong> Owe ~$${taxAmount.toLocaleString()}.`;
        addButton("Do them yourself (Free, 20% Audit Risk)", () => {
            if (Math.random() < 0.20) { alert("AUDIT! Penalty: $3000."); handlePayment(taxAmount + 3000); } 
            else handlePayment(taxAmount);
            nextTurn();
        });
        addButton("Hire CPA (-$500, Safe)", () => { handlePayment(taxAmount + 500); nextTurn(); });
    }
    else if (currentTile.label.includes("Buy Car")) {
        text.innerHTML = `<strong>Transportation:</strong> You need a vehicle. Credit Score: ${player.creditScore}.`;
        let goodRate = player.creditScore > 720 ? 0.05 : 0.15;
        addButton(`Reliable Car ($15k Loan @ ${goodRate*100}%)`, () => { player.debt += 15000; player.hasCar = true; nextTurn(); });
        addButton("Used Beater (-$4000 Cash)", () => { handlePayment(4000); player.hasCar = true; nextTurn(); });
    }
    else if (currentTile.label.includes("Buy House")) {
        text.innerHTML = `<strong>Real Estate:</strong> Stop renting? Credit Score: ${player.creditScore}.`;
        let mortgageRate = player.creditScore > 740 ? 0.03 : 0.08;
        addButton(`Buy House ($60k Downpayment)`, () => { 
            if(player.money >= 60000) { player.money -= 60000; player.hasHouse = true; player.creditScore += 20; nextTurn(); }
            else alert("Not enough cash!"); 
        });
        addButton("Keep Renting", nextTurn);
    }
    else if (currentTile.label.includes("Roth IRA")) {
        text.innerHTML = `<strong>Retirement:</strong> Invest in your Roth IRA?`;
        addButton("Max out ($7,000)", () => { 
            if (player.money >= 7000) { player.money -= 7000; player.roth += 25000; showFloatText(-7000); nextTurn(); } 
            else alert("Not enough cash!"); 
        });
        addButton("Skip", nextTurn);
    }
    else if (currentTile.label.includes("Gig Work")) {
        let gigPay = 1000 + Math.floor(Math.random() * 4000);
        text.innerHTML = `<strong>Side Hustle:</strong> Earned $${gigPay.toLocaleString()}.`;
        addButton("Collect Cash", () => { player.money += gigPay; showFloatText(gigPay); nextTurn(); });
    }
    else if (pos === TOTAL_YEARS) {
        let netWorth = player.money + player.hysa + player.roth + (player.shares * player.stockPrice) + (player.spShares * player.spPrice) - player.ccDebt - player.debt; 
        if (player.hasHouse) netWorth += 350000; 
        
        let won = netWorth >= player.retirementGoalAmount;
        text.innerHTML = `<strong>RETIREMENT!</strong><br>Final Net Worth: $${Math.floor(netWorth).toLocaleString()}.<br>Goal: ${player.retirementGoalName} ($${player.retirementGoalAmount.toLocaleString()}).<br>`;
        text.innerHTML += won ? `<span style='color:green'>🎉 YOU ACHIEVED YOUR DREAM!</span>` : `<span style='color:red'>❌ YOU FELL SHORT OF YOUR GOAL.</span>`;
    } 
    else {
        // BURNOUT
        if (player.stress >= 100) {
            text.innerHTML = `<strong>🚨 BURNOUT BREAKDOWN!</strong><br>Stress hit 100%. Earned $0 this turn. Pay $5k to recover.`;
            addButton("Pay $5,000 & Recover", () => { handlePayment(5000); player.stress = 0; nextTurn(); });
            return;
        }

        if (player.stockRumor) {
            openStockMarket(player, movePlayer); player.stockRumor = null; 
        } else if (Math.random() < 0.15) {
            let isBoom = Math.random() > 0.4;
            text.innerHTML = `<strong>Market News:</strong> Rumors say a ${isBoom ? "Tech Boom 📈" : "Recession 📉"} is coming next year.`;
            player.stockRumor = isBoom ? "boom" : "bust";
            addButton("Prepare", nextTurn);
        } else { 
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
        el.style.gridColumnStart = tile.x + 1; el.style.gridRowStart = tile.y + 1;
        boardEl.appendChild(el);
    });

    document.getElementById('marketBtn').onclick = () => openStockMarket(player, movePlayer);
    document.getElementById('slotsBtn').onclick = () => openSlotMachine();
    document.getElementById('bankBtn').onclick = () => openBankMenu(player, movePlayer);
    document.getElementById('insBtn').onclick = () => openInsuranceBroker(player, movePlayer);

    document.getElementById('rollBtn').onclick = rollDice;
    document.getElementById('rollBtn').disabled = false;
    movePlayer();
}
document.addEventListener("DOMContentLoaded", selectRetirementGoal);