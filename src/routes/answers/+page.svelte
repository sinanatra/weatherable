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
        const results = await Promise.all([
            fetchData("2024-09-12"),
            fetchData("2024-09-13"),
            fetchData("2024-09-14"),
            fetchData("2024-09-15"),
        ]);

        data = results.flat();
    });
</script>

<!-- <h2>The perceived weather from ZK/U</h2> -->
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
    p {
        font-size: 2vw;
        text-align: center;
    }

    article {
        /* font-size: 18px; */
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
        font-size: 55px;
        line-height: 55px;
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
