<script>
</script>

<main>
    <slot />
</main>

<style>
    :global(body) {
        font-family:
            Arial Narrow,
            Helvetica,
            sans-serif;
        background-color: black;
        color: white;
        margin: 0;
        font-size: 90px;
        line-height: 1.2em;
       
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-font-smoothing: antialiased;
        -o-font-smoothing: antialiased;
    }

    :global(h1, h2, h3) {
        font-weight: normal;
        margin: 5px;

        background-color: #565656;
        color: transparent;
        text-shadow: 0px 2px 3px rgba(255, 255, 255, 0.5);
        -webkit-background-clip: text;
        -moz-background-clip: text;
        background-clip: text;
    }

    header {
        border-bottom: 1px solid white;
    }
</style>
