<script lang="ts">
    import { onMount } from "svelte";
    import { getHourCounts } from "./auth";

    let approvedHours = $state(15);
    let hackatimeHours = $state(25);
    let goalHours = $state(50);

    // onMount(async () => {
    //     const hourCounts = await getHourCounts();
    //     approvedHours = hourCounts.approvedHours;
    //     hackatimeHours =
    //         hourCounts.hackatimeHours - hourCounts.approvedHours > 50
    //             ? 50
    //             : hourCounts.hackatimeHours - hourCounts.approvedHours;
    // });
</script>

<div class="progress-card">
    <p class="time-left">
        {goalHours - hackatimeHours - approvedHours} hOuRS LEFT TO
        <span class="midnight">MIDNIGHT</span>
    </p>

    <div class="progress-track">
        <div
            class="progress-segment approved"
            style="width: {(approvedHours / goalHours) * 100}%"
        >
        </div>
        <div
            class="progress-segment hackatime"
            style="width: {((hackatimeHours + approvedHours) / goalHours) *
                100}%"
        >
        </div>
        <div
            class="progress-segment remaining"
            style="width: {((goalHours - hackatimeHours - approvedHours) /
                goalHours) *
                100}%"
        ></div>
    </div>

    <div class="progress-key">
        <p 
            class="key"
            style="width: {(approvedHours / goalHours) * 100}%"
        >{approvedHours} HOuRS <span class="approved">APPROVED</span></p>
        <p 
            class="key"
            style="width: {((hackatimeHours + approvedHours) / goalHours) * 100}%"
        >{hackatimeHours} HOuRS LOGGED ON <span class="hackatime">HACKATIME</span></p>
        <p 
            class="key"
            style="width: {((goalHours - hackatimeHours - approvedHours) / goalHours) * 100}%"
        >{goalHours - hackatimeHours - approvedHours} HouRS REMAINING</p>
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
        background: #2E2740;
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
        color: #1385f0;
    }

    .hackatime {
        color: #b4bbe2;
    }

    .remaining {
        color: #5e5087;
    }
</style>
