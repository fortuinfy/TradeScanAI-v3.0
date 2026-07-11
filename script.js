// ========================= 
// TRADESCAN AI V3 
// PHASE 1 INITIALIZATION 
// ========================= 
let currentMode = "new";

// ========================= 
// CLOCK 
// ========================= 
function updateDateTime() { 
    const now = new Date(); 
    document.getElementById("dateTime").innerText = now.toLocaleString("en-IN");
} 
setInterval(updateDateTime, 1000); 
updateDateTime(); 

// ========================= 
// MODE SELECTOR 
// ========================= 
const modeButtons = document.querySelectorAll(".mode-btn"); 
modeButtons.forEach(btn => { 
    btn.addEventListener("click", () => { 
        modeButtons.forEach(b => b.classList.remove("active-mode"));
        btn.classList.add("active-mode"); 
        currentMode = btn.dataset.mode;
        updateModeUI(); 
    }); 
});

// ========================= 
// MODE UI 
// ========================= 
function updateModeUI() { 
    const title = document.getElementById("modeTitle"); 
    const description = document.getElementById("modeDescription"); 
    const watchlistSection = document.getElementById("watchlistSection"); 
    const activeTradeSection = document.getElementById("activeTradeSection"); 
    
    watchlistSection.classList.add("hidden");
    activeTradeSection.classList.add("hidden");

    // ===================== 
    // NEW SCAN 
    // ===================== 
    if (currentMode === "new") { 
        title.innerText = "New Scan";
        description.innerText = "Scan a stock and evaluate whether it deserves watchlist consideration.";
    } 
    // ===================== 
    // WATCHLIST 
    // ===================== 
    if (currentMode === "watchlist") { 
        title.innerText = "Watchlist Follow-Up";
        description.innerText = "Monitor previously shortlisted opportunities.";
        watchlistSection.classList.remove("hidden");
    } 
    // ===================== 
    // ACTIVE TRADE 
    // ===================== 
    if (currentMode === "active") {
        title.innerText = "Active Trade Follow-Up"; 
        description.innerText = "Manage existing open positions."; 
        activeTradeSection.classList.remove("hidden"); 
    } 
} 

// ========================= 
// ADVANCED MOMENTUM 
// ========================= 
const advancedToggle = document.getElementById("advancedToggle");
advancedToggle.addEventListener("change", () => { 
    document.getElementById("momentumSection").classList.toggle("hidden", !advancedToggle.checked); 
}); 

// =========================
// CANDLE INPUT BUILDER 
// ========================= 
function buildMomentumInputs() { 
    const container = document.getElementById("candlesContainer"); 
    container.innerHTML = "";
    
    for (let i = 1; i <= 5; i++) {
        container.innerHTML += `
        <div class="candle-block">
            <h3>Candle ${i}</h3>
            <div class="input-grid">
                <div class="input-group">
                    <label>Close Price</label>
                    <input type="number" id="close${i}" step="0.01">
                </div>
                <div class="input-group">
                    <label>Nature</label>
                    <select id="nature${i}">
                        <option value="Bullish">Bullish</option>
                        <option value="Bearish">Bearish</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Volume</label>
                    <input type="text" id="volume${i}" placeholder="1.5Cr">
                </div>
            </div>
        </div>`;
    }
}

// ========================= 
// ANALYZE BUTTON EXECUTION 
// ========================= 
document.getElementById("analyzeBtn").addEventListener("click", runAnalysis); 

