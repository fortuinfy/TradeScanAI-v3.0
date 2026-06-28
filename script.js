// =========================
// TRADESCAN AI V3
// PHASE 1
// INITIALIZATION
// =========================

let currentMode = "new";

// =========================
// CLOCK
// =========================

function updateDateTime() {

  const now = new Date();

  document.getElementById(
    "dateTime"
  ).innerText =

    now.toLocaleString(
      "en-IN"
    );

}

setInterval(
  updateDateTime,
  1000
);

updateDateTime();

// =========================
// MODE SELECTOR
// =========================

const modeButtons =

  document.querySelectorAll(
    ".mode-btn"
  );

modeButtons.forEach(btn => {

  btn.addEventListener(
    "click",
    () => {

      modeButtons.forEach(b =>
        b.classList.remove(
          "active-mode"
        )
      );

      btn.classList.add(
        "active-mode"
      );

      currentMode =
        btn.dataset.mode;

      updateModeUI();

    }
  );

});

// =========================
// MODE UI
// =========================

function updateModeUI() {

  const title =

    document.getElementById(
      "modeTitle"
    );

  const description =

    document.getElementById(
      "modeDescription"
    );

  const watchlistSection =

    document.getElementById(
      "watchlistSection"
    );

  const activeTradeSection =

    document.getElementById(
      "activeTradeSection"
    );

  watchlistSection.classList.add(
    "hidden"
  );

  activeTradeSection.classList.add(
    "hidden"
  );

  // =====================
  // NEW SCAN
  // =====================

  if (
    currentMode === "new"
  ) {

    title.innerText =
      "New Scan";

    description.innerText =
      "Scan a stock and evaluate whether it deserves watchlist consideration.";

  }

  // =====================
  // WATCHLIST
  // =====================

  if (
    currentMode === "watchlist"
  ) {

    title.innerText =
      "Watchlist Follow-Up";

    description.innerText =
      "Monitor previously shortlisted opportunities.";

    watchlistSection
      .classList
      .remove(
        "hidden"
      );

  }

  // =====================
  // ACTIVE TRADE
  // =====================

  if (
    currentMode === "active"
  ) {

    title.innerText =
      "Active Trade Follow-Up";

    description.innerText =
      "Manage existing open positions.";

    activeTradeSection
      .classList
      .remove(
        "hidden"
      );

  }

}

// =========================
// ADVANCED MOMENTUM
// =========================

const advancedToggle =

  document.getElementById(
    "advancedToggle"
  );

advancedToggle.addEventListener(
  "change",
  () => {

    document
      .getElementById(
        "momentumSection"
      )
      .classList
      .toggle(
        "hidden",
        !advancedToggle.checked
      );

  }
);

// =========================
// CANDLE INPUT BUILDER
// =========================

function buildMomentumInputs() {

  const container =

    document.getElementById(
      "candlesContainer"
    );

  container.innerHTML = "";

  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    container.innerHTML += `

      <div class="card">

        <h4>
          Candle ${i}
        </h4>

        <div class="input-grid">

          <div class="input-group">

            <label>
              Close
            </label>

            <input
              type="number"
              id="close${i}"
              step="0.01">

          </div>

          <div class="input-group">

            <label>
              Nature
            </label>

            <select
              id="nature${i}">

              <option value="Bullish">
                Bullish
              </option>

              <option value="Bearish">
                Bearish
              </option>

            </select>

          </div>

          <div class="input-group">

            <label>
              Volume
            </label>

            <input
              type="text"
              id="volume${i}"
              placeholder="1.5Cr">

          </div>

        </div>

      </div>

    `;

  }

}

buildMomentumInputs();

updateModeUI();
// =========================
// ANALYZE BUTTON
// =========================

document
  .getElementById(
    "analyzeBtn"
  )
  .addEventListener(
    "click",
    analyzeStock
  );

// =========================
// MAIN ANALYSIS
// =========================

