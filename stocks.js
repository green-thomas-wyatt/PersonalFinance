// stocks.js - NO EXPORTS
function openStockMarket(player, movePlayer, nextTurn) {
    const price = 50 + Math.floor(Math.random() * 200);
    const overlay = document.createElement('div');
    overlay.className = "stock-overlay";
    overlay.innerHTML = `
        <div class="stock-modal">
            <h1>Market Page</h1>
            <p>Price: $${price}</p>
            <div class="market-btns">
                <button id="buyBtn" style="background:#22c55e">BUY 10</button>
                <button id="sellBtn" style="background:#f59e0b">SELL ALL</button>
            </div>
            <button id="exitBtn" style="background:transparent; border:1px solid #475569; margin-top:20px; width:100%; color:white;">Exit</button>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('buyBtn').onclick = () => {
        if(player.money >= price * 10) {
            player.money -= price * 10; player.shares += 10;
            movePlayer(); document.body.removeChild(overlay); nextTurn();
        } else alert("No cash!");
    };
    document.getElementById('sellBtn').onclick = () => {
        player.money += player.shares * price; player.shares = 0;
        movePlayer(); document.body.removeChild(overlay); nextTurn();
    };
    document.getElementById('exitBtn').onclick = () => { document.body.removeChild(overlay); nextTurn(); };
}