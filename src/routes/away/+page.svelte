<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let currentPage = 0;
    const pages = [
        "https://zku-experiments.vercel.app/page_1",
        "https://zku-experiments.vercel.app/page_3",
        // "https://zku-experiments.vercel.app/page_4",
    ];

    function rotatePage() {
        currentPage = (currentPage + 1) % pages.length;
    }

    onMount(async () => {
        setInterval(rotatePage, 120000);
    });
</script>

<div class="container">
    <iframe src={pages[currentPage]} frameborder="0"></iframe>
    <div class="next">
        <h1>Tattoo sessions are between 19-22</h1>
    </div>
</div>

<style>
    .container {
        position: relative;
        width: 100vw;
        height: 100vh;
    }

    iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }

   
    .next {
        position: absolute;
        top: 40%;
        left: 0%;

        padding: 10vw;
        color: yellow;
        text-align: center;
        z-index: 10;
    }

    .next h1 {
        font-size: 8vw;
        line-height: 8vw;
    }

    h1 {
        text-align: center;
        font-weight: 400;
        font-size: 1em;
        margin: 0px;
        padding: 0;
    }
</style>
