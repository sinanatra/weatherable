<script>
</script>

<header>
    <h1>Weatherables</h1>
</header>
<main>
    <slot />
</main>

<style>
    :global(body) {
        font-family: sans-serif;
        background-color: black;
        color: white;
        margin: 0;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-font-smoothing: antialiased;
        -o-font-smoothing: antialiased;
    }

    :global(h1, h2, h3) {
        font-weight: normal;
        margin: 5px;
    }

    :global(h1) {
        font-size: 18px;
    }

    :global(h2) {
        font-size: 16px;
    }

    header {
        border-bottom: 1px solid white;
    }
</style>
