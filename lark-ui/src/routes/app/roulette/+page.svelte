<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { 
        checkAuthStatus, 
        getShopBalance, 
        playBuckshotRoulette, 
        getGameStats,
        type User, 
        type ShopBalance,
        type GameResult,
        type GameStats
    } from "$lib/auth";

    let user: User | null = $state(null);
    let balance: ShopBalance | null = $state(null);
    let stats: GameStats | null = $state(null);
    let loading = $state(true);
    let playing = $state(false);
    let lastResult: GameResult | null = $state(null);
    let error: string | null = $state(null);
    let showResult = $state(false);

    onMount(async () => {
        user = await checkAuthStatus();

        if (!user) {
            goto("/");
            return;
        }

        await refreshData();
        loading = false;
    });

    async function refreshData() {
        const [balanceData, statsData] = await Promise.all([
            getShopBalance(),
            getGameStats()
        ]);
        balance = balanceData;
        stats = statsData;
    }

    async function handlePlay() {
        if (playing || !balance || balance.balance < 0.1) return;
        
        error = null;
        playing = true;
        showResult = false;

        const response = await playBuckshotRoulette();

        if (response.success && response.result) {
            lastResult = response.result;
            showResult = true;
            await refreshData();
        } else {
            error = response.error || "Something went wrong";
        }

        playing = false;
    }

    function closeResult() {
        showResult = false;
        lastResult = null;
    }
</script>

