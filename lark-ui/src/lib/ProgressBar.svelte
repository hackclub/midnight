<script lang="ts">
    import { onMount } from "svelte";
    import { getHourCounts } from "./auth";

    let approvedPercentage = $state(0.0);
    let reviewPercentage = $state(0.0);
    let remainingPercentage = $state(0.0);

    let totalHours = $state(0);
    let rawApprovedHours = $state(0);
    let rawTotalHours = $state(0);
    let goalHours = $state(50);

    onMount(async () => {
        const savedGoal = localStorage.getItem('hourGoal');
        if (savedGoal) {
            const parsed = parseInt(savedGoal, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                goalHours = parsed;
            }
        }

        const hourCounts = await getHourCounts();

        rawApprovedHours = +hourCounts.approvedHours.toFixed(2);
        rawTotalHours = +hourCounts.hackatimeHours.toFixed(2);

        let approvedHours =
            hourCounts.approvedHours > goalHours ? goalHours : hourCounts.approvedHours;
        totalHours =
            hourCounts.hackatimeHours > goalHours ? goalHours : hourCounts.hackatimeHours;

        approvedPercentage = approvedHours / goalHours;
        reviewPercentage = (totalHours - approvedHours) / goalHours;
        remainingPercentage = (goalHours - totalHours) / goalHours;
    });

    let remainingHours = $derived(goalHours - totalHours);
    let formattedRemainingHours = $derived(remainingHours.toFixed(1));
    let formattedApprovedHours = $derived(rawApprovedHours.toFixed(1));
    let formattedPendingHours = $derived((rawTotalHours - rawApprovedHours).toFixed(1));
</script>

<div class="progress-card">
    <p class="time-left">
        {formattedRemainingHours} hOuRS LEFT TO
        <span class="midnight">MIDNIGHT</span>
    </p>

    <div class="progress-track">
        {#if rawApprovedHours > 0}
            <div
                class="progress-segment approved"
                style="width: {approvedPercentage * 100}%"
            ></div>
        {/if}
        {#if reviewPercentage > 0}
            <div
                class="progress-segment hackatime"
                style="width: {reviewPercentage * 100}%"
            ></div>
        {/if}
        {#if remainingHours > 0}
            <div
                class="progress-segment remaining"
                style="width: {remainingPercentage * 100}%"
            ></div>
        {/if}
    </div>

    <div class="progress-key">
        {#if rawApprovedHours > 0}
            <p class="key" style="width: {approvedPercentage * 100}%">
                {formattedApprovedHours} HOuRS <span class="approved">APPROVED</span>
            </p>
        {/if}
        {#if rawTotalHours > rawApprovedHours && rawApprovedHours < goalHours}
            <p
                class="key"
                style="width: {reviewPercentage * 100}%"
            >
                {formattedPendingHours} HOuRS
                <span class="hackatime">PENDING FOR REVIEW</span>
            </p>
        {/if}
        {#if remainingHours > 0 && rawApprovedHours < goalHours}
            <p
                class="key"
                style="width: {remainingPercentage * 100}%"
            >
                {formattedRemainingHours} HouRS REMAINING
            </p>
        {/if}
    </div>
</div>

<style>
    .time-left {
        font-family: "Moga", sans-serif;
        font-size: 44px;
        color: white;
        letter-spacing: -0.264px;
        line-height: 1.5;
        margin: 0;
        text-align: left;
        white-space: nowrap;

        margin-bottom: 8px;
    }

    .midnight {
        color: #f24b4b;
    }

    .progress-card {
        background: #2e2740;
        border-radius: 16px;
        padding: 16px 20px;
        margin: 16px;
        margin-top: 0;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
    }

    .progress-track {
        display: flex;
        flex-direction: row;

        border-radius: 16px;
        overflow: hidden;
    }

    .progress-segment {
        height: 32px;
        color: white;
    }

    .progress-segment.hackatime {
        background-color: #4f5b9c;
    }

    .progress-segment.approved {
        background-color: #1385f0;
    }

    .progress-segment.remaining {
        background-color: #5e5087;
    }

    .progress-key {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    .key {
        font-family: "Moga", sans-serif;
        font-size: 16px;
        text-align: center;
        color: white;
    }

    .approved {
        color: #7bbbf6;
    }

    .hackatime {
        color: #b4bbe2;
    }

    .remaining {
        color: #5e5087;
    }
</style>