function analyzeStock() {

  const stockName =

    document
      .getElementById(
        "stockName"
      )
      .value
      .trim();

  const timeframe =

    document
      .getElementById(
        "timeframe"
      )
      .value;

  const ltp =

    safeNumber(

      document
        .getElementById(
          "ltp"
        )
        .value

    );

  const ema20 =

    safeNumber(

      document
        .getElementById(
          "ema20"
        )
        .value

    );

  const ema50 =

    safeNumber(

      document
        .getElementById(
          "ema50"
        )
        .value

    );

  const rsi =

    safeNumber(

      document
        .getElementById(
          "rsi"
        )
        .value

    );

  const advancedEnabled =

    document
      .getElementById(
        "advancedToggle"
      )
      .checked;

  // =========================
  // BASIC VALIDATION
  // =========================

  const validation =

    validateBasicInputs({

      stockName,

      ltp,

      ema20,

      ema50,

      rsi

    });

  if (

    !validation.valid

  ) {

    alert(
      validation.message
    );

    return;

  }

  // =========================
  // MOMENTUM DATA
  // =========================

  let candles = [];

  if (

    advancedEnabled

  ) {

    candles =
      collectCandles();

    const candleValidation =

      validateCandleInputs(
        candles
      );

    if (

      !candleValidation.valid

    ) {

      alert(
        candleValidation.message
      );

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

  if (

    currentMode === "new"

  ) {

    result =

      analyzeNewScanMode({

        stockName,

        timeframe,

        ltp,
        ema20,
        ema50,
        rsi,

        advancedEnabled,

        candles

      });

  }

  // =====================
  // WATCHLIST
  // =====================

  else if (

    currentMode ===
    "watchlist"

  ) {

    const previousTriggerLow =

      safeNumber(

        document
          .getElementById(
            "previousTriggerLow"
          )
          .value

      );

    const previousTriggerHigh =

      safeNumber(

        document
          .getElementById(
            "previousTriggerHigh"
          )
          .value

      );

    const previousSL =

      safeNumber(

        document
          .getElementById(
            "previousSL"
          )
          .value

      );

    if (

      previousTriggerLow <= 0 ||

      previousTriggerHigh <= 0 ||

      previousSL <= 0

    ) {

      alert(
        "Please enter Watchlist inputs."
      );

      return;

    }

    result =

      analyzeWatchlistMode({

        stockName,

        timeframe,

        ltp,
        ema20,
        ema50,
        rsi,

        previousTriggerLow,
        previousTriggerHigh,
        previousSL,

        advancedEnabled,

        candles

      });

  }

  // =====================
  // ACTIVE TRADE
  // =====================

  else if (

    currentMode ===
    "active"

  ) {

    const executedEntry =

      safeNumber(

        document
          .getElementById(
            "executedEntry"
          )
          .value

      );

    const currentSL =

      safeNumber(

        document
          .getElementById(
            "currentSL"
          )
          .value

      );

    const currentTarget =

      safeNumber(

        document
          .getElementById(
            "currentTarget"
          )
          .value

      );

    const quantity =

      safeNumber(

        document
          .getElementById(
            "quantity"
          )
          .value

      );

    const activeValidation =

      validateActiveTradeInputs({

        executedEntry,

        currentSL,

        currentTarget,

        quantity

      });

    if (

      !activeValidation.valid

    ) {

      alert(
        activeValidation.message
      );

      return;

    }

    result =

      analyzeActiveTrade({

        stockName,

        timeframe,

        ltp,
        ema20,
        ema50,
        rsi,

        executedEntry,

        currentSL,

        currentTarget,

        quantity,

        advancedEnabled,

        candles

      });

  }

  // =========================
  // DISPLAY
  // =========================

  renderResults(
    result
  );

}

// =========================
// COLLECT CANDLES
// =========================

function collectCandles() {

  const candles = [];

  for (

    let i = 1;
    i <= 5;
    i++

  ) {

    candles.push({

      close:

        safeNumber(

          document
            .getElementById(
              `close${i}`
            )
            .value

        ),

      nature:

        document
          .getElementById(
            `nature${i}`
          )
          .value,

      volume:

        document
          .getElementById(
            `volume${i}`
          )
          .value

    });

  }

  return candles;

}
// =========================
// RESULT RENDERER
// =========================

function renderResults(result) {

  const container =

    document.getElementById(
      "resultsContainer"
    );

  container.innerHTML = "";

  // =========================
  // ACTIVE TRADE
  // =========================

  if (

    currentMode === "active"

  ) {

    container.innerHTML = `

      <section class="card">

        <div class="section-header">

          <h2>
            ${result.tradeVerdict}
          </h2>

          <p>
            Active Trade Decision
          </p>

        </div>

        <div class="input-grid">

          <div>

            <strong>
              Priority
            </strong>

            <br>

            ${result.priority}

          </div>

          <div>

            <strong>
              Trade Health
            </strong>

            <br>

            ${result.tradeHealth}

          </div>

          <div>

            <strong>
              P&L %
            </strong>

            <br>

            ${result.pnlPercent.toFixed(2)}%

          </div>

        </div>

      </section>

    `;

    // =====================
    // MOMENTUM
    // =====================

    if (

      result.tradeMomentumScore !==
      undefined

    ) {

      container.innerHTML += `

        <section class="card">

          <div class="section-header">

            <h3>
              Momentum Analysis
            </h3>

          </div>

          <div class="input-grid">

            <div>

              <strong>
                Momentum Score
              </strong>

              <br>

              ${result.tradeMomentumScore}

            </div>

            <div>

              <strong>
                Momentum Health
              </strong>

              <br>

              ${result.momentumHealth}

            </div>

            <div>

              <strong>
                Participation
              </strong>

              <br>

              ${result.participationTrend}

            </div>

          </div>

        </section>

      `;

    }

    // =====================
    // REASONS
    // =====================

    renderReasons(
      result.reasons
    );

    hidePositionSize();

    return;

  }

  // =========================
  // NEW SCAN / WATCHLIST
  // =========================

  container.innerHTML = `

    <section class="card">

      <div class="section-header">

        <h2>
          ${result.verdict}
        </h2>

        <p>
          Final Verdict
        </p>

      </div>

      <div class="input-grid">

        <div>

          <strong>
            Workflow Action
          </strong>

          <br>

          ${result.workflowAction}

        </div>

        <div>

          <strong>
            Confidence
          </strong>

          <br>

          ${result.confidence}%

        </div>

        <div>

          <strong>
            Setup Grade
          </strong>

          <br>

          ${result.setupGrade}

        </div>

      </div>

    </section>

  `;

  // =========================
  // SETUP CARD
  // =========================

  container.innerHTML += `

    <section class="card">

      <div class="section-header">

        <h3>
          Setup Analysis
        </h3>

      </div>

      <div class="input-grid">

        <div>

          <strong>
            Setup
          </strong>

          <br>

          ${result.setup}

        </div>

        <div>

          <strong>
            Setup Score
          </strong>

          <br>

          ${result.setupScore}

        </div>

        <div>

          <strong>
            Risk Level
          </strong>

          <br>

          ${result.riskLevel}

        </div>

      </div>

    </section>

  `;

  // =========================
  // SCORE BREAKDOWN
  // =========================

  if (

    result.cbScore !==
    undefined

  ) {

    container.innerHTML += `

      <section class="card">

        <div class="section-header">

          <h3>
            Setup Scores
          </h3>

        </div>

        <div class="input-grid">

          <div>

            <strong>
              CB
            </strong>

            <br>

            ${result.cbScore}%

          </div>

          <div>

            <strong>
              PC
            </strong>

            <br>

            ${result.pcScore}%

          </div>

        </div>

      </section>

    `;

  }

  // =========================
  // MOMENTUM CARD
  // =========================

  if (

    result.momentumScore !==
      undefined ||

    result.readinessScore !==
      undefined

  ) {

    const score =

      result.momentumScore ??
      result.readinessScore;

    container.innerHTML += `

      <section class="card">

        <div class="section-header">

          <h3>
            Momentum Analysis
          </h3>

        </div>

        <div class="input-grid">

          <div>

            <strong>
              Score
            </strong>

            <br>

            ${score}

          </div>

        </div>

      </section>

    `;

  }

  // =========================
  // TRADE PLAN
  // =========================

  if (

    result.tradePlan

  ) {

    const tp =
      result.tradePlan;

    container.innerHTML += `

      <section class="card">

        <div class="section-header">

          <h3>
            Trade Plan
          </h3>

        </div>

        <div class="input-grid">

          <div>

            <strong>
              Trigger Low
            </strong>

            <br>

            ${tp.triggerLow}

          </div>

          <div>

            <strong>
              Trigger High
            </strong>

            <br>

            ${tp.triggerHigh}

          </div>

          <div>

            <strong>
              Stop Loss
            </strong>

            <br>

            ${tp.stopLoss}

          </div>

          <div>

            <strong>
              Target
            </strong>

            <br>

            ${tp.target}

          </div>

        </div>

      </section>

    `;

  }

  // =========================
  // BADGES
  // =========================

  if (

    result.badges &&
    result.badges.length > 0

  ) {

    container.innerHTML += `

      <section class="card">

        <div class="section-header">

          <h3>
            Badges
          </h3>

        </div>

        <p>

          ${result.badges.join(
            " | "
          )}

        </p>

      </section>

    `;

  }

  // =========================
  // REASONS
  // =========================

  renderReasons(
    result.reasons
  );

  // =========================
  // POSITION SIZE
  // =========================

  handlePositionSizeVisibility(
    result
  );

}

// =========================
// REASONS CARD
// =========================

function renderReasons(reasons) {

  const container =

    document.getElementById(
      "resultsContainer"
    );

  if (

    !reasons ||
    reasons.length === 0

  ) {

    return;

  }

  let html = `

    <section class="card">

      <div class="section-header">

        <h3>
          Analysis Reasons
        </h3>

      </div>

      <ul>

  `;

  reasons.forEach(reason => {

    html += `

      <li>
        ${reason}
      </li>

    `;

  });

  html += `

      </ul>

    </section>

  `;

  container.innerHTML += html;

}
// =========================
// POSITION SIZE VISIBILITY
// =========================

function handlePositionSizeVisibility(
  result
) {

  const card =

    document.getElementById(
      "positionSizeCard"
    );

  let showCard = false;

  // =====================
  // NEW SCAN
  // =====================

  if (

    currentMode === "new"

  ) {

    showCard =

      result.verdict ===
      "BUY";

  }

  // =====================
  // WATCHLIST
  // =====================

  if (

    currentMode ===
    "watchlist"

  ) {

    showCard =

      result.verdict ===
      "READY";

  }

  if (showCard) {

    card.classList.remove(
      "hidden"
    );

  }

  else {

    card.classList.add(
      "hidden"
    );

  }

}

// =========================
// HIDE POSITION SIZE
// =========================

function hidePositionSize() {

  document
    .getElementById(
      "positionSizeCard"
    )
    .classList
    .add(
      "hidden"
    );

}

// =========================
// POSITION SIZE BUTTON
// =========================

document
  .getElementById(
    "calculatePositionBtn"
  )
  .addEventListener(
    "click",
    calculatePosition
  );

function calculatePosition() {

  const capital =

    safeNumber(

      document
        .getElementById(
          "capitalInput"
        )
        .value

    );

  const riskPercent =

    safeNumber(

      document
        .getElementById(
          "riskPercentInput"
        )
        .value

    );

  // =====================
  // GET VALUES
  // =====================

  const triggerHighElement =

    document
      .querySelector(
        "#resultsContainer"
      );

  if (

    !triggerHighElement

  ) {

    return;

  }

  // =====================
  // ATTEMPT TO USE
  // LAST RESULT
  // =====================

  if (

    !window.lastAnalysisResult ||

    !window.lastAnalysisResult
      .tradePlan

  ) {

    alert(
      "Run analysis first."
    );

    return;

  }

  const tradePlan =

    window
      .lastAnalysisResult
      .tradePlan;

  const positionResult =

    calculatePositionSize({

      capital,

      riskPercent,

      entryPrice:
        tradePlan.executionPrice,

      stopLoss:
        tradePlan.stopLoss

    });

  renderPositionResult(
    positionResult
  );

}

// =========================
// POSITION RESULT
// =========================

function renderPositionResult(
  result
) {

  const container =

    document.getElementById(
      "positionResult"
    );

  container.innerHTML = `

    <section class="card">

      <div class="section-header">

        <h3>
          Position Size
        </h3>

      </div>

      <div class="input-grid">

        <div>

          <strong>
            Quantity
          </strong>

          <br>

          ${result.quantity}

        </div>

        <div>

          <strong>
            Risk Amount
          </strong>

          <br>

          ₹${result.riskAmount}

        </div>

        <div>

          <strong>
            Position Value
          </strong>

          <br>

          ₹${result.positionValue}

        </div>

        <div>

          <strong>
            Per Share Risk
          </strong>

          <br>

          ₹${result.perShareRisk}

        </div>

      </div>

    </section>

  `;

}

// =========================
// STORE LAST RESULT
// =========================

const originalRenderResults =

  renderResults;

renderResults = function(result) {

  window.lastAnalysisResult =
    result;

  originalRenderResults(
    result
  );

};

// =========================
// RESET BUTTON
// =========================

document
  .getElementById(
    "resetBtn"
  )
  .addEventListener(
    "click",
    resetApplication
  );

function resetApplication() {

  document
    .querySelectorAll(
      "input"
    )
    .forEach(input => {

      if (

        input.type ===
        "checkbox"

      ) {

        input.checked =
          false;

      }

      else {

        input.value = "";

      }

    });

  document
    .querySelectorAll(
      "select"
    )
    .forEach(select => {

      select.selectedIndex = 0;

    });

  document
    .getElementById(
      "resultsContainer"
    )
    .innerHTML = "";

  document
    .getElementById(
      "positionResult"
    )
    .innerHTML = "";

  hidePositionSize();

  document
    .getElementById(
      "momentumSection"
    )
    .classList
    .add(
      "hidden"
    );

  buildMomentumInputs();

  updateModeUI();

  window.lastAnalysisResult =
    null;

}

// =========================
// INITIALIZE
// =========================

window.lastAnalysisResult =
  null;

updateModeUI();

buildMomentumInputs();
