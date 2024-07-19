<script>
    import { onMount } from "svelte";

    async function fetchData() {
        const res = await fetch(`/api/get`);
        const json = await res.json();
        return json;
    }

    let data = [];

    onMount(async () => {
        data = await fetchData();
    });
</script>

<article>
    {#if data.length > 0}
        {#each data as d}
            <p>
                {d.answer}
            </p>
        {/each}
    {/if}
</article>

<style>
    article {
        font-size: 18px;
        padding: 10px;
        color: white;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        align-content: space-around;
        justify-content: center;
        text-align: center;
    }

    p {
        display: inline-block;
        font-size: 50px;
        line-height: 50px;
        margin: 0;
        padding: 0;
        align-items: center;
    }

    p::after {
        content: " - ";
        padding-right: 10px;
        color: gray;
    }
</style>
