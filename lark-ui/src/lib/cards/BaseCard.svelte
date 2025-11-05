<script lang="ts">
  let { children, color = '#081832', href = '#' } = $props();

  let randRot = $state(Math.random() > 0.5 ? 1 : -1);
</script>

<a href={href}>
  <div class="base-card" style="--rand-rot: {randRot}deg">
    <div class="card-background" style="background-color: {color}"></div>
    <div class="card-border"></div>
    <div class="card-content">
      {@render children?.()}
    </div>
    </div>
</a>

<style>
  .base-card {
    position: relative;
    width: 207px;
    height: 308px;

    transition: all 250ms cubic-bezier(0.3, 0.7, 0.4, 1);
  }

  .base-card:hover {
    scale: 1.035;
    rotate: var(--rand-rot);
    transition: all 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    cursor: pointer;
  }

  .card-background {
    position: absolute;
    inset: 0;
    right: 0.3%;
    border-radius: 8px;
  }

  .card-border {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 190px;
    height: 292px;
    border: 3px solid white;
    border-radius: 4px;
  }

  .card-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
</style>
