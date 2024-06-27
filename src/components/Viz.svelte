<script>
    import P5 from "p5-svelte";
    export let data;
    let width, height;

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            // s.colorMode(s.HSL);
            s.background(0);
        };

        s.draw = () => {
            s.background(0);
            s.noFill();
            s.stroke("yellow");
            s.ellipse(s.mouseX, s.mouseY, data.radio, data.radio);
            s.ellipse(s.mouseX, s.mouseY, data.range1, data.range1);
            s.ellipse(s.mouseX, s.mouseY, data.range, data.range);
        };
    };
</script>

<div>
    <span>{data.answer}</span>
    {#if data.radio}- <span>{data.radio}</span>{/if}
    {#if data.range}- <span>{data.range}</span>{/if}
    {#if data.range1}- <span>{data.range1}</span>{/if}
</div>

<article bind:clientWidth={width} bind:clientHeight={height}>
    <P5 {sketch} />
</article>

<style>
    article {
        display: flex;
        height: 100%;
    }
</style>
