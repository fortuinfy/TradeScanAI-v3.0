// ========================= 
// ANALYSIS ENGINE // V2 MASTER ROUTER 
// ========================= 

// ========================= 
// NEW SCAN 
// ========================= 
function analyzeNewScanMode(data) { 
    const { stockName, timeframe, ltp, ema20, ema50, rsi, advancedEnabled = false, candles = [] } = data; 
    
    // SETUP 
    const setupResult = calculateSetupScores({ ltp, ema20, ema50, rsi, timeframe }); 
    
    // MOMENTUM 
    let momentumResult = { momentumScore: 0, momentumTrend: "Not Available", participationTrend: "Not Available", relativeVolumeStatus: "Not Available", weaknessDetected: false }; 
    if ( advancedEnabled && candles.length >= 5 ) { 
        momentumResult = calculateNewScanMomentum({ candles }); 
    } 
    
    // VERDICT 
    const verdictResult = analyzeNewScan({ timeframe, setup: setupResult.setup, setupScore: setupResult.setupScore, momentumScore: momentumResult.momentumScore, weaknessDetected: momentumResult.weaknessDetected, ltp, ema20, ema50, rsi, advancedEnabled }); 
    
    // TRADE PLAN 
    const tradePlan = generateTradePlan({ ltp, setup: setupResult.setup }); 
    
    // REASONS 
    const reasons = generateNewScanReasons({ verdict: verdictResult.verdict, setup: setupResult.setup, setupScore: setupResult.setupScore, momentumScore: momentumResult.momentumScore, momentumTrend: momentumResult.momentumTrend, participationTrend: momentumResult.participationTrend, relativeVolumeStatus: momentumResult.relativeVolumeStatus, weaknessDetected: momentumResult.weaknessDetected, ltp, ema20, ema50, rsi, advancedEnabled }); 
    
    return { stockName, mode: "new", timeframe, ...verdictResult, setup: setupResult.setup, setupScore: setupResult.setupScore, cbScore: setupResult.cbPercent, pcScore: setupResult.pcPercent, momentumScore: momentumResult.momentumScore, momentumTrend: momentumResult.momentumTrend, participationTrend: momentumResult.participationTrend, tradePlan, reasons }; 
} 

