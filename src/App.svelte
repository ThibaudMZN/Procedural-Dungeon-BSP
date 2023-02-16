<script lang="ts">
  import Visualizer from "./lib/Visualizer.svelte";
</script>

<main>
  <h1>Procedural Polygon Map</h1>
  <div class="container">
    <Visualizer />
  </div>
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");

  :global(body) {
    background: #222222;
    color: white;
    font-family: "Poppins", sans-serif;
  }

  h1 {
    text-align: center;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
