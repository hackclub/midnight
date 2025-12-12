<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, getShopItems, getShopBalance, getShopTransactions, type User, type ShopItem, type ShopBalance, type ShopTransaction } from "$lib/auth";
    import ShopCard from "./ShopCard.svelte";

    let user: User | null = $state<User | null>(null);
    let items: ShopItem[] = $state([]);
    let balance: ShopBalance | null = $state(null);
    let transactions: ShopTransaction[] = $state([]);
    let loading = $state(true);
    let activeTab = $state<'shop' | 'orders'>('shop');

    onMount(async () => {
        user = await checkAuthStatus();

        if (!user) {
            goto("/");
            return;
        }

        const [itemsData, balanceData, transactionsData] = await Promise.all([
            getShopItems(),
            getShopBalance(),
            getShopTransactions()
        ]);
        
        items = itemsData;
        balance = balanceData;
        transactions = transactionsData;
        loading = false;
    });

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<div class="shop-page">
    <h1 class="page-title">SHOP</h1>
    
    <div class="tabs">
        <button 
            class="tab {activeTab === 'shop' ? 'active' : ''}"
            onclick={() => activeTab = 'shop'}
        >
            Browse Items
        </button>
        <button 
            class="tab {activeTab === 'orders' ? 'active' : ''}"
            onclick={() => activeTab = 'orders'}
        >
            My Orders {transactions.length > 0 ? `(${transactions.length})` : ''}
        </button>
    </div>
    
    {#if balance}
        <div class="balance-display">
            <span class="balance-label">Your Balance:</span>
            <span class="balance-value">{balance.balance} hours</span>
        </div>
    {/if}

    {#if loading}
        <div class="loading">Loading...</div>
    {:else if activeTab === 'shop'}
        <h2 class="page-subtitle">Click on a shop item to view it.</h2>
        
        {#if items.length === 0}
            <div class="empty">No items available in the shop yet.</div>
        {:else}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full px-[3vw] gap-x-[3vw] gap-y-[6.5vh] pb-[10vh] text-[#fee1c0]">
                {#each items as item}
                    <ShopCard 
                        itemId={item.itemId} 
                        name={item.name} 
                        img={item.imageUrl || ''} 
                        requiredHours={item.cost} 
                        desc={item.description || ''} 
                        isActive={item.isActive}
                        variants={item.variants || []}
                    />
                {/each}
            </div>
        {/if}
    {:else}
        <h2 class="page-subtitle">Your purchase history</h2>
        
        {#if transactions.length === 0}
            <div class="empty-orders">
                <p class="empty-text">You haven't made any purchases yet.</p>
                <button class="browse-button" onclick={() => activeTab = 'shop'}>
                    Browse the Shop
                </button>
            </div>
        {:else}
            <div class="orders-list">
                {#each transactions as transaction (transaction.transactionId)}
                    <div class="order-card">
                        <div class="order-image">
                            {#if transaction.item.imageUrl}
                                <img src={transaction.item.imageUrl} alt={transaction.item.name} />
                            {:else}
                                <div class="order-placeholder">🛍️</div>
                            {/if}
                        </div>
                        <div class="order-details">
                            <h3 class="order-name">
                                {transaction.item.name}
                                {#if transaction.variant}
                                    <span class="order-variant">({transaction.variant.name})</span>
                                {/if}
                            </h3>
                            <p class="order-description">{transaction.itemDescription}</p>
                            <p class="order-date">{formatDate(transaction.createdAt)}</p>
                        </div>
                        <div class="order-cost">
                            <span class="cost-value">{transaction.cost}</span>
                            <span class="cost-label">hours</span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    .shop-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
        padding-top: 4vh;
    }

    .page-title {
        font-family: "Moga", sans-serif;
        font-size: 15vh;
        color: rgb(0, 0, 0);
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 15vh;
        position: relative;
        z-index: 2;
    }

    .page-title::before {
        content: "SHOP";
        position: absolute;
        width: 100%;
        color: rgb(255, 255, 255);
        top: -0.75vh;
        left: 0.75vh;
        z-index: 0;
    }

    .page-subtitle {
        font-family: "PT Serif", serif;
        font-weight: bold;
        font-size: 3.5vh;
        color: white;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1.5;
        padding-bottom: 4vh;
    }

    .tabs {
        display: flex;
        gap: 1vw;
        margin: 3vh 0;
        border-bottom: 0.35vh solid #7a6b9e;
        height: 8vh;
        align-items: end;
        padding-left: 1vw;
    }

    .tab {
        font-family: "PT Serif", serif;
        font-size: 2.5vh;
        font-weight: 900;
        padding: 1.5vh 2.5vw;
        padding-bottom: 1.25vh;
        border-radius: 2vh 2vh 0 0;
        border: 2px solid #7a6b9e;
        border-bottom: none;
        background: #f24b4b8a;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .tab:hover {
        background: #f24b4b9c;
        border-color: #fee1c0b0;
        padding-bottom: 2vh;
    }

    .tab.active {
        background: #F24B4B;
        border-color: #fee1c0;
        color: #fee1c0;
        padding-bottom: 3vh;
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

    .loading, .empty {
        font-family: "PT Sans", sans-serif;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        padding: 60px 0;
    }

    .empty-orders {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 0;
        text-align: center;
    }

    .empty-icon {
        font-size: 80px;
        margin-bottom: 24px;
    }

    .empty-text {
        font-family: "PT Sans", sans-serif;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0 0 24px;
    }

    .browse-button {
        font-family: "PT Sans", sans-serif;
        font-size: 18px;
        padding: 14px 32px;
        border-radius: 12px;
        border: none;
        background: #fee1c0;
        color: #453b61;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
    }

    .browse-button:hover {
        background: #fff;
        transform: translateY(-2px);
    }

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .order-card {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 20px;
        background: #5E5087;
        border-radius: 16px;
        border: 2px solid #7a6b9e;
    }

    .order-image {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        border-radius: 12px;
        overflow: hidden;
        background: #453b61;
    }

    .order-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .order-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
    }

    .order-details {
        flex: 1;
        min-width: 0;
    }

    .order-name {
        font-family: "PT Serif", serif;
        font-size: 24px;
        font-weight: bold;
        color: white;
        margin: 0 0 4px;
    }

    .order-variant {
        font-family: "PT Sans", sans-serif;
        font-size: 18px;
        font-weight: normal;
        color: #b8a9d4;
    }

    .order-description {
        font-family: "PT Sans", sans-serif;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .order-date {
        font-family: "PT Sans", sans-serif;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
    }

    .order-cost {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 20px;
        background: #453b61;
        border-radius: 12px;
        flex-shrink: 0;
    }

    .cost-value {
        font-family: "PT Serif", serif;
        font-size: 28px;
        font-weight: bold;
        color: #fee1c0;
        line-height: 1;
    }

    .cost-label {
        font-family: "PT Sans", sans-serif;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
    }
</style>
