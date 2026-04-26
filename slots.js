// CRITICAL: This must be at the top of the file!
const SLOT_SYMBOLS = [
    { label: "🚀 TECH", mult: 40 },  // Payout: $40,000
    { label: "🏦 BANK", mult: 30 },  // Payout: $30,000
    { label: "🛍️ RETAIL", mult: 20 }, // Payout: $20,000
    { label: "📉 BEAR", mult: 10 }    // Payout: $10,000
];

function openSlotMachine() {
    const overlay = document.createElement('div');
    overlay.className = "slot-container-overlay";
    overlay.id = "slotOverlay";

    overlay.innerHTML = `
        <div class="slot-machine-body">
            <h2>🎰 Market Volatility Slot</h2>
            <div style="background: #0f172a; padding: 10px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #475569;">
                <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">YOUR SAVINGS</p>
                <h3 id="slotSavingsDisplay" style="margin: 5px 0; color: #2ecc71; font-family: monospace; font-size: 1.8rem;">
                    $${Math.floor(player.money).toLocaleString()}
                </h3>
            </div>
            <p>Cost per spin: <span style="color: #f1c40f;">$1,000</span></p>
            <div class="slot-reels-wrapper">
                <div class="slot-reel" id="s1">?</div>
                <div class="slot-reel" id="s2">?</div>
                <div class="slot-reel" id="s3">?</div>
            </div>
            <div class="slot-controls">
                <button id="slotSpinBtn" class="spin-active">SPIN</button>
                <button id="slotExitBtn" class="exit-btn">EXIT</button>
            </div>
            <p id="slotMessage" style="height: 20px; font-weight: bold; margin-top: 15px; color: white;">Good luck, investor.</p>
        </div>
    `;

    document.body.appendChild(overlay);

    const updateSlotUI = () => {
        const savingsEl = document.getElementById('slotSavingsDisplay');
        if (!savingsEl) return;
        savingsEl.innerText = `$${Math.floor(player.money).toLocaleString()}`;
        savingsEl.style.color = (player.money < 1000) ? "#e74c3c" : "#2ecc71";
    };

    document.getElementById('slotSpinBtn').onclick = async () => {
        const msg = document.getElementById('slotMessage');
        const spinBtn = document.getElementById('slotSpinBtn');
        
        if (player.money < 1000) {
            msg.innerText = "❌ NO MONEY IN SAVINGS!";
            msg.style.color = "#e74c3c";
            return;
        }

        // Disable UI
        spinBtn.disabled = true;
        spinBtn.style.opacity = "0.5";
        msg.style.color = "white";
        msg.innerText = "Spinning...";

        // Deduct money
        player.money -= 1000;
        updateSlotUI();
        if (typeof movePlayer === "function") movePlayer(); 

        let results = [];
        try {
            // Animate reels
            for (let i = 1; i <= 3; i++) {
                let reel = document.getElementById(`s${i}`);
                let finalPick = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
                results.push(finalPick);
                
                for(let j=0; j<8; j++) {
                    reel.innerText = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].label;
                    await new Promise(r => setTimeout(r, 60));
                }
                reel.innerText = finalPick.label;
            }

            // Calculate Payout
            if (results[0].label === results[1].label && results[1].label === results[2].label) {
                // Multiplier based on the symbol matched (10x to 40x)
                let payout = 1000 * results[0].mult;
                player.money += payout;
                msg.innerText = `💰 JACKPOT! +$${payout.toLocaleString()}`;
                msg.style.color = "#f1c40f";
                if (typeof showFloatText === "function") showFloatText(payout); 
            } else {
                msg.innerText = "Market remains flat. $0 payout.";
            }
        } catch (err) {
            console.error("Slot Error:", err);
            msg.innerText = "Error in the market!";
        }

        // Re-enable UI and Sync everything
        updateSlotUI();
        if (typeof movePlayer === "function") movePlayer();
        spinBtn.disabled = false;
        spinBtn.style.opacity = "1";
    };

    document.getElementById('slotExitBtn').onclick = () => {
        document.body.removeChild(overlay);
    };
}