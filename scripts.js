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
    updateCSS: function() {
        watermelon.style.transform = `rotate(${this.angle}deg)`;
        // console.log(this.angle);
    },

    slight_rotation: function() {
        if(this.red_melon) goal_angle = this.red_melon_angle;
        else goal_angle = this.yellow_melon_angle;

        let timer = setInterval(() => {

            if (this.angle <= goal_angle - 40) clearInterval(timer);
            else {
                this.angle--;
                this.updateCSS();
            }
          }, 2);
    },
    
    slight_anti_rotation: function(){

        if(this.red_melon) init_angle = this.red_melon_angle;
        else init_angle = this.yellow_melon_angle;

        let timer = setInterval(() => {
            if (this.angle >= init_angle) clearInterval(timer);
            else {
                this.angle++;
                this.updateCSS();
            }
          }, 2);
        
        if (this.angle > 360) this.angle = this.angle - 360;
    },

    change_side: function() {
        if(this.red_melon) goal_angle = this.red_melon_angle;
        else goal_angle = this.yellow_melon_angle;
        
        if (!this.red_melon){
            let timer = setInterval(() => {
                if (this.angle <= this.red_melon_angle - 360) clearInterval(timer);
                else {
                    this.angle--;
                    this.updateCSS();
                }
              }, 2);
              this.red_melon = true;
        }
        else {
            let timer = setInterval(() => {
                if (this.angle <= this.yellow_melon_angle) clearInterval(timer);
                else {
                    this.angle--;
                    this.updateCSS();
                }
              }, 2);
              this.red_melon = false;
            }

        if (this.angle < 0) this.angle = this.angle + 360;
    }
}

watermelon.addEventListener('mouseover', function(){

    WatermelonButton.slight_rotation();
    console.log(WatermelonButton.angle);
}
);

// watermelon.addEventListener('mouseout', function(){
    
//         WatermelonButton.slight_anti_rotation();
//     })
    
watermelon.addEventListener('click', function(){
        
        WatermelonButton.change_side();
        console.log(WatermelonButton.angle);
})

document.addEventListener('DOMContentLoaded', toButton(twitter));
document.addEventListener('DOMContentLoaded', toButton(github));
document.addEventListener('DOMContentLoaded', toButton(linkedin));
document.addEventListener('DOMContentLoaded', toButton(scholar));
document.addEventListener('DOMContentLoaded', toButton(email));
document.addEventListener('DOMContentLoaded', toButton(map));
document.addEventListener('DOMContentLoaded', toButton(projects));
document.addEventListener('DOMContentLoaded', toButton(poetry));