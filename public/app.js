const curriculum = {
    "MATH": {
        "icon": "π",
        "class": "math",
        "papers": {
            "Paper 1 (Pure Math)": ["Algebra & Polynomials", "Trigonometry", "Calculus (Diff & Int)", "Coordinate Geometry"],
            "Paper 2 (Applied Math)": ["Mechanics & Statics", "Probability & Statistics", "Numerical Methods"]
        }
    },
    "PHYSICS": {
        "icon": "Ω",
        "class": "physics",
        "papers": {
            "Paper 1": ["Mechanics & Properties of Matter", "Heat & Thermodynamics", "Modern & Nuclear Physics"],
            "Paper 2": ["Electricity & Electromagnetism", "Atomic & Modern Physics"]
        }
    },
    "LIGHT & OPTICS": {
        "icon": "💡",
        "class": "optics",
        "papers": {
            "Reflection & Refraction": ["Reflection at Plane & Curved Surfaces", "Refraction at Plane Surfaces", "Prisms & Dispersion"],
            "Lenses & Optical Instruments": ["Thin Lenses & Defects", "Microscopes & Telescopes", "The Human Eye"],
            "Wave Optics": ["Interference & Young's Slits", "Diffraction & Gratings", "Polarization of Light"]
        }
    },
    "CHEMISTRY": {
        "icon": "🧪",
        "class": "chemistry",
        "papers": {
            "Paper 1 & 2": ["Physical Chemistry", "Inorganic Chemistry Trends", "Organic Reactions & Mechanisms"]
        }
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

function formatContent(rawText) {
    if (typeof marked !== 'undefined') {
        return marked.parse(rawText);
    }
    return rawText;
}

function renderLaTeX(elementId) {
    if (window.renderMathInElement && document.getElementById(elementId)) {
        renderMathInElement(document.getElementById(elementId), {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true}
            ],
            throwOnError: false
        });
    }
}

function renderMainMenu() {
    history = [];
    backBtn.style.display = "none";
    chatContainer.style.display = "none";
    grid.style.display = "grid";
    breadcrumb.innerText = "Select Subject";
    
    grid.innerHTML = Object.keys(curriculum).map(sub => {
        const item = curriculum[sub];
        return `
            <div class="card ${item.class}" onclick="selectSubject('${sub}')">
                <div class="icon">${item.icon}</div>
                <div class="title">${sub}</div>
            </div>
        `;
    }).join("");
}

function selectSubject(sub) {
    history.push(() => renderMainMenu());
    selectedSubject = sub;
    
    chatContainer.style.display = "none";
    grid.style.display = "grid";
    backBtn.style.display = "block";
    breadcrumb.innerText = `${sub} › Select Paper`;

    const papers = Object.keys(curriculum[sub].papers);
    const itemClass = curriculum[sub].class;

    grid.innerHTML = papers.map(paper => `
        <div class="card ${itemClass}" onclick="selectPaper('${paper}')">
            <div class="title">${paper}</div>
        </div>
    `).join("");
}

function selectPaper(paper) {
    history.push(() => selectSubject(selectedSubject));
    selectedPaper = paper;
    
    chatContainer.style.display = "none";
    grid.style.display = "grid";
    backBtn.style.display = "block";
    breadcrumb.innerText = `${selectedSubject} › ${paper}`;

    const topics = curriculum[selectedSubject].papers[paper];
    const itemClass = curriculum[selectedSubject].class;

    grid.innerHTML = topics.map(topic => `
        <div class="card ${itemClass}" onclick="startChat('${topic}')">
            <div class="title">${topic}</div>
        </div>
    `).join("");
}

function startChat(topic) {
    history.push(() => selectPaper(selectedPaper));
    selectedTopic = topic;
    grid.style.display = "none";
    chatContainer.style.display = "flex";
    breadcrumb.innerText = `${selectedSubject} › ${selectedTopic}`;

    const chatBox = document.getElementById("chat-box");
    const welcomeId = "welcome-msg";
    const welcomeText = `Hello! I am your UACE tutor for **${selectedTopic}**. Ask me any question or past-paper problem.`;

    chatBox.innerHTML = `
        <div class="msg-row bot" id="${welcomeId}">
            <div class="avatar">${curriculum[selectedSubject]?.icon || '🤖'}</div>
            <div class="msg-bubble">${formatContent(welcomeText)}</div>
        </div>
    `;
    renderLaTeX(welcomeId);
}

function goBack() {
    if (history.length > 0) {
        const lastStep = history.pop();
        lastStep();
    }
}

function resetApp() {
    renderMainMenu();
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    const chatBox = document.getElementById("chat-box");
    const userMsgId = "user-" + Date.now();
    
    chatBox.innerHTML += `
        <div class="msg-row user" id="${userMsgId}">
            <div class="avatar">You</div>
            <div class="msg-bubble">${formatContent(text)}</div>
        </div>
    `;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    const typingId = "typing-" + Date.now();
    chatBox.innerHTML += `
        <div class="msg-row bot" id="${typingId}">
            <div class="avatar">${curriculum[selectedSubject]?.icon || '🤖'}</div>
            <div class="msg-bubble typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
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
        
        document.getElementById(typingId)?.remove();
        
        const botMsgId = "bot-" + Date.now();
        chatBox.innerHTML += `
            <div class="msg-row bot" id="${botMsgId}">
                <div class="avatar">${curriculum[selectedSubject]?.icon || '🤖'}</div>
                <div class="msg-bubble">${formatContent(data.reply)}</div>
            </div>
        `;
        
        renderLaTeX(botMsgId);
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        document.getElementById(typingId)?.remove();
        chatBox.innerHTML += `
            <div class="msg-row bot">
                <div class="avatar">!</div>
                <div class="msg-bubble">Error connecting to tutor service.</div>
            </div>
        `;
    }
}

function handleKey(e) {
    if (e.key === "Enter") sendMessage();
}

document.addEventListener("DOMContentLoaded", () => {
    renderMainMenu();
});
                            
