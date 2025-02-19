<script>
  import Viz from "@components/Viz.svelte";
  import { onMount } from "svelte";
  import * as d3 from "d3";

  let documents = [];
  let error = null;
  let data = [];
  let currentPage = 0;

  let hasRecentDocs = false;

  const checkIntervalMs = 3000; // Check every 15 seconds
  const recentDuration = 20; // N minutes

  const pages = [
    "https://zku-experiments.vercel.app/page_1",
    "https://zku-experiments.vercel.app/page_3",
    // "https://zku-experiments.vercel.app/page_4",
  ];

  // const pages = [
  //     "video/zku_1.mov",
  //     "video/zku_4.mov",
  //     "video/zku_3.mov",
  //     "video/zku_7.mov",
  //     "video/zku_5.mov",
  //     "video/zku_8.mov",
  //     "video/zku_2.mov",
  //     "video/zku_6.mov",
  // ];

  // const pages = [
  //     "video/compressed_zku_rotate_1.mov",
  //     "video/compressed_zku_rotate_2.mov",
  //     "video/compressed_zku_rotate_3.mov",
  //     "video/compressed_zku_rotate_4.mov",
  // ];

  async function fetchNonTattooedDocuments() {
    try {
      const response = await fetch("/api/getNonTattooed");
      if (response.ok) {
        const newDocuments = await response.json();
        if (JSON.stringify(newDocuments) !== JSON.stringify(documents)) {
          documents = newDocuments;
        }
      } else {
        error = "Failed to load non-tattooed documents.";
      }
    } catch (err) {
      error = err.message;
    }
    checkRecentDocuments();
  }

  async function fetchRecentData() {
    try {
      const response = await fetch(
        "https://zku-middleware.vercel.app/api/recent"
      );

      if (!response.ok) {
        throw new Error("API response was not ok");
      }
      const json = await response.json();

      if (json && json[0]?.batt1 == "OFF") {
        try {
          const csvData = await d3.csv(
            "/data/zku_weatherstation_main_hour.csv"
          );
          return csvData;
        } catch (csvError) {
          console.error("Failed to load CSV file as fallback:", csvError);
          return null;
        }
      } else {
        return json;
      }
    } catch (error) {
      console.error("API request failed, falling back to CSV:", error);
      try {
        const csvData = await d3.csv("/data/zku_weatherstation_main_hour.csv");
        return csvData;
      } catch (csvError) {
        console.error("Failed to load CSV file as fallback:", csvError);
        return null;
      }
    }
  }

  // function startPolling() {
  //     fetchNonTattooedDocuments();
  //     setInterval(fetchNonTattooedDocuments, 10000);
  // }

  function calculateAverage(item) {
    const ranges = [
      item.temp,
      item.uv,
      item.wrain_piezo,
      item.humidity,
      item.windspeed,
    ];
    return ranges.reduce((a, b) => a + b, 0) / ranges.length;
  }

  function prepareGuessedData(document) {
    const seed = 42;
    const seededRandom = (seed) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const average = calculateAverage(document);
    const seededAverage = seededRandom(seed) * average;

    return {
      temp: document?.range,
      uv: document?.range1,
      wrain_piezo: document?.range2,
      humidity: document?.range3,
      windspeed: document?.range4,

      len: seededAverage || 0.5,

      curveSmooth: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE"].includes(
        document?.radio1
      ),
      outline: ["S", "SSW", "SW", "WSW", "W", "NW", "WNW", "NNW"].includes(
        document?.radio1
      ),
      mirror: document?.radio == "Yes",

      lineThickness: document?.lineThickness || 1,
      fillThickness: document?.fillThickness || 0.1,
    };
  }

  function getTimestampFromObjectId(objectId) {
    const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
    return new Date(timestamp);
  }

  function getWaitingTime(_id) {
    const now = new Date();
    const createdTime = getTimestampFromObjectId(_id);
    return (now - createdTime) / (1000 * 60);
  }

  function checkRecentDocuments() {
    hasRecentDocs = documents.some(
      (doc) => getWaitingTime(doc._id) <= recentDuration
    );
  }

  function rotatePage() {
    currentPage = (currentPage + 1) % pages.length;
  }

  onMount(async () => {
    data = await fetchRecentData();
    setInterval(rotatePage, 120000);

    fetchNonTattooedDocuments();
    setInterval(fetchNonTattooedDocuments, checkIntervalMs);
  });
</script>

{#if documents.length > 0}
  {#if hasRecentDocs}
    <header>
      <h1>Next tattoos</h1>
      <p>3 minutes waiting time on average...</p>
    </header>
    <article>
      {#if error}
        <p style="color: red;">{error}</p>
      {/if}

      {#each documents as doc}
        {#if data.length > 0}
          {#if getWaitingTime(doc._id) <= recentDuration}
            <section class="data">
              <h2>{doc.dailyId}</h2>
              <div>
                <Viz
                  {data}
                  guessedData={prepareGuessedData(doc)}
                  invert={true}
                />
              </div>
            </section>
          {/if}
        {/if}
      {/each}
    </article>
  {:else}
    <div class="container">
      <iframe src={pages[currentPage]} frameborder="0"></iframe>
      <!-- <video autoplay mute loop src={pages[currentPage]}></video> -->
      <div class="next">
        <h1>
          Fill out the questionnaire to get your personal ZK/U weather tattoo
        </h1>
      </div>
    </div>
  {/if}
{:else}
  <div class="container">
    <iframe src={pages[currentPage]} frameborder="0"></iframe>
    <!-- <video autoplay mute loop src={pages[currentPage]}></video> -->
    <div class="next">
      <h1>
        Fill out the questionnaire to get your personal ZK/U weather tattoo
      </h1>
    </div>
  </div>
{/if}

<style>
  .container {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  iframe,
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    object-fit: cover;
  }

  .next {
    position: absolute;
    top: 40%;
    left: 0%;

    padding: 10vw;
    color: yellow;
    text-align: center;
    z-index: 10;
  }

  .next h1 {
    font-size: 8vw;
    line-height: 8vw;
  }

  article {
    /* padding: 10px; */
  }

  header {
    background-color: white;
    color: black;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px dashed white;
    padding: 5px;
    font-size: 42px;
  }

  header p {
    color: gray;
    margin: 0;
    padding: 0;
  }

  h1 {
    text-align: center;
    font-weight: 400;
    font-size: 1em;
    margin: 0px;
    padding: 0;
  }

  section {
    position: relative;
    display: flex;
    justify-content: center;
    transition: opacity 0.5s ease-in-out;
  }

  section:first-of-type h2 {
    /* color: rgb(128, 255, 0); */
  }

  h2 {
    font-family: Arial, Helvetica, sans-serif;
    /* letter-spacing: -15px; */
    position: absolute;
    top: 0;
    margin: 0 auto;
    font-size: 13rem;
    color: yellow;
    font-weight: 800;
    -webkit-text-stroke: 3px black;
  }
</style>
