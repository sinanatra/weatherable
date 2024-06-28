<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    let data = [];

    onMount(async () => {
        data = await fetchData();
    });
</script>

<article>
    <section class="data">
        {#if data.length > 0}
            <div>
                <Viz data={data[0]} />
            </div>
        {/if}
    </section>
</article>

<style>
    article {
        display: flex;
        gap: 20px;
        height: 100%;
        margin-top: 5px;
        padding: 10px;
    }
    section {
        flex: 1;
    }

    .data > div {
        border: 1px dashed;
        padding: 10px;
        width: 800px;
        height: 300px;
    }
</style>
