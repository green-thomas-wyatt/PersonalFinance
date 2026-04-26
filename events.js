export const randomEvents = [
    {
        title: "The Predatory 'Quick Cash' Trap",
        desc: "An unexpected bill arrived. A local lender offers $500 'hassle-free', but the fine print mentions a 400% APR.",
        choices: [
            { label: "Take the $500 (Debt grows faster!)", action: (p) => { 
                p.debt += 500; 
                p.money += 500;
                p.interestRate += 0.05; // Permanently increases your interest difficulty
            }},
            { label: "Default on the bill (-$700 & Credit Hit)", action: (p) => { 
                p.money -= 700; 
                p.creditScore -= 50; 
                alert("Your Credit Score dropped! Future loans will be more expensive.");
            }}
        ]
    },
    {
        title: "Uninsured Medical Emergency",
        desc: "You broke your arm bouldering. If you don't have insurance, this is going to hurt.",
        choices: [
            { label: "Pay full price (-$2,500)", action: (p) => { 
                if(!p.hasInsurance) p.money -= 2500;
                else { p.money -= 500; alert("Insurance covered most of it!"); }
            }},
            { label: "Skip treatment (Penalty every turn)", action: (p) => { 
                p.isInjured = true; // New status effect
                alert("You are now 'Injured'. You will lose $100 every turn in lost productivity.");
            }}
        ]
    },
    {
        // A "Negative ROI" event
        title: "The 'Get Rich Quick' Scam",
        desc: "You invested in a 'guaranteed' startup. It was a total fraud.",
        choices: [
            { label: "Accept the Loss (-$1,500)", action: (p) => { p.money -= 1500; }},
            { label: "Hire a Lawyer to fight (-$500 & 10% chance to win)", action: (p) => {
                p.money -= 500;
                if(Math.random() < 0.1) { p.money += 2000; alert("You won the case!"); }
                else { alert("You lost the case and the lawyer fees."); }
            }}
        ]
    },
    {
        title: "Infrastructure Failure",
        desc: "Your refrigerator and water heater both died in the same week.",
        choices: [
            { label: "Replace both (-$1,800)", action: (p) => { p.money -= 1800; }},
            { label: "Live without (Stress Penalty)", action: (p) => { 
                p.money -= 200; 
                p.isStressed = true; 
                alert("Living without basics makes you 'Stressed'. You roll -1 on every dice roll now.");
            }}
        ]
    }
];