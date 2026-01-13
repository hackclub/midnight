<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, getHourCounts, recalculateHourCounts, updateUser, type User } from "$lib/auth";
    import Button from "$lib/Button.svelte";

    let user: User | null = $state<User | null>(null);

    let firstName = $state("");
    let lastName = $state("");
    let birthday = $state("");

    let totalNowHackatimeHours = $state(0);

    let updating = $state(false);
    let updated = $state(false);

    let hourGoal = $state(50);
    let goalUpdating = $state(false)
    let goalUpdated = $state(false);

    onMount(async () => {
        user = await checkAuthStatus();
        const hackatime = await getHourCounts();

        if (user) {
            firstName = user.firstName;
            lastName = user.lastName;
            birthday = (new Date(user.birthday)).toISOString().split('T')[0];
            totalNowHackatimeHours = hackatime.hackatimeHours;

            const savedGoal = localStorage.getItem('hourGoal');
            if (savedGoal) {
                hourGoal = parseInt(savedGoal, 10);
            }
        } else {
            goto("/");
            return;
        }
    });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        
        updating = true;
        await updateUser({
            firstName: firstName,
            lastName: lastName,
            birthday: birthday,
        });
        updating = false;
        updated = true;
        setTimeout(() => {
            updated = false;
        }, 3000);
    }

    async function recalculateHours() {
        const response = await recalculateHourCounts();
        totalNowHackatimeHours = response.totalNowHackatimeHours;
    }

    function updateHourGoal() {
        goalUpdating = true;
        localStorage.setItem('hourGoal', hourGoal.toString());
        goalUpdating = false;
        goalUpdated = true;
        setTimeout(() => {
            goalUpdated = false;
        }, 3000);
    }
</script>

<div class="settings-page">
    <h1 class="page-title">SETTINGS</h1>

    <div class="settings">
        <form class="details" onsubmit={handleSubmit}>
            <h2 class="details-header">Account Information</h2>
            <div class="input-section">
                <label class="details-label" for="First Name">First Name</label>
                <input
                    class="details-input"
                    type="text"
                    id="First Name"
                    name="First Name"
                    placeholder="William"
                    required
                    bind:value={firstName}
                />
            </div>
            <div class="input-section">
            <label class="details-label" for="Last Name">Last Name</label>
            <input
                class="details-input"
                type="text"
                id="Last Name"
                name="Last Name"
                placeholder="Daniel"
                required
                bind:value={lastName}
            />
            </div>
            <div class="input-section">
            <label class="details-label" for="Birthday">Birthday</label>
            <input
                class="details-input"
                type="date"
                id="Birthday"
                name="Birthday"
                required
                bind:value={birthday}
            />
            </div>
            <div class="submit">
                <Button label={updating ? "Updating..." : updated ? "Updated!" : "Update"} disabled={updating} color={updating ? "blue" : updated ? "blue" : "red"} type='submit' />
            </div>
        </form>

        <div class="details">
            <h2 class="details-header">Hours Recalculation</h2>
            <p class="details-text">Do your hours seem wrong? Recalculate your hours below.</p>
            <p class="details-text">Total Hours: {totalNowHackatimeHours}</p>
            <div>
                <Button label="Recalculate Hours" color="blue" onclick={recalculateHours} />
            </div>
        </div>

        <div class="details">
            <h2 class="details-header">Hour Goal</h2>
            <p class="details-text">Set your hour goal for the dashboard progress bar.</p>
            <div class="slider-section">
                <p class="goal-display">{hourGoal} hours</p>
                <div class="slider-wrapper">
                    <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        bind:value={hourGoal}
                        class="slider"
                        style="--value: {((hourGoal - 50) / 100) * 100}"
                    />
                </div>
                <div class="slider-labels">
                    <span>50</span>
                    <span>150</span>
                </div>
            </div>
            <div>
                <Button label={goalUpdating ? "Saving..." : goalUpdated ? "Saved!" : "Save Goal"} disabled={goalUpdating} color={goalUpdating ? "blue" : goalUpdated ? "blue" : "red"} onclick={updateHourGoal} />
            </div>
        </div>
    </div>
</div>

<style>
    .settings-page {
        position: relative;
        min-height: 100vh;
        background: #453b61;
        padding: 57px 50px 200px;
    }

    .settings {
        display: flex;
        flex-direction: row;
        gap: 64px;
    }

    .page-title {
        font-family: "Moga", sans-serif;
        font-size: 90px;
        color: white;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1.5;
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

    .details-label, .details-text {
        font-family: "PT Sans", sans-serif;
        font-size: 20px;
        font-weight: 400;
        color: white;
    }

    .details-input {
        font-family: "PT Sans", sans-serif;
        font-size: 20px;
        font-weight: 400;
        color: white;
        background: #3b3153;
        border: none;
        padding: 8px;
        border-radius: 4px;
        color-scheme: dark;
    }

    .input-section {
        display: flex;
        flex-direction: column;
    }

    .slider-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .goal-display {
        font-family: "Moga", sans-serif;
        font-size: 36px;
        color: #f24b4b;
        margin: 0;
    }

    .slider-wrapper {
        width: 100%;
    }

    .slider {
        width: 100%;
        height: 10px;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(to right,
            #f24b4b 0%,
            #f24b4b calc(var(--value) * 1%),
            #5e5087 calc(var(--value) * 1%),
            #5e5087 100%);
        border-radius: 10px;
        outline: none;
        cursor: pointer;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        background: #f24b4b;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        background: #f24b4b;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        font-family: "PT Sans", sans-serif;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
    }
</style>
