<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let documents = [];
    let error = null;
    let data = [];

    async function fetchNonTattooedDocuments() {
        try {
            const response = await fetch("/api/getNonTattooed");
            if (response.ok) {
                documents = await response.json();
            } else {
                error = "Failed to load non-tattooed documents.";
            }
        } catch (err) {
            error = err.message;
        }
    }

    fetchNonTattooedDocuments();

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        let datum = json;
        return datum;
    }

    onMount(async () => {
        data = await fetchRecentData();
    });
</script>

<article>
    <h1>Next</h1>

    {#if error}
        <p style="color: red;">{error}</p>
    {/if}

    {#if documents.length > 0}
        <ul>
            {#each documents as doc}
                <li>
                    <h2>ID: {doc.dailyId}</h2>
                    <section class="data">
                        {#if data.length > 0}
                            <div>
                                <Viz {data} guessedData={doc} />
                            </div>
                        {/if}
                    </section>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No non-tattooed documents found.</p>
    {/if}
</article>

<style>
    article {
        padding: 20px;
        color: white;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    h1 {
        font-size: 2em;
        margin-bottom: 20px;
    }

    h2 {
        font-size: 1.5em;
        margin-bottom: 10px;
    }

    p {
        margin: 5px 0;
    }
</style>