<div class="roulette-page">
    <h1 class="page-title">ROULETTE</h1>
    
    {#if balance}
        <div class="balance-display">
            <span class="balance-label">Your Balance:</span>
            <span class="balance-value">{balance.balance} hours</span>
        </div>
    {/if}

    {#if loading}
        <div class="loading">Loading...</div>
    {:else}
        <div class="game-container">
            <div class="game-info">
                <h2 class="game-title">Buckshot Roulette</h2>
                <p class="game-description">
                    Feeling lucky? Wager <strong>ALL</strong> your unspent hours in a 50/50 gamble.
                </p>
                <div class="rules">
                    <div class="rule">
                        <span class="rule-icon">🎯</span>
                        <span>50/50 odds</span>
                    </div>
                    <div class="rule">
                        <span class="rule-icon">💰</span>
                        <span>Win = 2x your hours</span>
                    </div>
                    <div class="rule">
                        <span class="rule-icon">💀</span>
                        <span>Lose = Lose everything</span>
                    </div>
                </div>
            </div>

            <div class="wager-display">
                <span class="wager-label">You will wager:</span>
                <span class="wager-value">{balance?.balance ?? 0} hours</span>
            </div>

            {#if error}
                <div class="error-message">{error}</div>
            {/if}

            <button 
                class="play-button"
                onclick={handlePlay}
                disabled={playing || !balance || balance.balance < 0.1}
            >
                {#if playing}
                    <span class="spinner"></span>
                    PULLING TRIGGER...
                {:else if !balance || balance.balance < 0.1}
                    NOT ENOUGH HOURS
                {:else}
                    PULL THE TRIGGER
                {/if}
            </button>

            {#if stats && stats.totalGames > 0}
                <div class="stats-container">
                    <h3 class="stats-title">Your Stats</h3>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-value">{stats.totalGames}</span>
                            <span class="stat-label">Games</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value win">{stats.wins}</span>
                            <span class="stat-label">Wins</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value loss">{stats.losses}</span>
                            <span class="stat-label">Losses</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value {stats.netHours >= 0 ? 'win' : 'loss'}">
                                {stats.netHours >= 0 ? '+' : ''}{stats.netHours}
                            </span>
                            <span class="stat-label">Net Hours</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if showResult && lastResult}
    <div class="result-overlay" onclick={closeResult}>
        <div class="result-modal {lastResult.won ? 'win' : 'loss'}">
            <div class="result-icon">
                {#if lastResult.won}
                    🎉
                {:else}
                    💀
                {/if}
            </div>
            <h2 class="result-title">
                {#if lastResult.won}
                    YOU WON!
                {:else}
                    YOU LOST
                {/if}
            </h2>
            <p class="result-message">
                {#if lastResult.won}
                    You doubled your hours! +{lastResult.wager} hours
                {:else}
                    You lost {lastResult.wager} hours
                {/if}
            </p>
            <p class="result-balance">
                New balance: <strong>{lastResult.newBalance} hours</strong>
            </p>
            <button class="close-button" onclick={closeResult}>
                {lastResult.won ? 'COLLECT WINNINGS' : 'ACCEPT FATE'}
            </button>
        </div>
    </div>
{/if}

<style>
    .roulette-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
        padding-top: 4vh;
    }

    .page-title {
        font-family: "Moga", sans-serif;
        font-size: 12vh;
        color: rgb(0, 0, 0);
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 12vh;
        position: relative;
        z-index: 2;
    }

    .page-title::before {
        content: "ROULETTE";
        position: absolute;
        width: 100%;
        color: rgb(255, 255, 255);
        top: -0.75vh;
        left: 0.75vh;
        z-index: 0;
    }

    .balance-display {
        display: flex;
        position: fixed;
        top: 0;
        right: 0;
        align-items: center;
        justify-content: center;
        gap: 1.5vw;
        padding: 2vh 4vw;
        background: #1385F0;
        border-radius: 0px;
        border-bottom-left-radius: 10vh;
        border: 0.35vh solid black;
        border-top: none;
        margin-bottom: 32px;
        width: fit-content;
        z-index: 10;
    }

    .balance-label {
        font-family: "Moga", sans-serif;
        font-size: 5.5vh;
        line-height: 5.5vh;
        color: rgba(255, 255, 255, 0.8);
    }

    .balance-value {
        font-family: "PT Serif", serif;
        font-size: 4vh;
        font-weight: bold;
        color: #fee1c0;
    }

    .loading {
        font-family: "PT Sans", sans-serif;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        padding: 60px 0;
    }

    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4vh;
        margin-top: 6vh;
    }

    .game-info {
        text-align: center;
        max-width: 500px;
    }

    .game-title {
        font-family: "PT Serif", serif;
        font-size: 5vh;
        font-weight: bold;
        color: #fee1c0;
        margin: 0 0 2vh;
    }

    .game-description {
        font-family: "PT Sans", sans-serif;
        font-size: 2.5vh;
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 3vh;
        line-height: 1.5;
    }

    .rules {
        display: flex;
        justify-content: center;
        gap: 3vw;
        flex-wrap: wrap;
    }

    .rule {
        display: flex;
        align-items: center;
        gap: 0.5vw;
        font-family: "PT Sans", sans-serif;
        font-size: 2vh;
        color: rgba(255, 255, 255, 0.7);
    }

    .rule-icon {
        font-size: 2.5vh;
    }

    .wager-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3vh 5vw;
        background: #5E5087;
        border-radius: 2vh;
        border: 0.3vh solid #7a6b9e;
    }

    .wager-label {
        font-family: "PT Sans", sans-serif;
        font-size: 2vh;
        color: rgba(255, 255, 255, 0.6);
    }

    .wager-value {
        font-family: "PT Serif", serif;
        font-size: 5vh;
        font-weight: bold;
        color: #fee1c0;
    }

    .error-message {
        font-family: "PT Sans", sans-serif;
        font-size: 2vh;
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
        padding: 1.5vh 3vw;
        border-radius: 1vh;
        border: 0.2vh solid #ff6b6b;
    }

    .play-button {
        font-family: "Moga", sans-serif;
        font-size: 4vh;
        padding: 2.5vh 6vw;
        border-radius: 2vh;
        border: 0.4vh solid #8B0000;
        background: linear-gradient(180deg, #F24B4B 0%, #B91C1C 100%);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 1vw;
        box-shadow: 0 0.5vh 2vh rgba(0, 0, 0, 0.3);
    }

    .play-button:hover:not(:disabled) {
        transform: translateY(-0.3vh);
        box-shadow: 0 0.8vh 3vh rgba(0, 0, 0, 0.4);
        background: linear-gradient(180deg, #ff5f5f 0%, #c42020 100%);
    }

    .play-button:disabled {
        background: #666;
        border-color: #444;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .spinner {
        width: 3vh;
        height: 3vh;
        border: 0.3vh solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .stats-container {
        margin-top: 4vh;
        padding: 3vh 4vw;
        background: #5E5087;
        border-radius: 2vh;
        border: 0.3vh solid #7a6b9e;
        text-align: center;
    }

    .stats-title {
        font-family: "PT Serif", serif;
        font-size: 3vh;
        font-weight: bold;
        color: white;
        margin: 0 0 2vh;
    }

    .stats-grid {
        display: flex;
        gap: 4vw;
        justify-content: center;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stat-value {
        font-family: "PT Serif", serif;
        font-size: 4vh;
        font-weight: bold;
        color: #fee1c0;
    }

    .stat-value.win {
        color: #4ade80;
    }

    .stat-value.loss {
        color: #ff6b6b;
    }

    .stat-label {
        font-family: "PT Sans", sans-serif;
        font-size: 1.8vh;
        color: rgba(255, 255, 255, 0.6);
    }

    .result-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .result-modal {
        background: #453b61;
        border-radius: 3vh;
        padding: 5vh 6vw;
        text-align: center;
        max-width: 90vw;
        border: 0.4vh solid;
    }

    .result-modal.win {
        border-color: #4ade80;
        box-shadow: 0 0 5vh rgba(74, 222, 128, 0.3);
    }

    .result-modal.loss {
        border-color: #ff6b6b;
        box-shadow: 0 0 5vh rgba(255, 107, 107, 0.3);
    }

    .result-icon {
        font-size: 12vh;
        margin-bottom: 2vh;
    }

    .result-title {
        font-family: "Moga", sans-serif;
        font-size: 8vh;
        margin: 0 0 2vh;
    }

    .result-modal.win .result-title {
        color: #4ade80;
    }

    .result-modal.loss .result-title {
        color: #ff6b6b;
    }

    .result-message {
        font-family: "PT Sans", sans-serif;
        font-size: 3vh;
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 1vh;
    }

    .result-balance {
        font-family: "PT Sans", sans-serif;
        font-size: 2.5vh;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 3vh;
    }

    .close-button {
        font-family: "PT Serif", serif;
        font-size: 2.5vh;
        font-weight: bold;
        padding: 2vh 4vw;
        border-radius: 1.5vh;
        border: none;
        background: #fee1c0;
        color: #453b61;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .close-button:hover {
        background: white;
        transform: translateY(-0.2vh);
    }
</style>
