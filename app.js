// app.js - CoffeeHolics ($BEANS) Dashboard & Staking dApp structure

// ===================== BASIC HELPERS ===================== //

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.classList.remove("skeleton");
}

function shortAddress(addr, length = 4) {
  if (!addr || addr.length < 10) return addr || "";
  return addr.slice(0, 2 + length) + "..." + addr.slice(-length);
}

function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return "--";
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatTokenAmount(num, symbol = "BEANS", decimals = 2) {
  return `${formatNumber(num, decimals)} ${symbol}`;
}

function formatCurrency(num, currency = "USD", decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return "--";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// Very simple time-ago formatter for demo
function timeAgo(date) {
  if (!date) return "";
  const now = new Date();
  const diff = Math.max(0, now - date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ===================== DUMMY DATA (PLACEHOLDERS) ===================== //
// TODO: Replace with real RPC / API calls to Ladychain

const DummyApi = {
  async fetchDashboardStats() {
    await new Promise((res) => setTimeout(res, 600));

    return {
      totalSupply: 100_000_000,
      circulatingSupply: 92_500_000,
      totalBurned: 7_500_000,
      totalReflections: 1_250_000,
      holderCount: 1_842,
      txCount: 25_137,
      marketCapUsd: 1_250_000,
      tokenPriceUsd: 0.0135,
      volume24hUsd: 32_000,
      burned24h: 42_000,
      reflections24h: 18_500
    };
  },

  async fetchLatestTransactions(limit = 10) {
    await new Promise((res) => setTimeout(res, 400));

    const now = new Date();
    return Array.from({ length: limit }).map((_, i) => ({
      hash: "0x" + Math.random().toString(16).slice(2).padEnd(10, "0"),
      from: "0xCoffeeFrom" + (1000 + i),
      to: "0xCoffeeTo" + (2000 + i),
      amount: 1000 + i * 10,
      timestamp: new Date(now - i * 600_000) // every 10 min
    }));
  },

  async fetchStakingData() {
    await new Promise((res) => setTimeout(res, 400));

    return {
      wallet: {
        address: null,
        balance: 15_000
      },
      overview: {
        totalStaked: 8_000,
        totalPendingRewards: 420
      },
      pools: {
        flexible: {
          apr: 12,
          tvl: 50_000,
          userStaked: 2_500,
          userRewards: 100,
          minStake: 100,
          hasPenalty: false,
          lockDurationDays: 0
        },
        "30days": {
          apr: 24,
          tvl: 25_000,
          userStaked: 3_000,
          userRewards: 150,
          minStake: 250,
          hasPenalty: true,
          lockDurationDays: 30
        },
        "90days": {
          apr: 48,
          tvl: 15_000,
          userStaked: 2_500,
          userRewards: 170,
          minStake: 500,
          hasPenalty: true,
          lockDurationDays: 90
        }
      }
    };
  },

  async fetchTopHolders(limit = 5) {
    await new Promise((res) => setTimeout(res, 300));

    const totalSupply = 100_000_000;
    const base = [
      { address: "0xCafeWhale111111111111111111", balance: 12_000_000 },
      { address: "0xLatteHolder22222222222222", balance: 8_500_000 },
      { address: "0xEspresso3333333333333333", balance: 5_250_000 },
      { address: "0xBeans444444444444444444", balance: 3_100_000 },
      { address: "0xCup55555555555555555555", balance: 2_250_000 }
    ];

    return base.slice(0, limit).map((h) => ({
      ...h,
      share: (h.balance / totalSupply) * 100
    }));
  }
};

// ===================== STATE ===================== //

const AppState = {
  walletAddress: null,
  stakingData: null,
  dashboardStats: null,
  latestTx: [],
  topHolders: [],
  loading: false
};

// ===================== LOADING OVERLAY ===================== //

function showLoading(message = "Brewing fresh on-chain data...") {
  const overlay = $("#loading-overlay");
  if (!overlay) return;

  const msgEl = $("#loading-message");
  if (msgEl) msgEl.textContent = message;

  AppState.loading = true;
  overlay.classList.add("visible");
}

function hideLoading() {
  const overlay = $("#loading-overlay");
  if (!overlay) return;
  AppState.loading = false;
  overlay.classList.remove("visible");
}

// ===================== TOASTS ===================== //

function showToast(message, type = "success", timeout = 3000) {
  const container = $("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const p = document.createElement("p");
  p.className = "toast-message";
  p.textContent = message;
  toast.appendChild(p);

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, timeout);
}

// ===================== VISUAL EFFECTS (BEAN + SPARKLE) ===================== //

function spawnBeanDrop(cardElement) {
  if (!cardElement) return;
  const bean = document.createElement("div");
  bean.className = "bean-drop";
  cardElement.appendChild(bean);

  bean.addEventListener("animationend", () => {
    bean.remove();
  });
}

function spawnSparkle(cardElement) {
  if (!cardElement) return;
  const spark = document.createElement("div");
  spark.className = "sparkle-burst";
  cardElement.appendChild(spark);

  spark.addEventListener("animationend", () => {
    spark.remove();
  });
}

// ===================== RENDER FUNCTIONS ===================== //

function renderCurrentYear() {
  setText("current-year", new Date().getFullYear());
}

function renderDashboard(stats) {
  if (!stats) return;
  setText("total-supply", formatNumber(stats.totalSupply));
  setText("circulating-supply", formatNumber(stats.circulatingSupply));
  setText("total-burned", formatNumber(stats.totalBurned));
  setText("total-reflections", formatNumber(stats.totalReflections));
  setText("wallet-count", formatNumber(stats.holderCount));
  setText("tx-count", formatNumber(stats.txCount));
  setText("market-cap", formatCurrency(stats.marketCapUsd));
  setText("token-price", `$${formatNumber(stats.tokenPriceUsd, 4)}`);

  // extra metrics
  setText("vol-24h", `${formatCurrency(stats.volume24hUsd)} / 24h`);
  setText("burn-24h", formatTokenAmount(stats.burned24h, "BEANS"));
  setText("refl-24h", formatTokenAmount(stats.reflections24h, "BEANS"));
}

function renderLatestTransactions(txs) {
  const tbody = $("#latest-tx-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!txs || txs.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No recent transactions found.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  txs.forEach((tx) => {
    const tr = document.createElement("tr");

    const hashTd = document.createElement("td");
    hashTd.className = "hash-cell";
    hashTd.textContent = shortAddress(tx.hash, 4);
    tr.appendChild(hashTd);

    const fromTd = document.createElement("td");
    fromTd.textContent = shortAddress(tx.from);
    tr.appendChild(fromTd);

    const toTd = document.createElement("td");
    toTd.textContent = shortAddress(tx.to);
    tr.appendChild(toTd);

    const amountTd = document.createElement("td");
    amountTd.textContent = formatTokenAmount(tx.amount, "BEANS");
    tr.appendChild(amountTd);

    const timeTd = document.createElement("td");
    timeTd.textContent = timeAgo(tx.timestamp);
    tr.appendChild(timeTd);

    tbody.appendChild(tr);
  });
}

function renderTopHolders(holders) {
  const tbody = $("#holders-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!holders || holders.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No holder data available.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  holders.forEach((h, idx) => {
    const tr = document.createElement("tr");

    const rankTd = document.createElement("td");
    rankTd.textContent = idx + 1;
    tr.appendChild(rankTd);

    const addrTd = document.createElement("td");
    addrTd.textContent = shortAddress(h.address, 4);
    tr.appendChild(addrTd);

    const balTd = document.createElement("td");
    balTd.textContent = formatTokenAmount(h.balance, "BEANS");
    tr.appendChild(balTd);

    const shareTd = document.createElement("td");
    shareTd.textContent = `${formatNumber(h.share, 2)}%`;
    tr.appendChild(shareTd);

    tbody.appendChild(tr);
  });
}

function renderStakingOverview(data) {
  if (!data) return;

  const walletLabel = data.wallet.address
    ? shortAddress(data.wallet.address)
    : "Not connected";

  setText("connected-wallet", walletLabel);
  setText("wallet-balance", formatTokenAmount(data.wallet.balance, "BEANS"));
  setText("total-staked", formatTokenAmount(data.overview.totalStaked, "BEANS"));
  setText(
    "total-pending-rewards",
    formatTokenAmount(data.overview.totalPendingRewards, "BEANS")
  );
}

function renderStakingPools(data) {
  if (!data || !data.pools) return;

  const flex = data.pools.flexible;
  if (flex) {
    setText("pool-flexible-apr", `${flex.apr}%`);
    setText("pool-flexible-tvl", formatTokenAmount(flex.tvl, "BEANS"));
    setText("pool-flexible-staked", formatTokenAmount(flex.userStaked, "BEANS"));
    setText("pool-flexible-rewards", formatTokenAmount(flex.userRewards, "BEANS"));
  }

  const p30 = data.pools["30days"];
  if (p30) {
    setText("pool-30-apr", `${p30.apr}%`);
    setText("pool-30-tvl", formatTokenAmount(p30.tvl, "BEANS"));
    setText("pool-30-staked", formatTokenAmount(p30.userStaked, "BEANS"));
    setText("pool-30-rewards", formatTokenAmount(p30.userRewards, "BEANS"));
  }

  const p90 = data.pools["90days"];
  if (p90) {
    setText("pool-90-apr", `${p90.apr}%`);
    setText("pool-90-tvl", formatTokenAmount(p90.tvl, "BEANS"));
    setText("pool-90-staked", formatTokenAmount(p90.userStaked, "BEANS"));
    setText("pool-90-rewards", formatTokenAmount(p90.userRewards, "BEANS"));
  }
}

// ===================== EARNINGS SIMULATOR ===================== //

function getPoolApr(poolId) {
  if (AppState.stakingData && AppState.stakingData.pools) {
    const pool = AppState.stakingData.pools[poolId];
    if (pool && typeof pool.apr === "number") {
      return pool.apr;
    }
  }

  const fallback = {
    flexible: 12,
    "30days": 24,
    "90days": 48
  };
  return fallback[poolId] ?? 0;
}

function simulateEarnings(amount, days, apr) {
  const principal = Number(amount);
  const d = Number(days);
  const a = Number(apr);

  if (isNaN(principal) || principal <= 0 || isNaN(d) || d <= 0 || isNaN(a) || a <= 0) {
    return {
      rewards: 0,
      total: 0,
      dailyYield: 0
    };
  }

  // Simple APR formula: rewards = principal * (apr% / 100) * (days / 365)
  const rewards = principal * (a / 100) * (d / 365);
  const total = principal + rewards;
  const dailyYield = rewards / d;

  return {
    rewards,
    total,
    dailyYield
  };
}

function initEarningsSimulator() {
  const amountInput = document.getElementById("sim-amount");
  const daysInput = document.getElementById("sim-days");
  const poolSelect = document.getElementById("sim-pool");
  const calcBtn = document.getElementById("sim-calc-btn");

  if (!amountInput || !daysInput || !poolSelect || !calcBtn) return;

  const update = () => {
    const amount = parseFloat(amountInput.value);
    const days = parseInt(daysInput.value, 10);
    const poolId = poolSelect.value;

    const apr = getPoolApr(poolId);
    const { rewards, total, dailyYield } = simulateEarnings(amount, days, apr);

    setText("sim-apr", `${formatNumber(apr, 2)}%`);

    if (!amount || !days || amount <= 0 || days <= 0) {
      setText("sim-rewards", "-- $BEANS");
      setText("sim-total", "-- $BEANS");
      setText("sim-daily-yield", "-- $BEANS / day");
      return;
    }

    setText("sim-rewards", formatTokenAmount(rewards, "BEANS", 4));
    setText("sim-total", formatTokenAmount(total, "BEANS", 4));
    setText(
      "sim-daily-yield",
      `${formatTokenAmount(dailyYield, "BEANS", 4)} / day`
    );
  };

  calcBtn.addEventListener("click", (e) => {
    e.preventDefault();
    update();
  });

  amountInput.addEventListener("input", update);
  daysInput.addEventListener("input", update);
  poolSelect.addEventListener("change", update);
}

// ===================== WALLET CONNECT (SKELETON) ===================== //

async function connectWallet() {
  // TODO: replace with real EVM provider logic for Ladychain
  const fakeAddress = "0xCoffeeHolics1234567890beef";
  AppState.walletAddress = fakeAddress;

  if (!AppState.stakingData) {
    AppState.stakingData = await DummyApi.fetchStakingData();
  }

  AppState.stakingData.wallet.address = fakeAddress;

  renderStakingOverview(AppState.stakingData);
  renderStakingPools(AppState.stakingData);

  console.log("Wallet connected:", fakeAddress);
  showToast("Demo: Wallet connected as " + shortAddress(fakeAddress), "success");
}

function initWalletButton() {
  const btn = $("#connect-wallet-btn");
  const stakingBtn = document.querySelector(".staking-connect-btn");

  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      connectWallet();
    });
  }

  if (stakingBtn) {
    stakingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      connectWallet();
    });
  }
}

