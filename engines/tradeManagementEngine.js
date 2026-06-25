// =========================
// ACTIVE TRADE ENGINE
// =========================

function manageActiveTrade(data) {

  const {

    ltp,

    executedEntry,
    currentSL,
    currentTarget,

    momentumScore = 0,

    weaknessDetected = false,

    rsi,

    ema20,
    ema50

  } = data;

  let tradeVerdict =
    "CONTINUE HOLDING";

  let priority =
    "MEDIUM";

  let suggestedSL =
    currentSL;

  let suggestedTarget =
    currentTarget;

  let tradeHealth =
    "Healthy";

  const tradeReasons = [];

  // =========================
  // PNL %
  // =========================

  const pnlPercent =

    (

      (

        ltp -

        executedEntry

      ) /

      executedEntry

    ) * 100;

  // =========================
  // TREND
  // =========================

  const bullishTrend =

    ltp > ema20 &&
    ema20 > ema50;

  // =========================
  // DISTANCE TO TARGET
  // =========================

  const distanceToTarget =

    (

      (

        currentTarget -

        ltp

      ) /

      ltp

    ) * 100;

  // =========================
  // PRIORITY 1
  // FULL EXIT
  // =========================

  if (

    ltp < ema20 ||

    rsi < 45 ||

    momentumScore < 40 ||

    weaknessDetected

  ) {

    tradeVerdict =
      "FULL EXIT";

    priority =
      "HIGH";

    tradeHealth =
      "Weak";

    tradeReasons.push(
      "Trend structure and momentum have weakened."
    );

  }

  // =========================
  // PRIORITY 2
  // PARTIAL EXIT
  // =========================

  else if (

    distanceToTarget <= 3 &&

    momentumScore < 65

  ) {

    tradeVerdict =
      "PARTIAL EXIT";

    priority =
      "MEDIUM";

    tradeHealth =
      "Extended";

    tradeReasons.push(
      "Price is near target with slowing momentum."
    );

  }

  // =========================
  // PRIORITY 3
  // TRAIL STOP LOSS
  // =========================

  else if (

    pnlPercent >= 5 &&

    bullishTrend

  ) {

    tradeVerdict =
      "TRAIL STOP LOSS";

    priority =
      "HIGH";

    suggestedSL =
      ema20;

    tradeHealth =
      "Profitable";

    tradeReasons.push(
      "Trade is profitable and stop loss should be trailed."
    );

  }

  // =========================
  // PRIORITY 4
  // HOLD
  // =========================

  else if (

    bullishTrend &&

    momentumScore >= 65 &&

    !weaknessDetected

  ) {

    tradeVerdict =
      "CONTINUE HOLDING";

    priority =
      "HIGH";

    tradeHealth =
      "Strong";

    tradeReasons.push(
      "Trend and momentum remain healthy."
    );

  }

  // =========================
  // DEFAULT HOLD
  // =========================

  else {

    tradeVerdict =
      "CONTINUE HOLDING";

    priority =
      "MEDIUM";

    tradeHealth =
      "Neutral";

    tradeReasons.push(
      "Trade remains valid but requires monitoring."
    );

  }

  // =========================
  // RETURN
  // =========================

  return {

    tradeVerdict,

    priority,

    suggestedSL,

    suggestedTarget,

    tradeHealth,

    tradeReasons,

    pnlPercent

  };

}
