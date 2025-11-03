<script lang="ts">
    import FlexCard from "./FlexCard.svelte";
 
    const { color, title, href }: {
        color: string;
        title: string;
        href: string;
    } = $props();  
</script>

<FlexCard color={color} href={href}>
  {#snippet children()}
    <div class="project-content">
      <h2 class="project-title">
        <span class="title-line">{title}</span>
      </h2>
    </div>
  {/snippet}
</FlexCard>

<style>
  .project-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .project-title {
    font-family: 'Moga', sans-serif;
    font-size: 96px;
    color: white;
    text-align: center;
    letter-spacing: -0.528px;
    line-height: 0.9;
    margin: 0 0 20px 0;
    width: 152px;

    overflow-wrap: break-word;
  }

  .title-line {
    display: block;
  }
</style>