// ===================== STAKING ACTION HANDLERS (SKELETON) ===================== //

function initStakingButtons() {
  const poolCards = $all(".pool-card");

  poolCards.forEach((card) => {
    const poolId = card.getAttribute("data-pool-id");
    const input = card.querySelector("input[type='number']");
    const [stakeBtn, unstakeBtn, claimBtn] = card.querySelectorAll(
      ".pool-buttons .btn"
    );

    if (stakeBtn) {
      stakeBtn.addEventListener("click", () => {
        const amount = Number(input?.value || 0);
        console.log(`Stake clicked | pool=${poolId} | amount=${amount}`);
        showToast(`Demo: Stake ${amount || 0} BEANS in pool ${poolId}`, "success");
        spawnBeanDrop(card); // vallende boon bij stake
        // TODO: call staking contract method here
      });
    }

    if (unstakeBtn) {
      unstakeBtn.addEventListener("click", () => {
        console.log(`Unstake clicked | pool=${poolId}`);
        showToast(`Demo: Unstake from pool ${poolId}`, "success");
        // optioneel: spawnBeanDrop(card);
        // TODO: call unstake method here
      });
    }

    if (claimBtn) {
      claimBtn.addEventListener("click", () => {
        console.log(`Claim rewards clicked | pool=${poolId}`);
        showToast(`Demo: Claim rewards from pool ${poolId}`, "success");
        spawnBeanDrop(card);
        spawnSparkle(card);
        // TODO: call claim rewards method here
      });
    }
  });
}

