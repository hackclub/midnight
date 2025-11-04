<script lang="ts">
  let { children, color = '#081832', href = '#' } = $props();
</script>

<a href={href}>
  <div class="base-card">
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
    width: 100%;
    height: 100%;

    transition: all 0.1s ease-in;
  }

  .base-card:hover {
    translate: 0px -8px;
    transition: all 0.1s ease-out;
    cursor: pointer;
  }

  .card-background {
    position: absolute;
    inset: 0;
    right: 0%;
    border-radius: 16px;
  }

  .card-border {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 92%;
    height: 94%;
    border: 5.3px solid white;
    border-radius: 8px;
  }

  .card-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
</style>
