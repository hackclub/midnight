<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, recalculateHourCounts, updateUser, type User } from "$lib/auth";
    import ShopCard from "./ShopCard.svelte";
    import { shopData } from "./shop";

    let user: User | null = $state<User | null>(null);

    onMount(async () => {
        user = await checkAuthStatus();

        if (!user) {
            goto("/");
            return;
        }
    });
</script>

<div class="shop-page">
    <h1 class="page-title">SHOP</h1>
    <h2 class="page-subtitle">Click on a shop item to view it.</h2>
  
	<div class="grid grid-cols-4 w-full px-[3vw] gap-x-[3vw] gap-y-[6vh] pb-[10vh] text-[#fee1c0]">
        {#each shopData as item}
            <ShopCard index={item.index} name={item.name} img={item.img} requiredHours={item.requiredHours} desc={item.desc} />
        {/each}
	</div>
</div>

<style>
    .shop-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
    }

    .page-title {
        font-family: "Moga", sans-serif;
        font-size: 90px;
        color: white;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1;
    }

    .page-subtitle {
        font-family: "PT Serif", serif;
        font-weight: bold;
        font-size: 30px;
        color: white;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1.5;
        padding-bottom: 32px;
    }

    .details {
        display: flex;
        flex-direction: column;
        gap: 16px;

        width: min(100%, 400px);
    }

    .details-header {
        font-family: "PT Serif", sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: white;
    }

    .details-label {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        font-weight: 400;
        color: white;
    }

    .details-input {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        font-weight: 400;
        color: white;
        background: #3b3153;
        border: none;
        padding: 8px;
        border-radius: 4px;
        color-scheme: dark;
    }
</style>