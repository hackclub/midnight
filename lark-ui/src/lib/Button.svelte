<script lang="ts">
    let { label, disabled = false, icon = undefined, color = '#F24B4B', onclick = () => {}, type = 'button', variant = 'default' }: {
        label: string;
        disabled?: boolean;
        onclick?: () => void;
        icon?: string;
        color?: string;
        type?: 'button' | 'submit' | 'reset';
        variant?: 'default' | 'landing';
    } = $props();

    $effect(() => {
        switch (color) {
            case 'red':
                color = '#F24B4B';
                break;
            case 'blue':
                color = '#1385F0';
                break;
            case 'yellow':
                color = '#FFBB31';
                break;
            case 'black':
                color = '#2D273F';
                break;
            case 'white':
                color = '#FEE1C0';
                break;
            case 'pink':
                color = '#ED0F7E';
                break;
        }
    });

</script>

<button class="pushable pushable-{variant}" disabled={disabled} onclick={onclick} style="--color: {color}" type={type}>
    <span class="front front-{variant}">
        <p>{label}</p>
        {#if icon}
            <img src="/icons/{icon}.svg" alt="icon" />
        {/if}
    </span>
</button>

<style>
    .pushable {
      border: none;
      cursor: pointer;

      transform: translateY(8px) translateX(-8px);
    }

    .pushable-default {
      padding: 0;

      background-image: url('/shapes/shape-button-1.svg');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;

      rotate: -1deg;
    }

    .pushable-landing {
        background: black;
        border-radius: 14px;
    }

    .front {
        position: relative;
        font-family: "Moga", sans-serif;

        background: var(--color);

        padding: 0 24px;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;

        cursor: pointer;
        transition: background 0.2s;


        transform: translateY(-6px) translateX(6px);
        transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);        
    }

    .front-default {
        color: white;

        font-size: 48px;
        height: 60px;

        mask-image: url('/shapes/shape-button-1.svg');
        mask-size: cover;
        mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-image: url('/shapes/shape-button-1.svg');
        -webkit-mask-size: cover;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
    }

    .front-landing {
        color: #FEE1C0;

        font-size: 64px;
        padding: 8px 16px;

        border-radius: 12px;
    }

    .front p {
        letter-spacing: -0.5px;
        line-height: 60px;
        text-align: center;

        margin: 0;

        translate: 0 3px;
    }

    .pushable:not(:disabled):hover .front, .pushable:not(:disabled):focus .front {
        filter: brightness(1.2);
        transform: translateY(-10px) translateX(10px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }

    .pushable:not(:disabled):active .front {
        transform: translateY(-2px) translateX(2px);
        transition: transform 34ms;
    }

    .pushable:disabled .front {
        transform: translateY(0) translateX(0);
        scale: 1.01;
        background: #b0b0b0;
    }    

    .pushable:disabled:hover .front, .pushable:disabled:focus .front {
        background: #c0c0c0;
        cursor: not-allowed;
    }

    .pushable:focus {
        outline: none;
    }
</style>
