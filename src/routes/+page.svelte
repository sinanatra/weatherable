<script>
    import { onMount } from "svelte";
    import Submit from "@components/Submit.svelte";
    import Viz from "@components/Viz.svelte";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    let data = [];
    let currentInput = { answer: "", radio: 0, range: 0, range1: 0 };

    onMount(async () => {
        data = await fetchData();
    });

    function handleChange(event) {
        currentInput = event.detail;
    }
</script>

<article>
    <section class="form">
        <Submit on:change={handleChange} />
    </section>
    <section class="data">
        <div>
            <Viz data={currentInput} />
        </div>
        <!-- {#if data.length > 0}
            <div>
                {#each data as d}
                    <Viz data={d} />
                {/each}
            </div>
        {/if} -->
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
