// events.js - NO EXPORTS
const randomEvents = [
    {
        title: "The Predatory 'Quick Cash' Trap",
        desc: "An unexpected bill arrived. A lender offers $500 'hassle-free', but the fine print mentions a 400% APR.",
        choices: [
            { label: "Take the $500 (Debt grows faster!)", action: (p, hp) => { 
                p.debt += 500; p.money += 500; p.currentInterest += 0.05; 
            }},
            { label: "Default on bill (-$700 & Credit Hit)", action: (p, hp) => { 
                hp(700); p.creditScore -= 50; 
            }}
        ]
    },
    {
        title: "Uninsured Medical Emergency",
        desc: "You broke your arm. If you don't have insurance, this is going to hurt.",
        choices: [
            { label: "Pay full price", action: (p, hp) => { 
                const cost = p.hasInsurance ? 500 : 2500; hp(cost);
            }},
            { label: "Skip (Lost Productivity)", action: (p, hp) => { 
                p.isInjured = true; p.turnsUntilHealed = 6; 
            }}
        ]
    },
    {
        title: "Infrastructure Failure",
        desc: "Your refrigerator and water heater both died in the same week.",
        choices: [
            { label: "Replace both (-$1,800)", action: (p, hp) => { hp(1800); }},
            { label: "Live without (Stressed)", action: (p, hp) => { 
                hp(200); p.isStressed = true; 
            }}
        ]
    }
];

function processLifeEvents(count, forceMedical, player, movePlayer, nextTurn, addButton, handlePayment) {
    const text = document.getElementById('event-text');
    const choices = document.getElementById('choices');
    
    // We can also trigger the "Brutal" events randomly here
    if (Math.random() < 0.3) {
        const ev = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        text.innerHTML = `<strong>${ev.title}</strong><br>${ev.desc}`;
        ev.choices.forEach(c => {
            addButton(c.label, () => { c.action(player, handlePayment); movePlayer(); nextTurn(); });
        });
        return;
    }

    // Normal pool logic...
    let pool = [
        { id: "marriage", title: "Marriage", desc: "Costs $5,000. Shared income boosts salary by $400.", canDecline: true, condition: () => !player.isMarried, onAccept: () => { handlePayment(5000); player.salary += 400; player.isMarried = true; }},
        { id: "medical", title: "Medical Emergency", desc: "Unexpected health bill.", canDecline: false, condition: () => true, onAccept: () => { 
            const cost = 300 * player.injuryMult;
            if(player.hasInsurance) handlePayment(cost); 
            else { player.isInjured = true; player.turnsUntilHealed = 4; handlePayment(cost * 2); }
        }}
    ];

    let available = pool.filter(e => e.condition());
    let chosen = forceMedical ? [pool.find(e => e.id === "medical")] : [available[Math.floor(Math.random() * available.length)]];

    let idx = 0;
    function show() {
        if (idx >= chosen.length) { nextTurn(); return; }
        const e = chosen[idx]; choices.innerHTML = ""; text.innerHTML = `<strong>${e.title}</strong><br>${e.desc}`;
        addButton(`Handle ${e.title}`, () => { e.onAccept(); movePlayer(); idx++; show(); });
        if (e.canDecline) addButton("Decline", () => { idx++; show(); }, "decline-btn");
    }
    show();
}