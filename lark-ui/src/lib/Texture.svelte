<div class="texture-overlay">
    <img src="/cardboard-texture-1.png" alt="" class="texture-bg" />
    <div class="texture-layer">
        <img src="/cardboard-texture-2.png" alt="" class="texture-inner" />
    </div>
    <div class="texture-dark"></div>
</div>

<style>
  .texture-overlay {
    position: absolute;
    top: -510px;
    left: -177px;
    width: 1695px;
    height: 1697px;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .texture-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 50%;
  }

  .texture-layer {
    position: absolute;
    inset: 0;
  }

  .texture-inner {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: 50% 50%;
  }

  .texture-dark {
    position: absolute;
    top: 27.4%;
    right: 9.2%;
    bottom: 24.34%;
    left: 9.2%;
    background: rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    .texture-overlay {
      top: -300px;
      left: -100px;
      width: 1000px;
      height: 1000px;
    }
  }

  @media (max-width: 480px) {
    .texture-overlay {
      top: -200px;
      left: -50px;
      width: 600px;
      height: 600px;
    }
  }
</style>