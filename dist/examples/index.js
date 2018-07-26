"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Behavior = require("../src/index");
var el1 = document.getElementById('el1');
let controller = new Behavior.AnimationController(0, 0, 1, 6000, Behavior.TickerProvider);
let tween = new Behavior.NumberTween(0, 600).animate(controller);
let progress = document.getElementById('progress');
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
ctx.fillStyle = "#FF0000";
ctx.fillRect(0, 0, 150, 75);
progress.addEventListener('change', function () {
    controller.setProgress(Number(progress.value));
});
tween.addEventListener(() => {
    el1.style.opacity = `${tween.value / 600}`;
});
document.getElementById('forward').addEventListener('click', function () {
    controller.forward();
});
document.getElementById('stop').addEventListener('click', function () {
    controller.stop();
});
document.getElementById('reverse').addEventListener('click', function () {
    controller.reverse();
});
//# sourceMappingURL=index.js.map