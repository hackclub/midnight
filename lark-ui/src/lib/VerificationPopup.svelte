<script lang="ts">
    import Button from "./Button.svelte";

    const {
        onClose,
    }: {
        onClose: () => void;
    } = $props();
</script>

<div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && onClose()}>
    <div class="modal-content">
        <h2 class="modal-title">Verification Required</h2>
        <p class="modal-text">
            You must be verified eligible to purchase items from the shop. 
            Please complete verification before making a purchase.
        </p>
        <div class="button-container">
            <Button 
                label="Close" 
                onclick={onClose}
                color="black"
            />
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: #5E5087;
        border: 2px solid #fee1c0;
        border-radius: 16px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .modal-title {
        font-family: "Moga", sans-serif;
        font-size: 36px;
        color: #fee1c0;
        text-align: center;
        letter-spacing: -0.99px;
        margin: 0;
        line-height: 1.2;
    }

    .modal-text {
        font-family: "PT Sans", sans-serif;
        font-size: 18px;
        color: white;
        text-align: center;
        letter-spacing: -0.264px;
        line-height: 1.5;
        margin: 0;
    }

    .button-container {
        display: flex;
        justify-content: center;
        margin-top: 8px;
    }
</style>