// ===================== NAV TOGGLE ===================== //

function initNavToggle() {
  const toggle = $("#nav-toggle");
  const nav = $("#main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    nav.classList.toggle("open");
  });

  $all("#main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.classList.remove("active");
      }
    });
  });
}

// ===================== INIT / MAIN ===================== //

async function loadInitialData() {
  try {
    showLoading("Brewing fresh $BEANS data...");

    const stats = await DummyApi.fetchDashboardStats();
    AppState.dashboardStats = stats;
    renderDashboard(stats);

    const [txs, stakingData, holders] = await Promise.all([
      DummyApi.fetchLatestTransactions(10),
      DummyApi.fetchStakingData(),
      DummyApi.fetchTopHolders(5)
    ]);

    AppState.latestTx = txs;
    renderLatestTransactions(txs);

    AppState.stakingData = stakingData;
    renderStakingOverview(stakingData);
    renderStakingPools(stakingData);

    AppState.topHolders = holders;
    renderTopHolders(holders);
  } catch (err) {
    console.error("Error loading initial data:", err);
    showToast("Error loading data (demo). Check console for details.", "error");
  } finally {
    hideLoading();
  }
}

function initApp() {
  renderCurrentYear();
  initNavToggle();
  initWalletButton();
  initStakingButtons();
  initEarningsSimulator();
  loadInitialData();
}

document.addEventListener("DOMContentLoaded", initApp);