function runAnalysis() { 
    // ========================= 
    // GATHER CORE INPUTS 
    // ========================= 
    const stockName = document.getElementById("stockName").value.trim(); 
    const timeframe = document.getElementById("timeframe").value; 
    const ltp = safeNumber(document.getElementById("ltp").value);
    const ema20 = safeNumber(document.getElementById("ema20").value); 
    const ema50 = safeNumber(document.getElementById("ema50").value);
    const rsi = safeNumber(document.getElementById("rsi").value); 
    const advancedEnabled = document.getElementById("advancedToggle").checked;
    
    // ========================= 
    // BASIC VALIDATION 
    // ========================= 
    const validation = validateBasicInputs({ stockName, ltp, ema20, ema50, rsi });
    if (!validation.valid) { 
        alert(validation.message); 
        return; 
    } 

    // ========================= 
    // MOMENTUM DATA 
    // =========================
    let candles = []; 
    if (advancedEnabled) { 
        candles = collectCandles(); 
        const candleValidation = validateCandleInputs(candles);
        if (!candleValidation.valid) { 
            alert(candleValidation.message); 
            return; 
        } 
    } 

    // ========================= 
    // ROUTING 
    // ========================= 
    let result = null;

    // ===================== 
    // NEW SCAN 
    // ===================== 
    if (currentMode === "new") { 
        result = analyzeNewScanMode({ stockName, timeframe, ltp, ema20, ema50, rsi, advancedEnabled, candles }); 
    } 
    // ===================== 
    // WATCHLIST 
    // ===================== 
    else if (currentMode === "watchlist") { 
        const previousTriggerLow = safeNumber(document.getElementById("previousTriggerLow").value);
        const previousTriggerHigh = safeNumber(document.getElementById("previousTriggerHigh").value); 
        const previousSL = safeNumber(document.getElementById("previousSL").value);
        
        if (previousTriggerLow <= 0 || previousTriggerHigh <= 0 || previousSL <= 0) { 
            alert("Please enter Watchlist inputs."); 
            return;
        } 
        
        result = analyzeWatchlistMode({ stockName, timeframe, ltp, ema20, ema50, rsi, previousTriggerLow, previousTriggerHigh, previousSL, advancedEnabled, candles }); 
    } 
    // ===================== 
    // ACTIVE TRADE 
    // =====================
    else if (currentMode === "active") { 
        const executedEntry = safeNumber(document.getElementById("executedEntry").value);
        const currentSL = safeNumber(document.getElementById("currentSL").value);
        const currentTarget = safeNumber(document.getElementById("currentTarget").value);
        const quantity = safeNumber(document.getElementById("quantity").value); 
        
        const activeValidation = validateActiveTradeInputs({ executedEntry, currentSL, currentTarget, quantity }); 
        
        if (!activeValidation.valid) { 
            alert(activeValidation.message); 
            return; 
        } 
        
        result = analyzeActiveTrade({ stockName, timeframe, ltp, ema20, ema50, rsi, executedEntry, currentSL, currentTarget, quantity, advancedEnabled, candles });
    } 

    // ========================= 
    // DISPLAY 
    // ========================= 
    if (result) {
        // Inject strictly required Meta Info for the new Timestamp Card
        result.stockName = stockName !== "" ? stockName : "Unknown Asset";
        result.timeframe = timeframe;
        result.timestamp = new Date().toLocaleString("en-IN");
        
        window.lastAnalysisResult = result;
        renderResults(result); 
    }
} 

// ========================= 
// COLLECT CANDLES 
// =========================
function collectCandles() { 
    const candles = []; 
    for (let i = 1; i <= 5; i++) {
        candles.push({ 
            close: safeNumber(document.getElementById(`close${i}`).value), 
            nature: document.getElementById(`nature${i}`).value, 
            volume: document.getElementById(`volume${i}`).value 
        });
    } 
    return candles; 
} 

