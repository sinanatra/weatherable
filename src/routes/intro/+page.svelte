<script>
    import Bg from "@components/Bg.svelte";
</script>

<article>
    <Bg />
    <iframe src="https://zku-experiments.vercel.app/page_4" frameborder="0" width="100%" height="100%"></iframe>
</article>

<style>
    article {
        height: 100%;
    }
    iframe {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }
</style>
