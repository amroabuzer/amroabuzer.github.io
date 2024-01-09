const twitter = document.getElementById('twitter');
const github = document.getElementById('github');
const linkedin = document.getElementById('linkedin');
const scholar = document.getElementById('scholar');
const email = document.getElementById('email');
const map = document.getElementById('map');
const projects = document.getElementById('projects');
const poetry = document.getElementById('poetry');

function toButton(element){
    element.addEventListener('mouseover', function(){

        const src_string = element.src.split('/');
        // console.log(src_string);
        const new_string = src_string.slice(0, -2).concat(['solid']).concat(src_string.slice(-1));
        element.src = new_string.join('/');

        }
    );

    element.addEventListener('mouseout', function(){

        const src_string = element.src.split('/');
        // console.log(src_string);
        const new_string = src_string.slice(0, -2).concat(['opaque']).concat(src_string.slice(-1));
        element.src = new_string.join('/');

        }
    );
}

document.addEventListener('DOMContentLoaded', toButton(twitter));
document.addEventListener('DOMContentLoaded', toButton(github));
document.addEventListener('DOMContentLoaded', toButton(linkedin));
document.addEventListener('DOMContentLoaded', toButton(scholar));
document.addEventListener('DOMContentLoaded', toButton(email));
document.addEventListener('DOMContentLoaded', toButton(map));
document.addEventListener('DOMContentLoaded', toButton(projects));
document.addEventListener('DOMContentLoaded', toButton(poetry));