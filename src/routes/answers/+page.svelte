<script>
    import { onMount } from "svelte";

    async function fetchData(date) {
        const encodedDate = encodeURIComponent(date);

        const res = await fetch(`/api/getdate?date=${encodedDate}`);
        const json = await res.json();

        return json;
    }

    let data = [];

    onMount(async () => {
        data = await fetchData("2024-07-18");
    });
</script>

<h2>The perceived weather from the ZK/U openhaus</h2>
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
    h2 {
        font-size: 3rem;
        text-align: center;
    }

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
