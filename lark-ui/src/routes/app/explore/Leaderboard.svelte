<script lang="ts">
    let {
        hoursLeaderboard = [],
        approvedLeaderboard = []
    }: {
        hoursLeaderboard?: Array<{ firstName: string; hours: number; approved: number }>;
        approvedLeaderboard?: Array<{ firstName: string; hours: number; approved: number }>;
    } = $props();

    let activeTab: 'hours' | 'approved' = $state('hours');
    let open = $state(false);

    let currentLeaderboard = $derived(activeTab === 'hours' ? hoursLeaderboard : approvedLeaderboard);
    let sorted = $derived([...currentLeaderboard].sort((a, b) => 
        activeTab === 'hours' ? b.hours - a.hours : b.approved - a.approved
    ));

    function toggle() {
        open = !open;
    }

    function switchTab(tab: 'hours' | 'approved') {
        activeTab = tab;
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

    .table-header {
        display: grid;
        grid-template-columns: 80px 1fr 150px 150px;
        padding: 1.2vh 2vw;
        border-bottom: 3px solid rgba(0,0,0,0.3);
        font-weight: 900;
        color: #2a2746;
        background: #fee1c0;
    }

    .entry {
        display: grid;
        grid-template-columns: 80px 1fr 150px 150px;
        padding: 1.2vh 2vw;
        border-bottom: 1px solid rgba(0,0,0,0.15);
        font-weight: 700;
        color: #2a2746;
    }

    .entry:nth-child(2) { background: #f24b4b; color: #fee1c0; }
    .entry:nth-child(3) { background: #f56d6d; }
    .entry:nth-child(4) { background: #f88e8e; }

    .lb-header {
        font-weight: 900;
        text-align: center;
        padding: 2vh 0;
        font-size: 3vh;
        background: #2a2746;
        color: #fee1c0;
        border-bottom: 3px solid black;
        position: relative;
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

            <div class="lb-header z-50">
                <p class="text-[4vh] font-extrabold">Leaderboard</p>
                <button
                    on:click|stopPropagation={toggle}
                    class="absolute right-[2vw] top-1/2 -translate-y-1/2 bg-[#fee1c0] text-[#2a2746] border-2 border-black rounded-full px-[1vw] py-[0.5vh] text-[2vh] font-bold hover:bg-[#2a2746] hover:text-[#fee1c0] transition-all"
                >
                    Close
                </button>
            </div>

            <div class="flex gap-[2vw] items-center justify-center px-[4vw] py-[2vh] bg-[#2a2746] border-b-[3px] border-black">
                <button
                    on:click|stopPropagation={() => switchTab('hours')}
                    class="px-[2vw] py-[1vh] rounded-[1vh] text-[2.5vh] font-bold transition-all {activeTab === 'hours' ? 'bg-[#fee1c0] text-[#2a2746]' : 'bg-transparent text-[#fee1c0] hover:bg-[#fee1c0]/20'}"
                >
                    Total Hours
                </button>
                <button
                    on:click|stopPropagation={() => switchTab('approved')}
                    class="px-[2vw] py-[1vh] rounded-[1vh] text-[2.5vh] font-bold transition-all {activeTab === 'approved' ? 'bg-[#fee1c0] text-[#2a2746]' : 'bg-transparent text-[#fee1c0] hover:bg-[#fee1c0]/20'}"
                >
                    Approved Hours
                </button>
            </div>

            <div class="flex flex-col w-full h-[70vh] overflow-y-auto bg-[#fee1c0]">
                <div class="table-header text-[2vh]">
                    <div>Rank</div>
                    <div>Name</div>
                    <div>Hours</div>
                    <div>Approved</div>
                </div>
                {#each sorted as { firstName, hours, approved }, i}
                    <div class="entry text-[1.8vh]">
                        <div class="font-bold">{i + 1}</div>
                        <div class="font-bold">{firstName}</div>
                        <div>{hours}</div>
                        <div>{approved}</div>
                    </div>
                {/each}
            </div>
        </div>

    {:else}
        <!-- MINI PREVIEW -->
        <div class="flex flex-col w-full h-full bg-[#fee1c0] text-[#2a2746] p-[1vh]">
            <h3 class="text-[2.2vh] font-extrabold text-center mb-[1vh]">Top 3</h3>

            {#each sorted.slice(0, 3) as item, i}
                <div class="flex justify-between text-[1.8vh] font-bold border-b border-black/20 py-[0.5vh] rounded-[0.5vh] px-[0.5vw] {i === 0 ? 'bg-[#f24b4b] text-[#fee1c0]' : i === 1 ? 'bg-[#f56d6d]' : 'bg-[#f88e8e]'}">
                    <span>{i + 1}. {item.firstName}</span>
                    <span>{activeTab === 'hours' ? item.hours : item.approved}h</span>
                </div>
            {/each}
        </div>
    {/if}
</div>
