<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuthStatus, updateUser, type User } from "$lib/auth";
    import Button from "$lib/Button.svelte";

    let user: User | null = $state<User | null>(null);

    let firstName = $state("");
    let lastName = $state("");
    let birthday = $state("");

    let updating = $state(false);
    let updated = $state(false);

    onMount(async () => {
        user = await checkAuthStatus();

        if (user) {
            firstName = user.firstName;
            lastName = user.lastName;
            birthday = (new Date(user.birthday)).toISOString().split('T')[0];
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
</script>

<div class="settings-page">
    <h1 class="page-title">SETTINGS</h1>

    <form class="details" onsubmit={handleSubmit}>
        <h2 class="details-header">Account Information</h2>
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
        <label class="details-label" for="Birthday">Birthday</label>
        <input
            class="details-input"
            type="date"
            id="Birthday"
            name="Birthday"
            required
            bind:value={birthday}
        />
        <div class="submit">
            <Button label={updating ? "Updating..." : updated ? "Updated!" : "Update"} disabled={updating} color={updating ? "blue" : updated ? "blue" : "red"} type='submit' />
        </div>
    </form>
</div>

<style>
    .settings-page {
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
