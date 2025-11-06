<script lang="ts">
  import FlexCard from "./FlexCard.svelte";
 
  const { type, title, href }: {
    title: string;
    type: string;
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
    letter-spacing: -0.5px;
    line-height: 0.9;
    margin: 0 0 20px 0;
    width: 90%;

    overflow-wrap: break-word;
  }

  .title-line {
    display: block;
  }
</style>
