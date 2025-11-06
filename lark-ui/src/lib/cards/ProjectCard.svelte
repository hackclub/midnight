<script lang="ts">
  import BaseCard from "./BaseCard.svelte";
 
 const { title, href, type }: {
  type: string;
  title: string;
  href: string;
 } = $props();
 
 let color = $state('#F24B4B'); 

 switch (type) {
    case 'website':
      color = '#FFBB31';
      break;
    case 'game':
      color = '#ED0F7E';
      break;
    case 'terminal_cli':
      color = '#1385F0';
      break;
    case 'desktop_app':
      color = '#1DCDC2';
      break;
    case 'mobile_app':
      color = '#A313F0';
      break;
 }

</script>

<BaseCard color={color} href={href}>
  {#snippet children()}
    <div class="project-content">
      <h2 class="project-title">
        <span class="title-line">{title}</span>
      </h2>
    </div>
  {/snippet}
</BaseCard>

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
    font-size: 48px;
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