// ========================= 
// WATCHLIST ONLY
// ========================= 
function analyzeWatchlistMode(data) { 
    const { 
        timeframe = "15 Min", 
        previousSetup = "CB", 
        ltp, 
        ema20, 
        ema50, 
        rsi, 
        previousTriggerLow, 
        previousTriggerHigh, 
        previousSL, 
        previousTarget, 
        advancedEnabled = false, 
        candles = [] 
    } = data; 

    // 1. LOCKED SETUP EVALUATION
    const setupResult = analyzeSetup({ 
        ltp, 
        ema20, 
        ema50, 
        rsi, 
        lockedSetup: previousSetup 
    }); 

    // 2. DEFAULT TRADE PLAN (From User Input)
    let lockedTradePlan = { 
        triggerLow: previousTriggerLow, 
        triggerHigh: previousTriggerHigh, 
        stopLoss: previousSL, 
        target: previousTarget 
    }; 

    // 3. MOMENTUM EVALUATION
    let momentumResult = { 
        readinessScore: 0, 
        readinessStatus: "Not Available", 
        triggerPressure: 0, 
        volumeExpansion: "Not Available", 
        weaknessDetected: false 
    }; 
    
    if (advancedEnabled && candles.length >= 5) { 
        momentumResult = calculateWatchlistMomentum({ 
            candles, 
            ltp, 
            previousTriggerLow, 
            previousTriggerHigh 
        }); 
    } 

    // 4. WATCHLIST AUDIT
    const verdictResult = analyzeWatchlist({ 
        timeframe, 
        setup: setupResult.setup, 
        setupScore: setupResult.setupScore, 
        momentumScore: momentumResult.readinessScore, 
        weaknessDetected: momentumResult.weaknessDetected, 
        ltp, 
        ema20, 
        ema50, 
        rsi, 
        previousTriggerLow, 
        previousTriggerHigh, 
        previousSL, 
        previousTarget, 
        advancedEnabled 
    }); 

    // 5. DYNAMIC TRADE PLAN RECALCULATION (LTP ANCHORED)
    // If the price ran past the entry zone/target but formed a valid new base,
    // anchor the new entry zone to wrap the current LTP.
    if (verdictResult.requiresNewPlan) { 
        const newTriggerLow = ltp * 0.997; // Anchor 0.3% below LTP
        const newTriggerHigh = ltp * 1.005; // Anchor 0.5% above LTP
        
        // Ensure SL is mathematically sound (below the caught-up EMA 20)
        const safeSL = ema20 < ltp ? (ema20 * 0.995) : (ltp * 0.98); 
        
        // Project a standard 1:2 Risk/Reward target from the current LTP
        const newRisk = ltp - safeSL;
        const newTarget = ltp + (newRisk * 2);

        lockedTradePlan = { 
            triggerLow: parseFloat(newTriggerLow.toFixed(2)), 
            triggerHigh: parseFloat(newTriggerHigh.toFixed(2)), 
            stopLoss: parseFloat(safeSL.toFixed(2)), 
            target: parseFloat(newTarget.toFixed(2)) 
        }; 
    } 

    // 6. GENERATE REASONS
    const reasons = generateWatchlistReasons({ 
        verdict: verdictResult.verdict, 
        setup: setupResult.setup, 
        setupScore: setupResult.setupScore, 
        readinessScore: momentumResult.readinessScore, 
        triggerPressure: momentumResult.triggerPressure, 
        volumeExpansion: momentumResult.volumeExpansion, 
        weaknessDetected: momentumResult.weaknessDetected, 
        ltp, 
        ema20, 
        ema50, 
        rsi, 
        previousTriggerLow, 
        previousTriggerHigh, 
        previousSL, 
        previousTarget, 
        advancedEnabled 
    }); 

    return { 
        verdict: verdictResult.verdict, 
        confidence: verdictResult.confidence, 
        setupGrade: verdictResult.setupGrade, 
        riskLevel: verdictResult.riskLevel, 
        workflowAction: verdictResult.workflowAction, 
        badges: verdictResult.badges, 
        setup: setupResult.setup, 
        setupScore: setupResult.setupScore, 
        momentum: momentumResult, 
        lockedTradePlan: lockedTradePlan, 
        reasons: reasons 
    }; 
}
    // =========================
    // BUG FIX: DYNAMIC TRADE PLAN OVERRIDE
    // =========================
    // If the setup formed a "New Base" at a higher price, generate and inject a new safe trade plan.
    if (verdictResult.requiresNewPlan) {
        lockedTradePlan = generateTradePlan({ ltp, setup: setupResult.setup });
    }

    // REASONS 
    const reasons = generateWatchlistReasons({ verdict: verdictResult.verdict, setup: setupResult.setup, setupScore: setupResult.setupScore, readinessScore: momentumResult.readinessScore, triggerPressure: momentumResult.triggerPressure, volumeExpansion: momentumResult.volumeExpansion, weaknessDetected: momentumResult.weaknessDetected, ltp, ema20, ema50, rsi, previousTriggerLow, previousTriggerHigh, previousSL, advancedEnabled }); 
    
    return { stockName, mode: "watchlist", timeframe, ...verdictResult, setup: setupResult.setup, setupScore: setupResult.setupScore, cbScore: setupResult.cbPercent, pcScore: setupResult.pcPercent, readinessScore: momentumResult.readinessScore, triggerPressure: momentumResult.triggerPressure, volumeExpansion: momentumResult.volumeExpansion, lockedTradePlan, reasons }; 
} 

// ========================= 
// ACTIVE TRADE 
// ========================= 
function analyzeActiveTrade(data) { 
    // Extract previousSetup for reason generation
    const { previousSetup } = data;

    let momentumResult = { tradeMomentumScore: 0, momentumHealth: "Not Available", participationTrend: "Not Available", weaknessDetected: false, exhaustionDetected: false }; 
    
    if ( data.advancedEnabled && data.candles && data.candles.length >= 5 ) { 
        momentumResult = calculateTradeMomentum({ candles: data.candles }); 
    } 
    
    const tradeResult = manageActiveTrade({ ...data, momentumScore: momentumResult.tradeMomentumScore, weaknessDetected: momentumResult.weaknessDetected }); 
    
    const reasons = generateTradeReasons({ tradeVerdict: tradeResult.tradeVerdict, tradeHealth: tradeResult.tradeHealth, pnlPercent: tradeResult.pnlPercent, momentumHealth: momentumResult.momentumHealth, participationTrend: momentumResult.participationTrend, weaknessDetected: momentumResult.weaknessDetected, exhaustionDetected: momentumResult.exhaustionDetected, setup: previousSetup, ...data }); 
    
    return { ...tradeResult, ...momentumResult, setup: previousSetup, reasons }; 
}
