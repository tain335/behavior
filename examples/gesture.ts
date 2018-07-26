import * as Behavior from '../src/index';
let $touchEl = document.getElementById('touched');
let recognizer = new Behavior.TapGestureRecognizer({
    onTapDown: ()=> {
        //console.log('tap down');
        $touchEl.innerText = $touchEl.innerText + '\n' + 'tap down';
    },
    onTap: ()=> {
        $touchEl.innerText = $touchEl.innerText + '\n' + 'tap';
    },
    onTapUp: ()=> {
        $touchEl.innerText = $touchEl.innerText + '\n' + 'tap up';
    }
});

let detector = new Behavior.GestureDetector($touchEl, [recognizer]);