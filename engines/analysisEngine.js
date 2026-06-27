// =========================
// ANALYSIS ENGINE
// V2 MASTER ROUTER
// =========================

// =========================
// NEW SCAN
// =========================

function analyzeNewScanMode(data) {

  const {

    stockName,

    timeframe,

    ltp,
    ema20,
    ema50,
    rsi,

    advancedEnabled = false,

    candles = []

  } = data;

  // =========================
  // SETUP
  // =========================

  const setupResult =

    calculateSetupScores({

      ltp,
      ema20,
      ema50,
      rsi,
      timeframe

    });

  // =========================
  // MOMENTUM
  // =========================

  let momentumResult = {

    momentumScore: 0,

    momentumTrend:
      "Not Available",

    participationTrend:
      "Not Available",

    relativeVolumeStatus:
      "Not Available",

    weaknessDetected:
      false

  };

  if (

    advancedEnabled &&

    candles.length >= 5

  ) {

    momentumResult =

      calculateNewScanMomentum({

        candles

      });

  }

  // =========================
  // VERDICT
  // =========================

  const verdictResult =

    analyzeNewScan({

      timeframe,

      setup:
        setupResult.setup,

      setupScore:
        setupResult.setupScore,

      momentumScore:
        momentumResult.momentumScore,

      ltp,
      ema20,
      ema50,
      rsi,

      advancedEnabled

    });

  // =========================
  // TRADE PLAN
  // =========================

  const tradePlan =

    generateTradePlan({

      ltp,

      setup:
        setupResult.setup

    });

  // =========================
  // REASONS
  // =========================

  const reasons =

    generateNewScanReasons({

      verdict:
        verdictResult.verdict,

      setup:
        setupResult.setup,

      setupScore:
        setupResult.setupScore,

      momentumScore:
        momentumResult.momentumScore,

      momentumTrend:
        momentumResult.momentumTrend,

      participationTrend:
        momentumResult.participationTrend,

      relativeVolumeStatus:
        momentumResult.relativeVolumeStatus,

      weaknessDetected:
        momentumResult.weaknessDetected,

      ltp,
      ema20,
      ema50,
      rsi,

      advancedEnabled

    });

  return {

    stockName,

    mode: "new",

    timeframe,

    ...verdictResult,

    setup:
      setupResult.setup,

    setupScore:
      setupResult.setupScore,

    cbScore:
      setupResult.cbPercent,

    pcScore:
      setupResult.pcPercent,

    momentumScore:
      momentumResult.momentumScore,

    momentumTrend:
      momentumResult.momentumTrend,

    participationTrend:
      momentumResult.participationTrend,

    relativeVolumeStatus:
      momentumResult.relativeVolumeStatus,

    weaknessDetected:
      momentumResult.weaknessDetected,

    tradePlan,

    reasons

  };

}

// =========================
// WATCHLIST
// =========================

function analyzeWatchlistMode(data) {

  const {

    stockName,

    timeframe,

    ltp,
    ema20,
    ema50,
    rsi,

    previousTriggerLow,
    previousTriggerHigh,
    previousSL,

    advancedEnabled = false,

    candles = []

  } = data;

  const setupResult =

    calculateSetupScores({

      ltp,
      ema20,
      ema50,
      rsi,
      timeframe

    });

  let momentumResult = {

    readinessScore: 0,

    readinessStatus:
      "MONITOR",

    triggerPressure: 0,

    volumeExpansion:
      "Normal",

    weaknessDetected:
      false

  };

  if (

    advancedEnabled &&

    candles.length >= 5

  ) {

    momentumResult =

      calculateWatchlistMomentum({

        candles,

        ltp,

        previousTriggerLow,

        previousTriggerHigh

      });

  }

  const verdictResult =

    analyzeWatchlist({

      timeframe,

      setup:
        setupResult.setup,

      setupScore:
        setupResult.setupScore,

      momentumScore:
        momentumResult.readinessScore,

      ltp,
      ema20,
      ema50,
      rsi,

      previousTriggerLow,
      previousTriggerHigh,
      previousSL,

      advancedEnabled

    });

  const reasons =

    generateWatchlistReasons({

      verdict:
        verdictResult.verdict,

      setup:
        setupResult.setup,

      setupScore:
        setupResult.setupScore,

      readinessScore:
        momentumResult.readinessScore,

      triggerPressure:
        momentumResult.triggerPressure,

      volumeExpansion:
        momentumResult.volumeExpansion,

      weaknessDetected:
        momentumResult.weaknessDetected,

      ltp,
      ema20,
      ema50,
      rsi,

      previousTriggerLow,
      previousTriggerHigh,
      previousSL,

      advancedEnabled

    });

  return {

    stockName,

    mode: "watchlist",

    timeframe,

    ...verdictResult,

    setup:
      setupResult.setup,

    setupScore:
      setupResult.setupScore,

    cbScore:
      setupResult.cbPercent,

    pcScore:
      setupResult.pcPercent,

    readinessScore:
      momentumResult.readinessScore,

    triggerPressure:
      momentumResult.triggerPressure,

    volumeExpansion:
      momentumResult.volumeExpansion,

    reasons

  };

}

// =========================
// ACTIVE TRADE
// =========================

function analyzeActiveTrade(data) {

  let momentumResult = {

    tradeMomentumScore: 0,

    momentumHealth:
      "Not Available",

    participationTrend:
      "Not Available",

    weaknessDetected:
      false,

    exhaustionDetected:
      false

  };

  if (

    data.advancedEnabled &&

    data.candles &&
    data.candles.length >= 5

  ) {

    momentumResult =

      calculateTradeMomentum({

        candles:
          data.candles

      });

  }

  const tradeResult =

    manageActiveTrade({

      ...data,

      momentumScore:
        momentumResult.tradeMomentumScore,

      weaknessDetected:
        momentumResult.weaknessDetected

    });

  const reasons =

    generateTradeReasons({

      tradeVerdict:
        tradeResult.tradeVerdict,

      tradeHealth:
        tradeResult.tradeHealth,

      pnlPercent:
        tradeResult.pnlPercent,

      momentumHealth:
        momentumResult.momentumHealth,

      participationTrend:
        momentumResult.participationTrend,

      weaknessDetected:
        momentumResult.weaknessDetected,

      exhaustionDetected:
        momentumResult.exhaustionDetected,

      ...data

    });

  return {

    ...tradeResult,

    ...momentumResult,

    reasons

  };

}
