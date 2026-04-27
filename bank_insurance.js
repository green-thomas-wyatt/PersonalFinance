function openBankMenu(player, movePlayer) {
    const overlay = document.createElement('div');
    overlay.className = "stock-overlay"; // Reuse your existing modal styles
    
    overlay.innerHTML = `
        <div class="stock-modal">
            <h1>🏦 The Bank</h1>
            <p>Move cash into your High-Yield Savings Account to earn a guaranteed <strong>4.5% interest</strong> per year. <br><small>(Emergency funds in checking earn 0%)</small></p>
            
            <div class="ticker-box" style="border-left-color: #27ae60;">
                <p>Checking Cash: <strong style="color:#2ecc71">$${Math.floor(player.money).toLocaleString()}</strong></p>
                <p>HYSA Balance: <strong style="color:#2ecc71">$${Math.floor(player.hysa).toLocaleString()}</strong></p>
            </div>
            
            <div class="market-btns">
                <button id="dep1kBtn" style="background:#22c55e">Deposit $1k</button>
                <button id="depAllBtn" style="background:#10b981">Deposit All</button>
                <button id="with1kBtn" style="background:#f59e0b">Withdraw $1k</button>
                <button id="withAllBtn" style="background:#d97706">Withdraw All</button>
            </div>
            <button id="exitBankBtn" style="background:transparent; border:2px solid #475569; margin-top:20px; width:100%; color:white; padding:10px; cursor:pointer;">Exit Bank</button>
        </div>`;
    document.body.appendChild(overlay);

    const refresh = () => { document.body.removeChild(overlay); movePlayer(); openBankMenu(player, movePlayer); };

    document.getElementById('dep1kBtn').onclick = () => { if(player.money >= 1000) { player.money -= 1000; player.hysa += 1000; refresh(); }};
    document.getElementById('depAllBtn').onclick = () => { player.hysa += player.money; player.money = 0; refresh(); };
    document.getElementById('with1kBtn').onclick = () => { if(player.hysa >= 1000) { player.hysa -= 1000; player.money += 1000; refresh(); }};
    document.getElementById('withAllBtn').onclick = () => { player.money += player.hysa; player.hysa = 0; refresh(); };
    document.getElementById('exitBankBtn').onclick = () => { document.body.removeChild(overlay); movePlayer(); };
}

function openInsuranceBroker(player, movePlayer) {
    const overlay = document.createElement('div');
    overlay.className = "stock-overlay";
    
    // Check if they own things to insure
    const canInsureHome = player.hasHouse ? "" : "disabled style='opacity:0.5; cursor:not-allowed;'";
    const canInsureAuto = player.hasCar ? "" : "disabled style='opacity:0.5; cursor:not-allowed;'";

    overlay.innerHTML = `
        <div class="stock-modal">
            <h1>📋 Insurance Broker</h1>
            <p>Annual premiums are deducted automatically. Protect yourself from ruin!</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                <button id="buyHealth" class="roll-btn" style="background: ${player.insurance.health ? '#7f8c8d' : '#3498db'};">
                    ${player.insurance.health ? "✅ Health Insured" : "Buy Health Insurance ($1,500/yr)"}
                </button>
                <button id="buyAuto" ${canInsureAuto} class="roll-btn" style="background: ${player.insurance.auto ? '#7f8c8d' : '#e67e22'};">
                    ${player.insurance.auto ? "✅ Auto Insured" : (player.hasCar ? "Buy Auto Insurance ($800/yr)" : "Buy Auto Insurance (Need Car)")}
                </button>
                <button id="buyHome" ${canInsureHome} class="roll-btn" style="background: ${player.insurance.home ? '#7f8c8d' : '#9b59b6'};">
                    ${player.insurance.home ? "✅ Home Insured" : (player.hasHouse ? "Buy Home Insurance ($500/yr)" : "Buy Home Insurance (Need House)")}
                </button>
            </div>
            
            <button id="exitInsBtn" style="background:transparent; border:2px solid #475569; margin-top:20px; width:100%; color:white; padding:10px; cursor:pointer;">Exit Broker</button>
        </div>`;
    document.body.appendChild(overlay);

    const refresh = () => { document.body.removeChild(overlay); movePlayer(); openInsuranceBroker(player, movePlayer); };

    document.getElementById('buyHealth').onclick = () => { if(!player.insurance.health) { player.insurance.health = true; refresh(); }};
    document.getElementById('buyAuto').onclick = () => { if(!player.insurance.auto && player.hasCar) { player.insurance.auto = true; refresh(); }};
    document.getElementById('buyHome').onclick = () => { if(!player.insurance.home && player.hasHouse) { player.insurance.home = true; refresh(); }};
    document.getElementById('exitInsBtn').onclick = () => { document.body.removeChild(overlay); movePlayer(); };
}