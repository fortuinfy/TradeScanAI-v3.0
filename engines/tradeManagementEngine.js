// ========================= 
// ACTIVE TRADE ENGINE 
// ========================= 
function manageActiveTrade(data) { 
    // BUG FIX: Destructured advancedEnabled to prevent false momentum panics
    const { ltp, executedEntry, currentSL, currentTarget, momentumScore = 0, weaknessDetected = false, rsi, ema20, ema50, advancedEnabled = false } = data; 
    
    let tradeVerdict = "CONTINUE HOLDING"; 
    let priority = "LOW"; 
    let suggestedSL = currentSL; 
    let suggestedTarget = currentTarget; 
    let tradeHealth = "Healthy"; 
    const tradeReasons = []; 

    // ========================= 
    // CALCULATIONS
    // ========================= 
    const pnlPercent = ( ( ltp - executedEntry ) / executedEntry ) * 100; 
    const bullishTrend = ltp > ema20 && ema20 > ema50; 
    const distanceToTarget = ( ( currentTarget - ltp ) / ltp ) * 100; 
    
    // Calculate exact percentage distance from the 20 EMA (Negative means below EMA)
    const distanceFromEMA20 = ( ( ltp - ema20 ) / ema20 ) * 100;

    // ========================= 
    // PRIORITY 1: HARD EXITS (STOP LOSS OR TARGET HIT)
    // ========================= 
    if ( ltp <= currentSL ) { 
        tradeVerdict = "FULL EXIT"; 
        priority = "URGENT"; 
        tradeHealth = "Broken (SL Hit)"; 
        tradeReasons.push( "Price has hit or breached the hard Stop Loss." ); 
    } 
    else if ( ltp >= currentTarget ) {
        tradeVerdict = "FULL EXIT"; 
        priority = "HIGH"; 
        tradeHealth = "Target Achieved"; 
        tradeReasons.push( "Price has successfully reached the final target level. Book full profits." ); 
    }
    // ========================= 
    // PRIORITY 2: STRUCTURAL WEAKNESS (DEFENSIVE PARTIAL EXIT)
    // ========================= 
    else {
        // A structural breakdown is only confirmed if price drops MORE than 1.5% below the 20 EMA, OR breaks the 50 EMA entirely.
        const isStructuralBreakdown = distanceFromEMA20 <= -1.5 || ltp < ema50;

        // BUG FIX: momentumScore < 40 is only checked if advancedEnabled is TRUE
        if ( isStructuralBreakdown || rsi < 45 || (advancedEnabled && momentumScore < 40) || (advancedEnabled && weaknessDetected) ) { 
            tradeVerdict = "PARTIAL EXIT"; 
            priority = "HIGH"; 
            tradeHealth = "Weakening"; 
            tradeReasons.push( "Trend structure or momentum is showing significant weakness. Consider reducing risk." ); 
            
            // Suggest tightening the SL to the 50 EMA if it's currently lower to protect against a crash
            if (currentSL < ema50 && ltp > ema50) {
                suggestedSL = parseFloat(ema50.toFixed(2));
                tradeReasons.push( "Suggested tightening Stop Loss to EMA50." );
            }
        } 
        // ========================= 
        // PRIORITY 3: NEAR TARGET / SLOWING MOMENTUM
        // ========================= 
        // BUG FIX: Only penalize for low momentum near target if Advanced Momentum is actually ON
        else if ( distanceToTarget <= 3 && advancedEnabled && momentumScore < 65 ) { 
            tradeVerdict = "PARTIAL EXIT"; 
            priority = "MEDIUM"; 
            tradeHealth = "Extended"; 
            tradeReasons.push( "Price is very near target but momentum is slowing. Secure partial profits." ); 
        } 
        // ========================= 
        // PRIORITY 4: PROFIT PROTECTION (TRAIL STOP LOSS)
        // ========================= 
        else if ( pnlPercent >= 5 && bullishTrend ) { 
            tradeVerdict = "TRAIL STOP LOSS"; 
            priority = "HIGH"; 
            
            // Suggest trailing to EMA20 if it's higher than the current SL
            if (ema20 > currentSL) {
                suggestedSL = parseFloat(ema20.toFixed(2));
            }
            
            tradeHealth = "Profitable"; 
            tradeReasons.push( "Trade is well in profit. Trail stop loss to protect capital." ); 
        } 
        // ========================= 
        // DEFAULT: HOLD / PULLBACK TOLERANCE
        // ========================= 
        else { 
            tradeVerdict = "CONTINUE HOLDING"; 
            priority = "LOW"; 
            
            // Provide psychological feedback if it's in a safe pullback zone
            if (ltp < ema20 && distanceFromEMA20 > -1.5) {
                tradeHealth = "Pullback";
                tradeReasons.push( "Price is experiencing a normal pullback near the 20 EMA. Trend remains structurally intact." );
            } else {
                tradeHealth = "Stable"; 
                tradeReasons.push( "Trade is progressing normally within risk parameters. Hold position." ); 
            }
        } 
    }

    // ========================= 
    // RETURN 
    // ========================= 
    return { tradeVerdict, priority, suggestedSL, suggestedTarget, tradeHealth, tradeReasons, pnlPercent }; 
}
