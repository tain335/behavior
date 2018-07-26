import * as Behavior from '../src/index';

var el1 = document.getElementById('el1');
let controller = new Behavior.AnimationController(0, 0, 1, 6000, Behavior.TickerProvider);
let tween = new Behavior.NumberTween(0, 600).animate(controller);
let progress: HTMLInputElement = document.getElementById('progress') as HTMLInputElement;
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
ctx.fillStyle="#FF0000";
ctx.fillRect(0,0,150,75);
progress.addEventListener('change', function() {
    //controller.value = Number(progress.value);
    controller.setProgress(Number(progress.value));
});
tween.addEventListener(()=> {
    //el1.style.transform = `translate3d(${tween.value}px, 0, 0)`;
    el1.style.opacity = `${tween.value / 600}`;
    //el1.style.transform = `translateX(${tween.value}px)`;
    //progress.value = String(controller.progress);
});
document.getElementById('forward').addEventListener('click', function() {
    controller.forward();
});
document.getElementById('stop').addEventListener('click', function() { 
    controller.stop();
});
document.getElementById('reverse').addEventListener('click', function() { 
    controller.reverse();
});



