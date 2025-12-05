<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, recalculateHourCounts, updateUser, type User } from "$lib/auth";
    import ShopCard from "../ShopCard.svelte";
    import { page } from "$app/state";
    import Button from "$lib/Button.svelte";
    import { shopData } from "../shop";

    let user: User | null = $state<User | null>(null);

    const index = parseInt(page.params.id!);

    onMount(async () => {
        user = await checkAuthStatus();

        if (!user) {
            goto("/");
            return;
        }
    });
</script>

<div class="shop-page">
    <div class="back-button">
        <Button label={'← Back to Shop'} onclick={() => goto("/app/shop")} color='black' />   
    </div>
    <div class="item-overview">
        <div class="flex flex-col items-stretch justify-center">
            <img
                src={shopData[index].img}
                alt={shopData[index].name}
                class="rounded-[1.5vh] mb-[1vh] w-[400px] object-cover border-2 border-black no-select"
                draggable="false"
            />
        </div>
        <div class="item-content">
            <div class="item-inner">
                <h1 class="item-name">{shopData[index].name}</h1>
                <h2 class="req-hours">{shopData[index].requiredHours} hours</h2>
                <p class="item-desc">{shopData[index].desc}</p>
            </div>
            <div>
                <Button label="Coming Soon" disabled />
            </div>
        </div>
    </div>
</div>

<style>
    .shop-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
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
        line-height: 1;
        max-width: 750px;
    }

    .back-button {
        margin-bottom: 30px;
        position: sticky;
        top: 57px;
        z-index: 10;
    }

</style>