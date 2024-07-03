<script>
    import { onMount } from "svelte";

    let canvas;
    let text;
    let W, H, ctx, ttx, raf;
    let resolution = 1;
    let fps = 0;
    let pixels = [];
    let pushers = [];
    let word = "Up*Dates /On Weather";

    class Pusher {
        constructor(x, y) {
            this.x = ~~x;
            this.y = ~~y;
            this.r = 0;
            this.d = this.r / 2;
            // this.xVel = ~~(Math.random() * 20);
            this.xVel = 0; // Horizontal velocity set to 0
            this.yVel = ~~(Math.random() * 10);
        }

        move() {
            const d = this.d;
            const xVel = this.xVel;
            const yVel = this.yVel;

            // if (this.x + d + xVel >= W || this.x - d + xVel <= 0) {
            //     this.xVel = -xVel;
            //     this.x += -xVel;
            // } else {
            //     this.x += xVel;
            // }
            if (this.y + d + yVel >= H || this.y - d + yVel <= 0) {
                this.yVel = -yVel;
                this.y += -yVel;
            } else {
                this.y += yVel;
            }
        }
    }

    function PY(x, y) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2), 2);
    }

    class Pixel {
        constructor(x, y, r, g, b) {
            this.homeX = x;
            this.homeY = y;
            this.x = x;
            this.y = y;
            this.a = 0;
        }

        arrive() {
            const hx = this.homeX;
            const hy = this.homeY;
            const x = this.x;
            const y = this.y;
            let hvx = 0,
                hvy = 0;
            if (x !== hx || y !== hy) {
                const desiredX = hx - x;
                const desiredY = hy - y;
                const d = PY(desiredX, desiredY);
                const homeForce = d * 0.03;
                const homeAngle = Math.atan2(desiredY, desiredX);
                hvx = homeForce * Math.cos(homeAngle);
                hvy = homeForce * Math.sin(homeAngle);
            }

            let pusherD2 = 0,
                pusherF = 0,
                pusherAngle = 0,
                pvx = 0,
                pvy = 0,
                pusher = 0,
                pusherX = 0,
                pusherY = 0;
            for (let i = pushers.length - 1; i >= 0; i--) {
                pusher = pushers[i];
                pusherX = x - pusher.x;
                pusherY = y - pusher.y;
                if (
                    pusherX > 100 ||
                    pusherY > 100 ||
                    pusherY < -100 ||
                    pusherX < -100
                )
                    continue;
                pusherD2 = Math.pow(PY(pusherX, pusherY), 2);
                pusherF = Math.min(8000 / pusherD2, 5000);
                pusherAngle = Math.atan2(pusherY, pusherX);
                pvx += pusherF * Math.cos(pusherAngle);
                pvy += pusherF * Math.sin(pusherAngle);
            }

            const vx = (hvx + pvx) * 0.9;
            const vy = (hvy + pvy) * 0.9;
            this.x = x + 1 + vx > hx && x + vx - 1 < hx ? hx : x + vx;
            this.y = y + 1 + vy > hy && y + vy - 1 < hy ? hy : y + vy;
        }
    }

    function drawPixels() {
        let dpID = ctx.createImageData(W, H);
        let dpImageData = dpID.data;
        for (let dpIndex = pixels.length - 1; dpIndex >= 0; dpIndex--) {
            let dpCenterX = ~~pixels[dpIndex].x;
            let dpCenterY = ~~pixels[dpIndex].y;
            let dpColor = pixels[dpIndex].a;
            if (resolution === 1) {
                let dpImageDataIndex = (dpCenterY * W + dpCenterX) * 4;
                dpImageData[dpImageDataIndex] = 255; // R
                dpImageData[dpImageDataIndex + 1] = 255; // G
                dpImageData[dpImageDataIndex + 2] = 0; // B
                dpImageData[dpImageDataIndex + 3] = dpColor;
                continue;
            }
            for (
                let dpY = dpCenterY - ~~(resolution / 2),
                    dpEndY = dpCenterY + Math.ceil(resolution / 2);
                dpY <= dpEndY && dpY >= 0 && dpY < H;
                dpY++
            )
                for (
                    let dpX = dpCenterX - ~~(resolution / 2),
                        dpEndX = dpCenterX + Math.ceil(resolution / 2);
                    dpX < dpEndX && dpX >= 0 && dpX < W;
                    dpX++
                ) {
                    let dpImageDataIndex = (dpY * W + dpX) * 4;
                    dpImageData[dpImageDataIndex] = 255; // R
                    dpImageData[dpImageDataIndex + 1] = 255; // G
                    dpImageData[dpImageDataIndex + 2] = 0; // B
                    dpImageData[dpImageDataIndex + 3] = dpColor;
                }
        }
        for (let dpIndex = pushers.length - 1; dpIndex >= 0; dpIndex--) {
            let dpCenterX = Math.floor(pushers[dpIndex].x);
            let dpCenterY = Math.floor(pushers[dpIndex].y);
            let dpDiameter = pushers[dpIndex].r / 2;
            if (dpCenterX > 0 && dpCenterY > 0)
                for (
                    let dpY = dpCenterY - Math.floor(dpDiameter),
                        dpEndY = dpCenterY + Math.ceil(dpDiameter);
                    dpY <= dpEndY && dpY >= 0 && dpY < H;
                    dpY++
                )
                    for (
                        let dpX = dpCenterX - Math.floor(dpDiameter),
                            dpEndX = dpCenterX + Math.ceil(dpDiameter);
                        dpX < dpEndX && dpX >= 0 && dpX < W;
                        dpX++
                    ) {
                        let dpImageDataIndex = (dpY * W + dpX) * 4;
                        dpImageData[dpImageDataIndex + 3] = 255;
                    }
        }
        ctx.putImageData(dpID, 0, 0);
    }

    function init() {
        if (raf) {
            cancelAnimationFrame(raf);
        }
        ttx.clearRect(0, 0, W, H);
        ctx.clearRect(0, 0, W, H);
        let fontSize = window.innerWidth / 6;
        ttx.font = "200 " + fontSize + "px 'Arial Narrow'";
        ttx.textAlign = "center";
        ttx.textBaseline = "middle";

        const lines = word.split("/");
        lines.forEach((line, index) => {
            ttx.fillText(line, W / 2, H / 2.5 + index * 220); // line height
        });

        const imageData = ttx.getImageData(0, 0, W, H).data;
        let x, y, imageDataIndex, pixelIndex, gray;
        pixelIndex = 0;
        pixels = [];
        pushers = [];
        for (x = W - resolution - 1; x >= 0; x -= resolution) {
            for (y = H - 1 - resolution; y >= 0; y -= resolution) {
                imageDataIndex = (y * W + x) * 4;
                gray = imageData[imageDataIndex + 3];
                if (gray > 0) {
                    if (pixelIndex >= pixels.length) {
                        pixels[pixelIndex] = new Pixel(x, y);
                        pixels[pixelIndex].a = gray;
                    } else {
                        pixels[pixelIndex].homeX = x;
                        pixels[pixelIndex].homeY = y;
                        pixels[pixelIndex].a = gray;
                    }
                    pixelIndex++;
                }
            }
        }
        // Initialize with N pushers
        for (let i = 0; i < 10; i++) {
            pushers.push(new Pusher(Math.random() * W, Math.random() * H));
        }
        timer();
    }

    function timer() {
        calcfps.onFrame();
        let i;
        for (i = pushers.length - 1; i >= 0; i--) pushers[i].move();
        for (i = pixels.length - 1; i >= 0; i--) {
            pixels[i].arrive();
        }
        drawPixels();
        raf = requestAnimationFrame(timer);
    }

    const fpsFactory = function (onSecond) {
        let lastSec = Date.now();
        let frames = 0;
        let fps = 0;
        return {
            onFrame: () => {
                const elapsed = (Date.now() - lastSec) / 1000;
                if (elapsed > 1) {
                    lastSec = Date.now();
                    fps = frames;
                    frames = 0;
                    onSecond(fps);
                } else {
                    frames += 1;
                }
            },
            getFPS: () => {
                return fps;
            },
        };
    };

    let calcfps = fpsFactory((f) => {
        fps = f;
    });

    onMount(() => {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        text.width = document.body.clientWidth;
        text.height = document.body.clientHeight;
        W = document.body.clientWidth;
        H = document.body.clientHeight;
        ctx = canvas.getContext("2d");
        ttx = text.getContext("2d");
        init();

        window.addEventListener(
            "resize",
            debounce(() => {
                canvas.width = document.body.clientWidth;
                canvas.height = document.body.clientHeight;
                text.width = document.body.clientWidth;
                text.height = document.body.clientHeight;
                W = document.body.clientWidth;
                H = document.body.clientHeight;
                init();
            }, 500),
        );

        input.addEventListener("input", debounceChange);
    });

    let debounceTimeout;
    function debounceChange(e) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            word = e.target.value;
            if (raf) {
                cancelAnimationFrame(raf);
            }
            drawWord();
            init();
        }, 200);
    }

    function drawWord() {
        ctx.clearRect(0, 0, W, H);
        ctx.font = window.innerWidth / 10 + "px arial"; // fontsize
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lines = word.split("/");
        lines.forEach((line, index) => {
            ctx.fillText(line, W / 2, H / 2.5 + index * 220); // line height
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
</script>

<canvas id="t" bind:this={text}></canvas>
<canvas id="c" bind:this={canvas}></canvas>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :global(body),
    :global(html) {
        height: 100%;
        overflow: hidden;
        background: transparent;
        /* mix-blend-mode: luminosity; */
    }

    #c,
    #t {
        position: absolute;
        top: 0;
        left: 0;
    }

    #t {
        opacity: 0;
    }
</style>
