<script>
    import { onMount } from "svelte";
    import Submit from "@components/Submit.svelte";

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
        {#each data.slice(0, 10) as d}
            <div>
                <!-- <span>{d._id}</span> -->
                <span>{d.answer}</span>
            </div>
        {/each}
    {/if}
</article>
<section>
    <Submit />
</section>

<style>
    article {
        min-height: 100px;
        margin-bottom: 50px;
        border-bottom: 1px dashed;
    }
</style>
