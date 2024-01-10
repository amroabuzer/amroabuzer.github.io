const twitter = document.getElementById('twitter');
const github = document.getElementById('github');
const linkedin = document.getElementById('linkedin');
const scholar = document.getElementById('scholar');
const email = document.getElementById('email');
const map = document.getElementById('map');
const projects = document.getElementById('projects');
const poetry = document.getElementById('poetry');
const watermelon = document.getElementById('watermelon');

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

let WatermelonButton = {
    yellow_melon_angle: 135,
    red_melon_angle: 315,
    red_melon: true,
    angle: 315,
    rotations: 0,

    updateCSS: function() {
        watermelon.style.transform = `rotate(${this.angle}deg)`;
    },

    move_melon: function(goal, dir) {
        if(dir){
            let timer = setInterval(() => {
                if(this.angle <= this.goal_in_quad(goal)) clearInterval(timer);
                else{
                    this.angle--;
                    this.updateCSS();
                    console.log('angle:'+this.angle);
                    console.log('goal:'+this.goal_in_quad(goal));
                }
            }, 4);
        }
        else {
            let timer = setInterval(() => {
                if(this.angle >= this.goal_in_quad(goal)) clearInterval(timer);
                else{
                    this.angle++;
                    this.updateCSS();
                }
            }, 4);
        }
    },

    goal_in_quad: function(goal){
        return goal-360*this.rotations;
    },

    slight_rotation: function() {
        if(this.red_melon) this.move_melon(315-45, true);
        else this.move_melon(135-45, true);
    },

    slight_anti_rotation: function() {
        if(this.red_melon) this.move_melon(315, false);
        else this.move_melon(135, false);
    },

    change_side: function() {
        if(this.red_melon) {this.move_melon(135, true); this.red_melon = false;}
        else {this.move_melon(315, true); this.red_melon = true; this.rotations++}
    },
};

watermelon.addEventListener('mouseover', function(){

    WatermelonButton.slight_rotation();
});

watermelon.addEventListener('mouseout', function(){
    
    WatermelonButton.slight_anti_rotation();
});
    
watermelon.addEventListener('click', function(){
        
    WatermelonButton.change_side();
});

document.addEventListener('DOMContentLoaded', toButton(twitter));
document.addEventListener('DOMContentLoaded', toButton(github));
document.addEventListener('DOMContentLoaded', toButton(linkedin));
document.addEventListener('DOMContentLoaded', toButton(scholar));
document.addEventListener('DOMContentLoaded', toButton(email));
document.addEventListener('DOMContentLoaded', toButton(map));
document.addEventListener('DOMContentLoaded', toButton(projects));
document.addEventListener('DOMContentLoaded', toButton(poetry));