// =========================
// RESULT RENDERER (MASTER CARDS ARCHITECTURE)
// ========================= 
function renderResults(result) {
    const container = document.getElementById("resultsContainer");
    container.innerHTML = "";

    // ========================= 
    // MASTER 0: ANALYSIS OVERVIEW (TIMESTAMP CARD)
    // ========================= 
    container.innerHTML += `
    <div class="card">
        <div class="card-header"><h3>Analysis Overview</h3></div>
        <div class="sub-card-grid">
            <div class="sub-card">
                <h4>Asset</h4>
                <p>${result.stockName}</p>
            </div>
            <div class="sub-card">
                <h4>Timeframe</h4>
                <p>${result.timeframe}</p>
            </div>
            <div class="sub-card">
                <h4>Time Evaluated</h4>
                <p style="font-size: 15px;">${result.timestamp}</p>
            </div>
        </div>
    </div>`;

    // ========================= 
    // ACTIVE TRADE 
    // ========================= 
    if (currentMode === "active") {
        
        // Master 1: Verdict Card
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Active Trade Verdict</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>Verdict</h4>
                    <p class="${result.tradeVerdict.replace(/\s+/g, '-').toLowerCase()}">${result.tradeVerdict}</p>
                </div>
                <div class="sub-card">
                    <h4>Priority Level</h4>
                    <p>${result.priority}</p>
                </div>
                <div class="sub-card">
                    <h4>Trade Health</h4>
                    <p>${result.tradeHealth}</p>
                </div>
            </div>
        </div>`;

        // Master 2: Trade Metrics Card
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Trade Metrics</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>Current PNL</h4>
                    <p>${result.pnlPercent.toFixed(2)}%</p>
                </div>
                <div class="sub-card">
                    <h4>Suggested SL</h4>
                    <p>₹${result.suggestedSL}</p>
                </div>
                <div class="sub-card">
                    <h4>Target</h4>
                    <p>₹${result.suggestedTarget}</p>
                </div>
            </div>
        </div>`;

        // Master 3: Momentum Card (If Enabled)
        if (result.tradeMomentumScore !== undefined) { 
            container.innerHTML += `
            <div class="card">
                <div class="card-header"><h3>Momentum Analysis</h3></div>
                <div class="sub-card-grid">
                    <div class="sub-card">
                        <h4>Momentum Score</h4>
                        <p>${result.tradeMomentumScore}</p>
                    </div>
                    <div class="sub-card">
                        <h4>Momentum Health</h4>
                        <p>${result.momentumHealth}</p>
                    </div>
                    <div class="sub-card">
                        <h4>Participation</h4>
                        <p>${result.participationTrend}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Master Reasons Card
        renderReasons(result.reasons, result.badges); 
        hidePositionSize(); 
        return; 
    } 

    // ========================= 
    // NEW SCAN / WATCHLIST 
    // ========================= 
    
    // Master 1: Verdict Card
    container.innerHTML += `
    <div class="card">
        <div class="card-header"><h3>Final Verdict</h3></div>
        <div class="sub-card-grid">
            <div class="sub-card">
                <h4>Verdict</h4>
                <p class="${result.verdict.toLowerCase()}">${result.verdict}</p>
                <span class="workflow-badge">${result.workflowAction}</span>
            </div>
            <div class="sub-card">
                <h4>Confidence</h4>
                <p>${result.confidence}%</p>
            </div>
            <div class="sub-card">
                <h4>Setup Grade</h4>
                <p>${result.setupGrade}</p>
            </div>
        </div>
    </div>`;

    // Master 2: Setup Analysis Card
    container.innerHTML += `
    <div class="card">
        <div class="card-header"><h3>Setup Analysis</h3></div>
        <div class="sub-card-grid">
            <div class="sub-card">
                <h4>Setup</h4>
                <p>${result.setup}</p>
            </div>
            <div class="sub-card">
                <h4>Setup Score</h4>
                <p>${result.setupScore}</p>
            </div>
            <div class="sub-card">
                <h4>Risk Level</h4>
                <p>${result.riskLevel}</p>
            </div>
        </div>
    </div>`;

    // Master 3: Setup Scores Card
    if (result.cbScore !== undefined) { 
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Setup Scores</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>CB Score</h4>
                    <p>${result.cbScore}%</p>
                </div>
                <div class="sub-card">
                    <h4>PC Score</h4>
                    <p>${result.pcScore}%</p>
                </div>
                <div class="sub-card">
                    <h4>Dominant Setup</h4>
                    <p>${result.setup}</p>
                </div>
            </div>
        </div>`;
    }

    // Master 4: Momentum Analysis Card
    if (currentMode === "new" && result.momentumScore !== undefined) {
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Momentum Analysis</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>Momentum Score</h4>
                    <p>${result.momentumScore}</p>
                </div>
                <div class="sub-card">
                    <h4>Trend Direction</h4>
                    <p>${result.momentumTrend || "N/A"}</p>
                </div>
                <div class="sub-card">
                    <h4>Participation</h4>
                    <p>${result.participationTrend || "N/A"}</p>
                </div>
            </div>
        </div>`;
    } else if (currentMode === "watchlist" && result.readinessScore !== undefined) {
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Execution Readiness</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>Readiness Score</h4>
                    <p>${result.readinessScore}</p>
                </div>
                <div class="sub-card">
                    <h4>Trigger Pressure</h4>
                    <p>${result.triggerPressure}</p>
                </div>
                <div class="sub-card">
                    <h4>Volume Expansion</h4>
                    <p>${result.volumeExpansion}</p>
                </div>
            </div>
        </div>`;
    }

    // Master 5: Trade Plan Card
    const tp = result.tradePlan;
    if (tp) {
        container.innerHTML += `
        <div class="card">
            <div class="card-header"><h3>Trade Plan</h3></div>
            <div class="sub-card-grid">
                <div class="sub-card">
                    <h4>Entry Zone</h4>
                    <p>${tp.triggerLow} - ${tp.triggerHigh}</p>
                </div>
                <div class="sub-card">
                    <h4>Stop Loss</h4>
                    <p>${tp.stopLoss}</p>
                </div>
                <div class="sub-card">
                    <h4>Target</h4>
                    <p>${tp.target}</p>
                </div>
            </div>
        </div>`;
    }

    // Master 6: Analysis Reasons Card
    renderReasons(result.reasons, result.badges); 

    // Master 7: Position Size Calculator Handler
    handlePositionSizeVisibility(result);
} 

// ========================= 
// REASONS CARD 
// ========================= 
function renderReasons(reasons, badges) { 
    const container = document.getElementById("resultsContainer");
    if (!reasons || reasons.length === 0) { 
        return; 
    } 
    
    let html = `
    <div class="card reason-box">
        <div class="card-header"><h3>Analysis Reasons</h3></div>
    `;
    
    if (badges && badges.length > 0) {
        html += `<div class="badge-container">`;
        badges.forEach(badge => {
            html += `<span class="badge badge-blue">${badge}</span>`;
        });
        html += `</div>`;
    }

    html += `<ul>`;
    reasons.forEach(reason => { 
        html += `<li>${reason}</li>`; 
    }); 
    html += `</ul></div>`;
    
    container.innerHTML += html;
} 

// ========================= 
// POSITION SIZE VISIBILITY 
// =========================
function handlePositionSizeVisibility(result) { 
    const card = document.getElementById("positionSizeCard");
    let showCard = false;
    
    if (currentMode === "new") { 
        showCard = result.verdict === "BUY"; 
    } 
    if (currentMode === "watchlist") { 
        showCard = result.verdict === "READY";
    } 
    
    if (showCard) { 
        card.classList.remove("hidden");
    } else { 
        card.classList.add("hidden");
    } 
} 

// ========================= 
// HIDE POSITION SIZE 
// ========================= 
function hidePositionSize() { 
    document.getElementById("positionSizeCard").classList.add("hidden"); 
} 

// ========================= 
// POSITION SIZE BUTTON 
// ========================= 
document.getElementById("calculatePositionBtn").addEventListener("click", calculatePosition);

function calculatePosition() { 
    const capital = safeNumber(document.getElementById("capitalInput").value); 
    const riskPercent = safeNumber(document.getElementById("riskPercentInput").value); 
    
    const triggerHighElement = document.querySelector("#resultsContainer"); 
    if (!triggerHighElement) { 
        return;
    } 
    
    if (!window.lastAnalysisResult || !window.lastAnalysisResult.tradePlan) { 
        alert("Run analysis first.");
        return; 
    } 
    
    const tradePlan = window.lastAnalysisResult.tradePlan; 
    
    const positionResult = calculatePositionSize({ 
        capital, 
        riskPercent, 
        entryPrice: tradePlan.executionPrice, 
        stopLoss: tradePlan.stopLoss 
    }); 
    
    renderPositionResult(positionResult);
} 

// ========================= 
// POSITION RESULT RENDERER
// ========================= 
function renderPositionResult(result) { 
    const container = document.getElementById("positionResult"); 
    container.innerHTML = `
    <div class="sub-card-grid" style="margin-top: 24px;">
        <div class="sub-card">
            <h4>Suggested Quantity</h4>
            <p>${result.quantity}</p>
        </div>
        <div class="sub-card">
            <h4>Total Risk</h4>
            <p>₹${result.riskAmount}</p>
        </div>
        <div class="sub-card">
            <h4>Position Value</h4>
            <p>₹${result.positionValue}</p>
        </div>
    </div>
    `;
} 

// ========================= 
// APP RESET 
// =========================
document.getElementById("resetBtn").addEventListener("click", resetApplication); 

function resetApplication() { 
    document.querySelectorAll("input").forEach(input => { 
        if (input.type === "checkbox") { 
            input.checked = false; 
        } else { 
            input.value = ""; 
        } 
    });
    
    document.querySelectorAll("select").forEach(select => { 
        select.selectedIndex = 0; 
    }); 
    
    document.getElementById("resultsContainer").innerHTML = ""; 
    document.getElementById("positionResult").innerHTML = ""; 
    hidePositionSize(); 
    
    document.getElementById("momentumSection").classList.add("hidden");
    buildMomentumInputs(); 
    updateModeUI(); 
    window.lastAnalysisResult = null;
} 

// ========================= 
// INITIALIZE 
// =========================
window.lastAnalysisResult = null; 
updateModeUI(); 
buildMomentumInputs();
