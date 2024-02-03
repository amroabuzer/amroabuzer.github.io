const twitter = document.getElementById('twitter');
const github = document.getElementById('github');
const linkedin = document.getElementById('linkedin');
const scholar = document.getElementById('scholar');
const email = document.getElementById('email');
const map = document.getElementById('map');
const projects = document.getElementById('projects');
const blog = document.getElementById('blog');
const watermelon = document.getElementById('watermelon');
const title = document.getElementById('title');

const map_txt = document.getElementById('map_txt');
const project_txt = document.getElementById('project_txt');
const blog_txt = document.getElementById('blog_txt');

const list_of_hellos = ["Hallo", "Hello"];

// document.documentElement.setAttribute('data-theme', 'light');
let mySessionData = sessionStorage;

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

function toButtonAndText(element, element_txt){
    element.addEventListener('mouseover', function(){

        const src_string = element.src.split('/');
        // console.log(src_string);
        const new_string = src_string.slice(0, -2).concat(['solid']).concat(src_string.slice(-1));
        element.src = new_string.join('/');

        element_txt.style.color = '#ffffff';
        }
    );

    element.addEventListener('mouseout', function(){

        const src_string = element.src.split('/');
        // console.log(src_string);
        const new_string = src_string.slice(0, -2).concat(['opaque']).concat(src_string.slice(-1));
        element.src = new_string.join('/');
        
        element_txt.style.color = '#ffffff83';
        }
    );
}

function keep_preferred_theme(){
    console.log(mySessionData.getItem("data-theme"));
    console.log("test");
    if(mySessionData.getItem("data-theme") == "dark" && !WatermelonButton.red_melon){
        WatermelonButton.angle = WatermelonButton.red_melon_angle;
        WatermelonButton.red_melon = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        WatermelonButton.updateCSS();
    }
    else {
        WatermelonButton.angle = WatermelonButton.yellow_melon_angle;
        WatermelonButton.red_melon = false;
        document.documentElement.setAttribute('data-theme', 'light');
        WatermelonButton.updateCSS();
    }
} 

let intervaltime = 1;

let WatermelonButton = {
    yellow_melon_angle: 140,
    red_melon_angle: 320,
    red_melon: false,
    angle: 140,
    rotations: 0,
    isMouseOver: false,
    isMouseClick: false,

    updateCSS: function() {
        watermelon.style.transform = `rotate(${this.angle}deg)`;
    },

    buttonlogic: function(){
        if(this.isMouseOver===true && this.isMouseClick===false) return false;
        else if(this.isMouseOver===false && this.isMouseClick===false) return true;
        else if(this.isMouseOver===true && this.isMouseClick===true) return false;
        else if(this.isMouseOver===false && this.isMouseClick===true) return false;
    },

    move_melon: function(goal, dir) {
        // console.log("stop_condition:" + this.buttonlogic());
        if(dir){
            let timer = setInterval(() => {
                if(this.angle <= this.goal_in_quad(goal) || this.buttonlogic()) clearInterval(timer);
                // both mouse over and mouse click go in the same direction
                else{
                    this.angle--;
                    this.updateCSS();
                    // console.log('angle:'+this.angle);
                    // console.log('goal:'+this.goal_in_quad(goal));
                }
            }, intervaltime);
        }
        else {
            let timer = setInterval(() => {
                if(this.angle >= this.goal_in_quad(goal) || (this.isMouseOver)) clearInterval(timer);
                else{
                    this.angle++;
                    this.updateCSS();
                }
            }, intervaltime);
        }
    },

    goal_in_quad: function(goal){
        return goal-360*this.rotations;
    },

    slight_rotation: function() {
        if(this.red_melon) this.move_melon(320-45, true);
        else this.move_melon(140-45, true);
    },

    slight_anti_rotation: function() {
        if(this.red_melon) this.move_melon(320, false);
        else this.move_melon(140, false);
    },

    change_side: function() {
        if(this.red_melon) {
            this.move_melon(140, true); 
            this.red_melon = false; 
            document.documentElement.setAttribute('data-theme', 'light');
            mySessionData.setItem("data-theme", "light");
        }
        else {
            this.move_melon(320, true); 
            this.red_melon = true; 
            this.rotations++; 
            document.documentElement.setAttribute('data-theme', 'dark');
            mySessionData.setItem("data-theme", "dark");
        }
    },
};

if(window.innerWidth > 700){
    watermelon.addEventListener('mouseover', function(){
        WatermelonButton.isMouseOver = true;
        WatermelonButton.slight_rotation();
    });
    
    watermelon.addEventListener('mouseout', function(){
        WatermelonButton.isMouseOver = false;
        WatermelonButton.slight_anti_rotation();
    });

    document.addEventListener('DOMContentLoaded', toButton(twitter));
    document.addEventListener('DOMContentLoaded', toButton(github));
    document.addEventListener('DOMContentLoaded', toButton(linkedin));
    document.addEventListener('DOMContentLoaded', toButton(scholar));
    document.addEventListener('DOMContentLoaded', toButton(email));

    document.addEventListener('DOMContentLoaded', toButtonAndText(map, map_txt));
    document.addEventListener('DOMContentLoaded', toButtonAndText(projects, project_txt));
    document.addEventListener('DOMContentLoaded', toButtonAndText(blog, blog_txt));
}
watermelon.addEventListener('click', function(){
    if(!WatermelonButton.isMouseClick){
        WatermelonButton.isMouseClick = true;
        WatermelonButton.change_side();
        setTimeout(() => {
            WatermelonButton.isMouseClick = false;
        }, 1000);
    }
});

let counter = 0;
setInterval(function(){
        title.textContent = list_of_hellos[counter % list_of_hellos.length];
        counter++;
}, 5000)

document.addEventListener('DOMContentLoaded', keep_preferred_theme());