function openStockMarket(player, movePlayer, nextTurn) {
    // Generate price based on rumor
    let basePrice = 50 + Math.floor(Math.random() * 150);
    if (player.stockRumor === "boom") basePrice += 200; // Sky high!
    if (player.stockRumor === "bust") basePrice = Math.max(5, basePrice - 100); // Crash!
    
    const overlay = document.createElement('div');
    overlay.className = "stock-overlay";
    overlay.innerHTML = `
        <div class="stock-modal">
            <h1>📈 Stock Market</h1>
            <div class="ticker-box">
                <p>Current Price per Share:</p>
                <div class="stock-price">$${basePrice}</div>
                <p>You own: <strong>${player.shares} shares</strong></p>
                <p>Cash available: $${Math.floor(player.money).toLocaleString()}</p>
            </div>
            <div class="market-btns">
                <button id="buyBtn" style="background:#22c55e">BUY 10 ($${basePrice * 10})</button>
                <button id="buyMaxBtn" style="background:#10b981">BUY MAX</button>
                <button id="sellBtn" style="background:#f59e0b">SELL ALL</button>
            </div>
            <button id="exitBtn" style="background:transparent; border:2px solid #475569; margin-top:20px; width:100%; color:white; padding:10px; cursor:pointer;">Exit Market</button>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('buyBtn').onclick = () => {
        let cost = basePrice * 10;
        if(player.money >= cost) {
            player.money -= cost; 
            player.shares += 10;
            document.body.removeChild(overlay); 
            movePlayer(); nextTurn();
        } else alert("Not enough cash!");
    };

    document.getElementById('buyMaxBtn').onclick = () => {
        let maxShares = Math.floor(player.money / basePrice);
        if(maxShares > 0) {
            player.money -= (maxShares * basePrice);
            player.shares += maxShares;
            document.body.removeChild(overlay); 
            movePlayer(); nextTurn();
        } else alert("Not enough cash!");
    };

    document.getElementById('sellBtn').onclick = () => {
        if (player.shares > 0) {
            let profit = player.shares * basePrice;
            player.money += profit; 
            player.shares = 0;
            alert(`Sold all shares for $${profit.toLocaleString()}!`);
            document.body.removeChild(overlay); 
            movePlayer(); nextTurn();
        } else alert("You don't own any shares!");
    };

    document.getElementById('exitBtn').onclick = () => { 
        document.body.removeChild(overlay); 
        movePlayer(); nextTurn(); 
    };
}