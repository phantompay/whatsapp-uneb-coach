// UNEB Curriculum Hierarchy
const curriculum = {
    "MATH": {
        "Paper 1 (Pure Math)": ["Algebra & Polynomials", "Trigonometry", "Calculus (Diff & Int)", "Coordinate Geometry"],
        "Paper 2 (Applied Math)": ["Mechanics & Statics", "Probability & Statistics", "Numerical Methods"]
    },
    "PHYSICS": {
        "Paper 1": ["Mechanics & Properties of Matter", "Heat & Thermodynamics", "Modern & Nuclear Physics"],
        "Paper 2": ["Optics & Light", "Waves", "Electricity & Electromagnetism"]
    },
    "CHEMISTRY": {
        "Paper 1 & 2": ["Physical Chemistry", "Inorganic Chemistry Trends", "Organic Reactions & Mechanisms"]
    }
};

let history = [];
let selectedSubject = "";
let selectedPaper = "";
let selectedTopic = "";

const grid = document.getElementById("menu-grid");
const backBtn = document.getElementById("back-btn");
const breadcrumb = document.getElementById("breadcrumb");
const chatContainer = document.getElementById("chat-container");

function renderMainMenu() {
    history = [];
    backBtn.style.display = "none";
    chatContainer.style.display = "none";
    grid.style.display = "grid";
    breadcrumb.innerText = "Select a Subject";
    
    grid.innerHTML = Object.keys(curriculum).map(sub => 
        `<div class="card" onclick="selectSubject('${sub}')">${sub}</div>`
    ).join("");
}

function selectSubject(sub) {
    history.push(() => renderMainMenu());
    selectedSubject = sub;
    backBtn.style.display = "block";
    breadcrumb.innerText = `${sub} › Select Paper`;

    const papers = Object.keys(curriculum[sub]);
    grid.innerHTML = papers.map(paper => 
        `<div class="card" onclick="selectPaper('${paper}')">${paper}</div>`
    ).join("");
}

function selectPaper(paper) {
    history.push(() => selectSubject(selectedSubject));
    selectedPaper = paper;
    breadcrumb.innerText = `${selectedSubject} › ${paper} › Select Topic`;

    const topics = curriculum[selectedSubject][paper];
    grid.innerHTML = topics.map(topic => 
        `<div class="card" onclick="startChat('${topic}')">${topic}</div>`
    ).join("");
}

function startChat(topic) {
    history.push(() => selectPaper(selectedPaper));
    selectedTopic = topic;
    grid.style.display = "none";
    chatContainer.style.display = "flex";
    breadcrumb.innerText = `${selectedSubject} › ${selectedTopic}`;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = `<div class="msg bot">Hello! I am your UACE tutor for <b>${selectedTopic}</b>. Ask me any question or past-paper problem from this topic.</div>`;
}

function goBack() {
    if (history.length > 0) {
        const lastStep = history.pop();
        lastStep();
    }
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="msg user">${text}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subject: selectedSubject,
                topic: selectedTopic,
                message: text
            })
        });
        const data = await res.json();
        chatBox.innerHTML += `<div class="msg bot">${data.reply}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatBox.innerHTML += `<div class="msg bot">Error connecting to tutor service.</div>`;
    }
}

function handleKey(e) {
    if (e.key === "Enter") sendMessage();
}

// Safely initialize the menu after the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
    renderMainMenu();
});
