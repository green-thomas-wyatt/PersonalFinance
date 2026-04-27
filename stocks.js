function openStockMarket(player, movePlayer) {
    const overlay = document.createElement('div');
    overlay.className = "stock-overlay";
    
    // Create a wider modal with two columns for the two different stocks
    overlay.innerHTML = `
        <div class="stock-modal" style="max-width: 800px; width: 95%;">
            <h1>📈 Investment Brokerage</h1>
            <p style="color: #94a3b8; margin-bottom: 20px;">Cash available to invest: <strong style="color: #2ecc71;">$${Math.floor(player.money).toLocaleString()}</strong></p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                
                <div class="ticker-box" style="border-left-color: #ef4444;">
                    <h3>🚀 Volatile Tech Stock</h3>
                    <p style="font-size: 0.8rem; color: #cbd5e1;">High Risk, High Reward</p>
                    <div class="stock-price">$${player.stockPrice.toLocaleString()}</div>
                    <p>You own: <strong>${player.shares.toLocaleString()} shares</strong></p>
                    <p>Value: <strong style="color: #2ecc71;">$${(player.shares * player.stockPrice).toLocaleString()}</strong></p>
                    
                    <div class="market-btns" style="grid-template-columns: 1fr;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button id="buyBtn" style="background:#22c55e">BUY 10</button>
                            <button id="buyMaxBtn" style="background:#10b981">BUY MAX</button>
                        </div>
                        <button id="sellBtn" style="background:#f59e0b">SELL ALL</button>
                    </div>
                </div>

                <div class="ticker-box" style="border-left-color: #3b82f6;">
                    <h3>🛡️ S&P 500 Index</h3>
                    <p style="font-size: 0.8rem; color: #cbd5e1;">Averages ~10% annual return</p>
                    <div class="stock-price">$${player.spPrice.toLocaleString()}</div>
                    <p>You own: <strong>${player.spShares.toLocaleString()} shares</strong></p>
                    <p>Value: <strong style="color: #2ecc71;">$${(player.spShares * player.spPrice).toLocaleString()}</strong></p>
                    
                    <div class="market-btns" style="grid-template-columns: 1fr;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button id="spBuyBtn" style="background:#22c55e">BUY 10</button>
                            <button id="spBuyMaxBtn" style="background:#10b981">BUY MAX</button>
                        </div>
                        <button id="spSellBtn" style="background:#f59e0b">SELL ALL</button>
                    </div>
                </div>

            </div>
            <button id="exitBtn" style="background:transparent; border:2px solid #475569; margin-top:20px; width:100%; color:white; padding:10px; cursor:pointer;">Exit Brokerage</button>
        </div>`;
    document.body.appendChild(overlay);

    // --- TECH STOCK LOGIC ---
    document.getElementById('buyBtn').onclick = () => {
        let cost = player.stockPrice * 10;
        if(player.money >= cost) { player.money -= cost; player.shares += 10; refreshMarket(); } 
        else alert("Not enough cash!");
    };
    document.getElementById('buyMaxBtn').onclick = () => {
        let maxShares = Math.floor(player.money / player.stockPrice);
        if(maxShares > 0) { player.money -= (maxShares * player.stockPrice); player.shares += maxShares; refreshMarket(); } 
        else alert("Not enough cash!");
    };
    document.getElementById('sellBtn').onclick = () => {
        if (player.shares > 0) { let profit = player.shares * player.stockPrice; player.money += profit; player.shares = 0; refreshMarket(); } 
        else alert("You don't own any shares!");
    };

    // --- S&P 500 LOGIC ---
    document.getElementById('spBuyBtn').onclick = () => {
        let cost = player.spPrice * 10;
        if(player.money >= cost) { player.money -= cost; player.spShares += 10; refreshMarket(); } 
        else alert("Not enough cash!");
    };
    document.getElementById('spBuyMaxBtn').onclick = () => {
        let maxShares = Math.floor(player.money / player.spPrice);
        if(maxShares > 0) { player.money -= (maxShares * player.spPrice); player.spShares += maxShares; refreshMarket(); } 
        else alert("Not enough cash!");
    };
    document.getElementById('spSellBtn').onclick = () => {
        if (player.spShares > 0) { let profit = player.spShares * player.spPrice; player.money += profit; player.spShares = 0; refreshMarket(); } 
        else alert("You don't own any shares!");
    };

    // Re-renders the UI seamlessly without double-stacking popups
    function refreshMarket() {
        document.body.removeChild(overlay); 
        movePlayer(); 
        openStockMarket(player, movePlayer);
    }

    document.getElementById('exitBtn').onclick = () => { 
        document.body.removeChild(overlay); 
        movePlayer(); 
    };
}