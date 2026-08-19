// ========================= 
// MASTER ANALYSIS ROUTER 
// ========================= 
function analyzeWatchlistMode(data) { 
    const { 
        timeframe = "15 Min", 
        originalSetup = "CB", 
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
        lockedSetup: originalSetup 
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
