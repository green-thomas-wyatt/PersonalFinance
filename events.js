const randomEvents = [
    // --- NEGATIVE EVENTS (Now tied to specific insurance!) ---
    { title: "Medical Emergency 🚑", text: "You need an unexpected surgery.", cost: 8000, stressHit: 20, reqIns: 'health' },
    { title: "Roof Leak 🌧️", text: "Your roof started leaking. Repairs are required.", cost: 4500, stressHit: 15, houseOnly: true, reqIns: 'home' },
    { title: "Car Transmission Blew 🚗", text: "Your car gave out. Mechanics aren't cheap.", cost: 3500, stressHit: 20, carOnly: true, reqIns: 'auto' },
    { title: "Dental Work 🦷", text: "You need a root canal. Ouch.", cost: 1800, stressHit: 10, reqIns: 'health' },
    
    // --- STANDARD NEGATIVE EVENTS ---
    { title: "Crypto Scam 📉", text: "A friend convinced you to buy 'SquidCoin'. It tanked.", cost: 2500, stressHit: 15 },
    { title: "Wedding Year 💍", text: "You attended 4 weddings this year. Flights and gifts add up.", cost: 3000, stressHit: 5 },
    { title: "Identity Theft 🕵️", text: "Someone stole your credit card info. It's a mess.", cost: 1000, stressHit: 40, creditHit: 40 },
    { title: "Pet Illness 🐶", text: "Your dog ate something weird. Vet bill time.", cost: 1200, stressHit: 25 },
    { title: "Company Layoffs 📉", text: "Your company downsized. You were out of work for 3 months.", cost: 5000, stressHit: 30 },
    { title: "Sued for Minor Accident ⚖️", text: "You bumped someone's fence and they sued.", cost: 4000, stressHit: 35 },
    { title: "Speeding Ticket 🚓", text: "Caught going 85 in a 60 zone.", cost: 400, stressHit: 10 },
    { title: "Broken Phone 📱", text: "Dropped your phone in the toilet. Need a new one.", cost: 1000, stressHit: 15 },

    // --- POSITIVE EVENTS ---
    { title: "Inheritance 💰", text: "A distant relative left you some cash!", gain: 15000, stressRelief: 20 },
    { title: "Market Dividend 📈", text: "Your investments paid out a nice dividend.", gain: 2000, stressRelief: 5, requiresShares: true },
    { title: "Bonus at Work! 🎉", text: "Your boss recognized your hard work with a year-end bonus.", gain: 6000, stressRelief: 15 },
    { title: "Won Small Lottery 🎟️", text: "Scratched off a winner at the gas station!", gain: 500, stressRelief: 5 },
    { title: "Great Thrift Deal 🛋️", text: "Found a designer couch for $20 and flipped it.", gain: 300, stressRelief: 5 },
    
    // --- CHOICE EVENTS ---
    { title: "Spontaneous Vacation ✈️", text: "Your friends are going to Hawaii. It's expensive, but you really need a break.", isChoice: true, cost: 3500, stressRelief: 40, declineStressHit: 10 },
    { title: "Gym Membership 💪", text: "A premium gym opened up. Investing in health?", isChoice: true, cost: 1200, stressRelief: 20, declineStressHit: 0 },
    { title: "Expensive Dinner 🥩", text: "Coworkers invite you to a Michelin star restaurant.", isChoice: true, cost: 400, stressRelief: 10, declineStressHit: 5 },
    
    // --- INSIDE JOKE EVENTS ---
    { title: "Izzy Ortiz's Underground Glizzy Cartel 🌭", text: "You got caught buying unregulated, black-market hot dogs from Izzy Ortiz. The city fined you.", cost: 600, stressHit: 20 },
    { title: "Jordan Arce Strikes Again! 🤡", text: "Scam artist Jordan Arce sold you a 'Guaranteed Passive Income' vending machine. It dispenses gravel.", cost: 2500, stressHit: 35 },
    { title: "Wyatt Green's Wild Bet 🧅", text: "Wyatt Green bet you $1,000 that he could eat a raw onion without crying. He threw up immediately. You win!", gain: 1000, stressRelief: 15 },
    { title: "Cristina's MLM Scheme 🧴", text: "Cristina guilt-tripped you into buying a starter kit for her new pyramid scheme selling 'Fermented Essential Oils'.", cost: 800, stressHit: 15 },
    { title: "Flexing with Izzy Ortiz 🌭✨", text: "Izzy Ortiz opened a food truck selling $400 Wagyu Hot Dogs topped with gold flakes. Do you flex and buy one?", isChoice: true, cost: 400, stressRelief: 30, declineStressHit: 10 },
    { title: "Wyatt Green's 'Great Idea' 💻", text: "Wyatt Green 'borrowed' your laptop to mine cryptocurrency and completely melted the motherboard.", cost: 1500, stressHit: 25 },
    { title: "Cristina's 'Zen' Retreat 🧘‍♀️", text: "Cristina drags you to an expensive weekend meditation retreat where you just scream at trees. You actually feel amazing.", isChoice: true, cost: 600, stressRelief: 50, declineStressHit: 0 }
];

