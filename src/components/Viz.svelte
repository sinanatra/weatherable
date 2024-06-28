<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    export let data;

    let width, height;
    let angle;
    let y;
    let weather = [];
    // let nodes = [];
    let maxValues = [];
    let nr = 0;
    let params = [];

    onMount(async () => {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/weather",
        );
        weather = await response.json();
        params = Object.keys(weather[0]).filter(
            (key) => typeof weather[0][key] === "number",
        );
        maxValues = params.map((param) => getMaxValue(param));
    });

    function getMaxValue(param) {
        return Math.max(...weather.map((d) => d[param]));
    }

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            // s.colorMode(s.HSL);
            s.strokeCap(s.SQUARE);
        };

        s.draw = () => {
            if (!weather.length) return;
            const record = weather[0];
            let test = [params[nr]];

            let framecheck = s.frameCount % 60;
            if (framecheck == 0) {
                nr = Math.floor(Math.random() * params.length) % height;
            }

            s.background(255);

            s.fill(0);
            s.noStroke();
            let text = data.answer + " " + record.time.split("T")[0];
            s.textSize(24);
            s.textAlign("center");
            s.text(text, width / 2, 20);
            s.noFill();

            s.strokeWeight(1);

            let normalizedValue = s.map(
                record[test], //param
                0,
                maxValues[nr],
                10,
                width,
            );

            const freq = s.map(data.range, 0, 1, 0, 10) + normalizedValue;
            const phi = s.map(data.range1, 0, 1, 0, 50) + normalizedValue;
            const modFreq = s.map(data.radio, 1, 3, 10, 200) + normalizedValue;

            s.translate(0, height / 2);

            s.stroke("red");
            s.beginShape();
            for (var i = 0; i <= width; i++) {
                angle = s.map(i, 0, width, 0, s.TAU);
                y = s.sin(angle * freq + s.radians(phi));
                y *= s.height / 2.5;
                s.vertex(i, y);
            }
            s.endShape();

            s.stroke("blue");
            s.beginShape();
            for (var i = 0; i <= width; i++) {
                angle = s.map(i, 0, width, 0, s.TAU);
                y = s.cos(angle * modFreq);
                y *= s.height / 2.5;
                s.vertex(i, y);
            }
            s.endShape();

            s.stroke(0);
            s.strokeWeight(2);

            s.beginShape();
            for (var i = 0; i <= width; i++) {
                angle = s.map(i, 0, width, 0, s.TAU);
                var info = s.sin(angle * freq + s.radians(phi));
                var carrier = s.cos(angle * modFreq);
                y = info * carrier;
                y *= s.height / 2.5;
                s.vertex(i, y);
            }
            s.endShape();

        };
    };
</script>

<article bind:clientWidth={width} bind:clientHeight={height}>
    <P5 {sketch} />
</article>

<style>
    article {
        display: flex;
        height: 100%;
    }
</style>
