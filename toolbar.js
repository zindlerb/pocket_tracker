import { h, render } from 'preact';

console.log(document.getElementById("root"))

render((
    <div id="foo">
        <span>Hello, world!</span>
        <button onClick={ e => alert("hi!") }>Click Me</button>
    </div>
), document.getElementById("root"));
