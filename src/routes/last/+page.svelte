<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    let data = [];
    let guessed = [];

    // $: console.log(guessed[0], guessed[0]?.range);

    $: guessedData = {
        temp: guessed[0]?.range,
        baromabs: guessed[0]?.range1,
        feelslike: guessed[0]?.range2,
        windspeed: guessed[0]?.range3,
        humidity: guessed[0]?.range4,
        curveSmooth: false,
        outline: false,
    };
    // let guessedData = {
    //     temp: 0.4,
    //     baromabs: 0.5,
    //     feelslike: 0.4,
    //     windspeed: 0.5,
    //     humidity: 0.9,
    //     curveSmooth: false,
    //     outline: false,
    // };

    onMount(async () => {
        guessed = await fetchData();

        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        data = await response.json();
        context = canvas.getContext("2d");
    });
</script>

<article>
    <section class="data">
        {#if data.length > 0 && guessed.length > 0}
            <div>
                <Viz {data} {guessedData} />
            </div>
        {/if}
    </section>
</article>

<style>
    article {
        margin-top: 5px;
        padding: 10px;
    }
</style>
