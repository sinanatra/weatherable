<script>
    import { onMount } from "svelte";
    import Submit from "@components/Submit.svelte";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    let data = [];
    let currentInput = { answer: "", radio: 0, range: 0, range1: 0 };
    let language = "EN";

    onMount(async () => {
        data = await fetchData();
        foldsContent = Array.from(
            document.getElementsByClassName("fold-content"),
        );
        tick();
    });

    function handleChange(event) {
        currentInput = event.detail;
    }

    let centerContent;
    let centerFold;

    let foldsContent = [];

    let targetScroll = 0;
    let currentScroll = 0;

    const tick = () => {
        let overflowHeight =
            centerContent.clientHeight - centerFold.clientHeight;

        document.body.style.height = overflowHeight + window.innerHeight + "px";

        targetScroll = -(
            document.documentElement.scrollTop || document.body.scrollTop
        );
        currentScroll += (targetScroll - currentScroll) * 0.1;
        foldsContent.forEach((content) => {
            content.style.transform = `translateY(${currentScroll}px)`;
        });
        requestAnimationFrame(tick);
    };

    function switchLanguage(lang) {
        language = lang;
    }
</script>

<article>
    <section class="form">
        <div class="language-switcher">
            <button
                on:click={() => switchLanguage("EN")}
                class:active={language === "EN"}>EN</button
            >
            <button
                on:click={() => switchLanguage("DE")}
                class:active={language === "DE"}>DE</button
            >
        </div>
        <div class="screen" id="fold-effect">
            <div class="wrapper-3d">
                <div class="fold fold-top">
                    <div class="fold-align">
                        <div class="fold-content">
                            <Submit {currentInput} {language} />
                        </div>
                    </div>
                </div>
                <div class="fold fold-center" bind:this={centerFold}>
                    <div class="fold-align">
                        <div
                            class="fold-content stick"
                            bind:this={centerContent}
                        >
                            <Submit on:change={handleChange} {language} />
                        </div>
                    </div>
                </div>
                <div class="fold fold-bottom">
                    <div class="fold-align">
                        <div class="fold-content">
                            <Submit {currentInput} {language} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</article>

<style>
    article {
        height: 100%;
    }

    .screen {
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
    }

    .wrapper-3d {
        position: relative;
        perspective: 10vw;
        transform-style: preserve-3d;
    }

    .fold {
        overflow: hidden;
        width: 70vw;
        height: 92vh;
    }

    .fold-top {
        position: absolute;
        transform-origin: bottom center;
        left: 0;
        right: 0;
        bottom: 100%;
    }

    .fold-bottom {
        position: absolute;
        transform-origin: top center;
        right: 0;
        left: 0;
        top: 100%;
    }

    .fold-align {
        width: 100%;
        height: 100%;
    }

    .fold-bottom .fold-align {
        transform: translateY(-100%);
    }

    .fold-top .fold-align {
        transform: translateY(100%);
    }

    .fold-bottom {
        transform-origin: top center;
        transform: rotateX(110deg);
    }

    .fold-top {
        transform-origin: bottom center;
        transform: rotateX(-110deg);
    }

    .language-switcher {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }

    .language-switcher button {
        padding: 0.5rem 1rem;
        margin: 0 0.5rem;
        cursor: pointer;
        background: none;
        border: 1px solid #fff;
        color: #fff;
    }

    .language-switcher button.active {
        background-color: yellow;
        color: black;
    }
</style>
