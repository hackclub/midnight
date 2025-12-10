<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, getShopItem, getShopBalance, purchaseShopItem, type User, type ShopItem, type ShopBalance, type ShopItemVariant } from "$lib/auth";
    import { page } from "$app/state";
    import Button from "$lib/Button.svelte";
    import VerificationPopup from "$lib/VerificationPopup.svelte";

    let user: User | null = $state<User | null>(null);
    let item: ShopItem | null = $state(null);
    let balance: ShopBalance | null = $state(null);
    let loading = $state(true);
    let purchasing = $state(false);
    let error = $state('');
    let success = $state('');
    let selectedVariantId = $state<number | null>(null);
    let specialAction = $state<string | null>(null);
    let showVerificationPopup = $state(false);

    const itemId = parseInt(page.params.id!);

    onMount(async () => {
        user = await checkAuthStatus();

        if (!user) {
            goto("/");
            return;
        }

        const [itemData, balanceData] = await Promise.all([
            getShopItem(itemId),
            getShopBalance()
        ]);
        
        item = itemData;
        balance = balanceData;
        loading = false;

        if (!item) {
            goto("/app/shop");
        }
    });

    async function handlePurchase() {
        if (!item || purchasing || !user) return;
        
        const hasVariants = item.variants && item.variants.length > 0;
        if (hasVariants && !selectedVariantId) {
            error = 'Please select a variant';
            return;
        }
        
        error = '';
        success = '';
        specialAction = null;
        purchasing = true;

        const result = await purchaseShopItem(item.itemId, selectedVariantId || undefined);
        
        if (result.success) {
            const variantName = selectedVariant?.name ? ` (${selectedVariant.name})` : '';
            success = `Successfully purchased ${item.name}${variantName}!`;
            if (result.newBalance) {
                balance = result.newBalance;
            }
            if (result.specialAction) {
                specialAction = result.specialAction;
            }
        } else {
            error = result.error || 'Purchase failed';
            if (result.error?.includes('verified eligible') || result.error?.includes('verify eligibility')) {
                showVerificationPopup = true;
            }
        }
        
        purchasing = false;
    }

    let hasVariants = $derived(item?.variants && item.variants.length > 0);
    let selectedVariant = $derived(hasVariants && selectedVariantId ? item?.variants?.find(v => v.variantId === selectedVariantId) : null);
    let effectiveCost = $derived(selectedVariant ? selectedVariant.cost : (item?.cost ?? 0));
    let canAfford = $derived(balance ? balance.balance >= effectiveCost : false);
    let canPurchase = $derived(canAfford && item?.isActive && (!hasVariants || selectedVariantId !== null));
</script>

