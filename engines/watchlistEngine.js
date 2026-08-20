// ========================= 
// WATCHLIST ENGINE 
// ========================= 
function analyzeWatchlist(data) { 
    const { 
        timeframe, 
        setup, 
        setupScore, 
        momentumScore = 0, 
        weaknessDetected = false, 
        ltp, 
        ema20, 
        ema50, 
        rsi, 
        previousTriggerLow, 
        previousTriggerHigh, 
        previousSL, 
        previousTarget = 0, 
        advancedEnabled = false 
    } = data; 
    
    // ========================= 
    // CONDITIONS 
    // ========================= 
    const strongTrend = ltp > ema20 && ema20 > ema50; 
    const healthyRSI = rsi >= 55 && rsi <= 75; 
    const insideTriggerZone = ltp >= previousTriggerLow && ltp <= previousTriggerHigh; 
    const aboveTriggerZone = ltp > previousTriggerHigh; 
    const targetExceeded = previousTarget > 0 && ltp >= previousTarget; 
    const belowStopLoss = ltp < previousSL; 
    
    // ========================= 
    // NEW BASE / PRICE EXPANSION VALIDATION (TIMEFRAME AGNOSTIC)
    // ========================= 
    // If price breaches past the old trigger zone/target in a strong trend, force a new plan recalculation
    const requiresNewPlan = (aboveTriggerZone || targetExceeded) && strongTrend;
    const isNewBaseValid = requiresNewPlan && setupScore >= 60;
    
    // ========================= 
    // DEFAULTS 
    // ========================= 
    let verdict = "MONITOR"; 
    let confidence = 65; 
    let setupGrade = "B"; 
    let riskLevel = "MEDIUM"; 
    let workflowAction = "Continue Watchlist"; 
    const badges = []; 
    
    // ========================= 
    // BADGES 
    // ========================= 
    if (strongTrend) { badges.push("Strong Trend"); } 
    if (healthyRSI) { badges.push("Healthy RSI"); } 
    if (insideTriggerZone) { badges.push("Near Trigger Zone"); } 
    if (aboveTriggerZone) { badges.push("Trigger Breakout"); } 
    if (targetExceeded) { badges.push("Target Exceeded"); } 
    if (requiresNewPlan) { badges.push("New Base Formed"); }
    if (advancedEnabled && momentumScore >= 80) { badges.push("Momentum Expansion"); } 
    
    // ========================= 
    // REMOVE (STOP LOSS BREACHED OR STRUCTURAL FAILURE) 
    // ========================= 
    const isDailyBreakdown = timeframe === "Daily" && (ltp < ema20 || ema20 < ema50 || rsi < 45 || (advancedEnabled && weaknessDetected) || (advancedEnabled && momentumScore < 50)); 
    
    if (belowStopLoss || setupScore < 50 || isDailyBreakdown) { 
        verdict = "REMOVE"; 
        confidence = 25; 
        setupGrade = "D"; 
        riskLevel = "HIGH"; 
        workflowAction = "Remove From Watchlist"; 
    } 
    // ========================= 
    // READY (NEW BASE / TARGET EXCEEDED) 
    // ========================= 
    else if (isNewBaseValid && healthyRSI && (!advancedEnabled || (momentumScore >= 60 && !weaknessDetected))) { 
        verdict = "READY"; 
        confidence = setupScore >= 90 ? 90 : 85; 
        setupGrade = setupScore >= 90 ? "A+" : "A"; 
        riskLevel = "LOW"; 
        workflowAction = "New Entry Calculated"; 
    } 
    // ========================= 
    // READY (ORIGINAL ENTRY ZONE) 
    // ========================= 
    else if (insideTriggerZone && strongTrend && setupScore >= 80 && healthyRSI && (!advancedEnabled || (momentumScore >= 60 && !weaknessDetected))) { 
        verdict = "READY"; 
        confidence = setupScore >= 90 ? 90 : 85; 
        setupGrade = setupScore >= 90 ? "A+" : "A"; 
        riskLevel = "LOW"; 
        workflowAction = "Ready For Execution"; 
    } 
    // ========================= 
    // MONITOR 
    // ========================= 
    else { 
        verdict = "MONITOR"; 
        confidence = setupScore >= 70 ? 70 : 60; 
        setupGrade = setupScore >= 70 ? "B" : "C"; 
        riskLevel = "MEDIUM"; 
        workflowAction = "Continue Watchlist"; 
    } 
    
    // ========================= 
    // ADVANCED MOMENTUM BOOST 
    // ========================= 
    if (advancedEnabled && momentumScore >= 80 && verdict === "READY") { 
        confidence = Math.min(95, confidence + 5); 
        badges.push("High Conviction"); 
    } 
    
    return { verdict, confidence, setupGrade, riskLevel, workflowAction, requiresNewPlan, badges }; 
}
