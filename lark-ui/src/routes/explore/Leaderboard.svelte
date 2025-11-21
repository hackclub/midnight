<script lang="ts">
    export let leaderboard:any = [];

    $: sorted = [...leaderboard].sort((a, b) => b.hours - a.hours);


    // Local state (no need for parent)
    let open = false;

    function toggle() {
        open = !open;
    }
</script>

<style>
    .leaderboard {
        transition:
            width 0.6s cubic-bezier(0.25, 0.8, 0.3, 1),
            height 0.6s cubic-bezier(0.25, 0.8, 0.3, 1),
            top 0.6s cubic-bezier(0.25, 0.8, 0.3, 1),
            right 0.6s cubic-bezier(0.25, 0.8, 0.3, 1),
            border-radius 0.6s cubic-bezier(0.25, 0.8, 0.3, 1);
        font-family: 'PT Serif', serif;
    }

    .leaderboard.small {
        width: 18vw;
        height: 22vh;
        cursor: pointer;
    }
    .leaderboard.full {
        width: 100vw;
        height: 100vh;
        top: 0;
        right: 0;
        border-radius: 0;
    }

    .entry {
        display: flex;
        justify-content: space-between;
        padding: 1.2vh 2vw;
        border-bottom: 1px solid rgba(0,0,0,0.15);
        font-weight: 700;
        color: #2a2746;
    }

    .entry:nth-child(1) { background: #f24b4b; color: #fee1c0; }
    .entry:nth-child(2) { background: #f56d6d; }
    .entry:nth-child(3) { background: #f88e8e; }

    .lb-header {
        font-weight: 900;
        text-align: center;
        padding: 1.5vh 0;
        font-size: 3vh;
        background: #2a2746;
        color: #fee1c0;
        border-bottom: 3px solid black;
    }
</style>

<div
    class="leaderboard fixed rounded-[2vh] z-10 top-[2vh] right-[2vw] overflow-hidden border-2 border-black/0 {open ? 'full' : 'small'}"
    on:click={() => {
        if (!open) toggle();
    }}
>
    {#if open}
        <!-- FULL LEADERBOARD -->
        <div class="w-[98vw] ml-[1vw] mt-[2vh] rounded-[2vh] overflow-hidden">

            <div class="lb-header flex justify-between items-center px-[4vw] z-50">
                <p class="pt-[5vh] text-center mx-auto text-[5vh] font-extrabold">Leaderboard</p>

                <button
                    on:click|stopPropagation={toggle}
                    class="bg-[#fee1c0] text-[#2a2746] border-2 mr-[2vh] border-black rounded-full px-[1vw] py-[0.5vh] text-[2vh] font-bold hover:bg-[#2a2746] hover:text-[#fee1c0] transition-all"
                >
                    Close
                </button>
            </div>

            <div class="flex flex-col w-full h-[70vh] overflow-y-auto bg-[#fee1c0]">
              {#each sorted as { name, hours, approvedHours, coins }, i}
                    <div class="entry text-[2.2vh] flex flex-col">
                        <div class="flex justify-between text-[1.8vh] mt-[0.5vh] opacity-90 font-semibold">
                            <span class="font-bold min-w-[10vw]">{i + 1}. {name}</span>
                            <span>Hours: {hours}</span>
                            <span>Approved: {approvedHours}</span>
                            <span>Coins: {coins}</span>
                        </div>
                    </div>
                {/each}

            </div>
        </div>

    {:else}
        <!-- MINI PREVIEW -->
        <div class="flex flex-col w-full h-full bg-[#fee1c0] text-[#2a2746] p-[1vh]">
            <h3 class="text-[2.2vh] font-extrabold text-center mb-[1vh]">Top 3</h3>

            {#each leaderboard.slice(0, 3) as item, i}
                <div class="flex justify-between text-[1.8vh] font-bold border-b border-black/20 py-[0.5vh]">
                    <span>{i + 1}. {item.name}</span>
                    <span>{item.score}</span>
                </div>
            {/each}
        </div>
    {/if}
</div>
