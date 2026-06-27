// =========================
// SETUP ENGINE
// =========================

function calculateSetupScores(data) {

  const {

    ltp,
    ema20,
    ema50,
    rsi,
    timeframe

  } = data;

  // =========================
  // SCORE VARIABLES
  // =========================

  let cbScore = 0;
  let pcScore = 0;

  // =========================
  // CORE CONDITIONS
  // =========================

  const strongTrend =

    ltp > ema20 &&
    ema20 > ema50;

  const healthyRSI =

    rsi >= 55 &&
    rsi <= 75;

  const strongRSI =

    rsi >= 60 &&
    rsi <= 75;

  // =========================
  // DISTANCE FROM EMA20
  // =========================

  const distanceFromEMA20 =

    ((ltp - ema20) / ema20) * 100;

  // =========================
  // CONTINUATION BREAKOUT
  // =========================

  if (strongTrend)
    cbScore += 35;

  if (strongRSI)
    cbScore += 20;

  if (
    distanceFromEMA20 > 1.5 &&
    distanceFromEMA20 <= 8
  )
    cbScore += 35;

  if (ltp > ema50)
    cbScore += 10;

  // =========================
  // PULLBACK CONTINUATION
  // =========================

  if (strongTrend)
    pcScore += 35;

  if (healthyRSI)
    pcScore += 20;

  if (
    distanceFromEMA20 >= 0 &&
    distanceFromEMA20 <= 1.5
  )
    pcScore += 35;

  if (ltp >= ema20)
    pcScore += 10;

  // =========================
  // OVEREXTENSION PENALTY
  // =========================

  if (distanceFromEMA20 > 8) {

    cbScore -= 20;
    pcScore -= 25;

  }

  // =========================
  // RSI PENALTIES
  // =========================

  if (rsi > 78) {

    cbScore -= 10;
    pcScore -= 10;

  }

  if (rsi < 45) {

    cbScore -= 30;
    pcScore -= 30;

  }

  // =========================
  // CLAMP
  // =========================

  cbScore = Math.max(
    0,
    Math.min(100, cbScore)
  );

  pcScore = Math.max(
    0,
    Math.min(100, pcScore)
  );

  // =========================
  // NORMALIZED %
  // =========================

  const cbPercent = cbScore;
  const pcPercent = pcScore;

  // =========================
  // BEST SETUP
  // =========================

  let setup = "CB";

  if (pcPercent > cbPercent) {

    setup = "PC";

  }

  // =========================
  // FINAL SCORE
  // =========================

  const setupScore = Math.max(

    cbPercent,
    pcPercent

  );

  // =========================
  // RETURN
  // =========================

  return {

    setup,

    setupScore,

    cbScore,
    pcScore,

    cbPercent,
    pcPercent,

    distanceFromEMA20

  };

}
