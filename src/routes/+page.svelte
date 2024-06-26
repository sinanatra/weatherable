<script>
    import { onMount } from "svelte";

    async function fetchData() {
        const res = await fetch(`/api/get`);
        const json = await res.json();
        return json.reverse();
    }

    let data = [];
    onMount(async () => {
        data = await fetchData();
    });
</script>

<article>
    {#if data}
        {#each data as d}
            {d._id}
        {/each}
    {/if}
</article>

<style>
</style>