<div class="shop-page">
    <div class="back-button">
        <Button label={'← Back to Shop'} onclick={() => goto("/app/shop")} color='black' />   
    </div>
    
    {#if loading}
        <div class="loading">Loading...</div>
    {:else if item}
        <div class="item-overview {!item.isActive ? 'inactive' : ''}">
            <div class="flex flex-col items-stretch justify-center">
                {#if item.imageUrl}
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        class="rounded-[1.5vh] mb-[1vh] w-[400px] object-cover border-2 border-black no-select {!item.isActive ? 'grayscale opacity-50' : ''}"
                        draggable="false"
                    />
                {:else}
                    <div class="rounded-[1.5vh] mb-[1vh] w-[400px] h-[300px] bg-[#5E5087] border-2 border-black flex items-center justify-center {!item.isActive ? 'grayscale opacity-50' : ''}">
                        <span class="text-8xl">🛍️</span>
                    </div>
                {/if}
            </div>
            <div class="item-content">
                <div class="item-inner">
                    <h1 class="item-name {!item.isActive ? 'opacity-50' : ''}">{item.name}</h1>
                    {#if !item.isActive}
                        <div class="unavailable-badge">UNAVAILABLE</div>
                    {/if}
                    
                    {#if hasVariants}
                        <h2 class="req-hours {!item.isActive ? 'opacity-50' : ''}">
                            {#if selectedVariant}
                                {selectedVariant.cost} hours
                            {:else}
                                Select a variant
                            {/if}
                        </h2>
                        
                        <div class="variants-section {!item.isActive ? 'opacity-50' : ''}">
                            <p class="variants-label">Choose an option:</p>
                            <div class="variants-grid">
                                {#each item.variants ?? [] as variant (variant.variantId)}
                                    <button
                                        class="variant-button {selectedVariantId === variant.variantId ? 'selected' : ''}"
                                        onclick={() => selectedVariantId = variant.variantId}
                                        disabled={!item.isActive}
                                    >
                                        <span class="variant-name">{variant.name}</span>
                                        <span class="variant-cost">{variant.cost} hrs</span>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <h2 class="req-hours {!item.isActive ? 'opacity-50' : ''}">{item.cost} hours</h2>
                    {/if}
                    
                    {#if item.description}
                        <p class="item-desc {!item.isActive ? 'opacity-50' : ''}">{item.description}</p>
                    {/if}
                    
                    {#if balance && item.isActive}
                        <div class="balance-info">
                            <p class="your-balance">Your balance: <strong>{balance.balance} hours</strong></p>
                            {#if !canAfford && (selectedVariant || !hasVariants)}
                                <p class="need-more">You need {(effectiveCost - balance.balance).toFixed(1)} more hours</p>
                            {/if}
                        </div>
                    {/if}
                </div>
                <div class="purchase-section">
                    {#if error}
                        <p class="error-message">{error}</p>
                    {/if}
                    {#if success}
                        <p class="success-message">{success}</p>
                    {/if}
                    {#if specialAction === 'midnight_ticket'}
                        <div class="special-action-card">
                            <h3 class="special-title">Check Your Email!</h3>
                            <p class="special-text">
                                We've sent your Midnight ticket confirmation to your email address. 
                                Please check your inbox (and spam folder) for details about the event.
                            </p>
                        </div>
                    {/if}
                    {#if item.isActive && !specialAction}
                        <Button 
                            label={purchasing ? "Purchasing..." : (hasVariants && !selectedVariantId ? "Select a variant" : (canAfford ? "Purchase" : "Not enough hours"))} 
                            disabled={!canPurchase || purchasing}
                            onclick={handlePurchase}
                        />
                    {:else if !item.isActive}
                        <Button 
                            label="Item Unavailable" 
                            disabled={true}
                        />
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    {#if showVerificationPopup}
        <VerificationPopup onClose={() => showVerificationPopup = false} />
    {/if}
</div>

<style>
    .shop-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
    }

    .loading {
        font-family: "PT Sans", sans-serif;
        font-size: 24px;
        color: white;
        text-align: center;
        padding: 100px 0;
    }

    .item-overview {
        display: flex;
        align-items: stretch;
        gap: 48px;
        min-height: 600px;
    }

    .item-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100%;
    }

    .item-name {
        font-family: "Moga", sans-serif;
        font-size: 90px;
        color: white;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1;
        max-width: 750px;
    }

    .req-hours {
        font-family: "PT Serif", serif;
        font-size: 40px;
        color: white;
        letter-spacing: -0.99px;
        margin-bottom: 30px;
        line-height: 1;
        max-width: 750px;
    }

    .item-desc {
        font-family: "PT Sans", sans-serif;
        font-size: 24px;
        color: white;
        font-weight: normal;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1.4;
        max-width: 750px;
    }

    .variants-section {
        margin-bottom: 24px;
    }

    .variants-label {
        font-family: "PT Sans", sans-serif;
        font-size: 18px;
        color: #fee1c0;
        margin-bottom: 12px;
    }

    .variants-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .variant-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 24px;
        background: #5E5087;
        border: 2px solid #7a6b9e;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
    }

    .variant-button:hover:not(:disabled) {
        background: #6d5f96;
        border-color: #9a8bb5;
        transform: translateY(-2px);
    }

    .variant-button.selected {
        background: #8b7daf;
        border-color: #fee1c0;
        box-shadow: 0 0 12px rgba(254, 225, 192, 0.3);
    }

    .variant-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .variant-name {
        font-family: "PT Serif", serif;
        font-size: 20px;
        font-weight: bold;
        color: white;
    }

    .variant-cost {
        font-family: "PT Sans", sans-serif;
        font-size: 14px;
        color: #fee1c0;
        margin-top: 4px;
    }

    .balance-info {
        margin-top: 30px;
        padding: 20px;
        background: #5E5087;
        border-radius: 12px;
    }

    .your-balance {
        font-family: "PT Sans", sans-serif;
        font-size: 20px;
        color: white;
        margin: 0;
    }

    .your-balance strong {
        color: #fee1c0;
    }

    .need-more {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        color: #ff9999;
        margin: 8px 0 0;
    }

    .back-button {
        margin-bottom: 30px;
        position: sticky;
        top: 57px;
        z-index: 10;
    }

    .purchase-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .error-message {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        color: #ff6b6b;
        margin: 0;
        padding: 12px 16px;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 8px;
    }

    .success-message {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        color: #69db7c;
        margin: 0;
        padding: 12px 16px;
        background: rgba(105, 219, 124, 0.1);
        border-radius: 8px;
    }

    .unavailable-badge {
        display: inline-block;
        font-family: "PT Sans", sans-serif;
        font-size: 14px;
        font-weight: bold;
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.2);
        border: 1px solid #ff6b6b;
        padding: 6px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        letter-spacing: 1px;
    }

    .item-overview.inactive {
        opacity: 0.9;
    }

    .special-action-card {
        background: #5E5087;
        border: 2px solid black;
        border-radius: 12px;
        padding: 24px;
    }

    .special-title {
        font-family: "PT Serif", serif;
        font-size: 28px;
        font-weight: bold;
        color: #fee1c0;
        margin: 0 0 12px;
    }

    .special-text {
        font-family: "PT Sans", sans-serif;
        font-size: 18px;
        color: white;
        margin: 0;
        line-height: 1.5;
    }
</style>