function triggerLifeEvent(player, handlePayment, nextTurn, addButton, movePlayer) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    choices.innerHTML = "";

    let validEvents = randomEvents.filter(e => {
        if (e.houseOnly && !player.hasHouse) return false;
        if (e.carOnly && !player.hasCar) return false;
        if (e.requiresShares && player.shares === 0) return false;
        return true;
    });

    const ev = validEvents[Math.floor(Math.random() * validEvents.length)];
    text.innerHTML = `<strong>${ev.title}</strong><br>${ev.text}`;

    if (!ev.isChoice) {
        if (ev.stressHit) player.stress = Math.min(100, player.stress + ev.stressHit);
        if (ev.stressRelief) player.stress = Math.max(0, player.stress - ev.stressRelief);
    }

    if (ev.isChoice) {
        text.innerHTML += `<br><em>(Do you spend the money to reduce stress?)</em>`;
        addButton(`Go for it (-$${ev.cost}, -${ev.stressRelief}% Stress)`, () => {
            handlePayment(ev.cost);
            player.stress = Math.max(0, player.stress - ev.stressRelief);
            movePlayer(); nextTurn();
        });
        addButton(`Decline (+${ev.declineStressHit}% Stress)`, () => {
            player.stress = Math.min(100, player.stress + ev.declineStressHit);
            movePlayer(); nextTurn();
        }, "decline-btn");
    } 
    else if (ev.gain) {
        text.innerHTML += `<br><span style="color:green">You received $${ev.gain.toLocaleString()}!</span>`;
        addButton("Awesome", () => { player.money += ev.gain; movePlayer(); nextTurn(); });
    } 
    else if (ev.cost) {
        let finalCost = ev.cost;
        
        // FEATURE 1: Check Specific Insurance
        let isCovered = false;
        if (ev.reqIns === 'health' && player.insurance.health) isCovered = true;
        if (ev.reqIns === 'auto' && player.insurance.auto) isCovered = true;
        if (ev.reqIns === 'home' && player.insurance.home) isCovered = true;

        if (isCovered) {
            finalCost = Math.floor(ev.cost * 0.1); // Insurance covers 90%!
            text.innerHTML += `<br><span style="color:green">Your specific insurance policy kicked in! You only owe a $${finalCost.toLocaleString()} deductible.</span>`;
        } else {
            text.innerHTML += `<br><span style="color:red">You are uninsured for this! Full cost: $${finalCost.toLocaleString()}. (+${ev.stressHit}% Stress)</span>`;
        }

        addButton("Pay Bill", () => {
            handlePayment(finalCost);
            if (ev.creditHit) player.creditScore -= ev.creditHit;
            movePlayer(); nextTurn();
        });
    }
}

function triggerLifeEvent(player, handlePayment, nextTurn, addButton, movePlayer) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    choices.innerHTML = "";

    // Filter valid events based on player state
    let validEvents = randomEvents.filter(e => {
        if (e.houseOnly && !player.hasHouse) return false;
        if (e.carOnly && !player.hasCar) return false;
        if (e.requiresShares && player.shares === 0) return false;
        return true;
    });

    const ev = validEvents[Math.floor(Math.random() * validEvents.length)];
    text.innerHTML = `<strong>${ev.title}</strong><br>${ev.text}`;

    // Apply Stress Changes visually immediately if it's not a choice
    if (!ev.isChoice) {
        if (ev.stressHit) player.stress = Math.min(100, player.stress + ev.stressHit);
        if (ev.stressRelief) player.stress = Math.max(0, player.stress - ev.stressRelief);
    }

    // 1. Choice Events
    if (ev.isChoice) {
        text.innerHTML += `<br><em>(Do you spend the money to reduce stress?)</em>`;
        
        addButton(`Go for it (-$${ev.cost}, -${ev.stressRelief}% Stress)`, () => {
            handlePayment(ev.cost);
            player.stress = Math.max(0, player.stress - ev.stressRelief);
            movePlayer(); nextTurn();
        });
        
        addButton(`Decline (+${ev.declineStressHit}% Stress)`, () => {
            player.stress = Math.min(100, player.stress + ev.declineStressHit);
            movePlayer(); nextTurn();
        }, "decline-btn");
    } 
    // 2. Positive Gain Events
    else if (ev.gain) {
        text.innerHTML += `<br><span style="color:green">You received $${ev.gain.toLocaleString()}!</span>`;
        addButton("Awesome", () => {
            player.money += ev.gain;
            movePlayer(); nextTurn();
        });
    } 
    // 3. Negative Cost Events
    else if (ev.cost) {
        let finalCost = ev.cost;
        if (ev.insuranceMitigates && player.hasInsurance) {
            finalCost = Math.floor(ev.cost * 0.2); // Insurance covers 80%
            text.innerHTML += `<br><span style="color:green">Insurance covered most of it! You owe $${finalCost.toLocaleString()}.</span>`;
        } else {
            text.innerHTML += `<br><span style="color:red">It costs $${finalCost.toLocaleString()}. (+${ev.stressHit}% Stress)</span>`;
        }

        addButton("Pay Bill", () => {
            handlePayment(finalCost);
            if (ev.creditHit) player.creditScore -= ev.creditHit;
            movePlayer(); nextTurn();
        });
    }
}