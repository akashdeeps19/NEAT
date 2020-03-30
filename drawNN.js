let gen;
// const g1 = new Genome(3,1);
// g1.createInitialNodes();
// g1.createDenseGenome();
// const g2 = new Genome(3,1);
// g2.createInitialNodes();
// g2.createDenseGenome();

// g1.shiftLayer(1);
// g1.addNode(new Node(4,1));
// g2.shiftLayer(1);
// g2.addNode(new Node(4,1));
// g2.shiftLayer(2);
// g2.addNode(new Node(5,2));

// g1.links[1].enabled = false;
// g2.links[1].enabled = false;

// g1.addLink(neat.createLink(g1.nodes[1],g1.nodes[4],1,true));
// g1.addLink(neat.createLink(g1.nodes[4],g1.nodes[3],1,true));
// g2.addLink(neat.createLink(g2.nodes[1],g2.nodes[4],2,true));
// g2.addLink(neat.createLink(g2.nodes[4],g2.nodes[3],2,false));
// g2.addLink(neat.createLink(g2.nodes[4],g2.nodes[5],2,true));
// g2.addLink(neat.createLink(g2.nodes[5],g2.nodes[3],2,true));
// g1.addLink(neat.createLink(g1.nodes[0],g1.nodes[4],1,true));
// g2.addLink(neat.createLink(g2.nodes[2],g2.nodes[4],2,true));
// g2.addLink(neat.createLink(g2.nodes[0],g2.nodes[5],2,true));


const population = new Population(500);
population.initialPop();
let x = 0,y =0,scal = 1,h = 600,w = 1000;
function setup(){
    createCanvas(800,600);  

}

function draw(){
    background(50);
    drawGenome(gen,x,y,h,w,scal);
}

function keyPressed(){
    if(key === ' '){
        noLoop();
    }
    if(keyCode === 69){
        for(let i = 0;i < 1;i++)
            evolve();
    }

    return false;
}

// function dict_test(args){
//     let dict = {}
//     for(let i = 0;i < args[0];i++){
//         let r = floor(random(100));
//         dict[r] = 5;
//     }
//     for(let i = 0;i < args[1];i++){
//         for(let r in dict){
//             let b = dict[r];
//         }
//     }
// }

// function arr_test(args){
//     let arr = [];
//     for(let i = 0;i < args[0];i++){
//         let r = floor(random(100));
//         arr[i] = r;
//     }
//     for(let i = 0;i < args[1];i++){
//         for(let r of arr){
//             let b = r;
//         }
//     }
// }

// function measure(fn,args){
//     let start = millis();
//     if(args)fn(args);
//     else fn();
//     let end = millis();
//     return end - start;
// }

// function newClient(){
//     return new Client();
// }

function evolve(){
    for(let client of population.clients){
        client.update();
        // console.log(client.fitness_score)
    }
    population.evolve();
}

function drawGenome(g,tx=0,ty=0,h = 600,w = 1000,scal=1){
    if(!(g instanceof Genome))return;
    //Calculate x y
    push();
    translate(tx,ty);
    scale(scal)
    let x_off = 0;
    let y_off = 0;
    let x_space = w/g.layer_size;
    let node_xy = {};
    for(let i = 0;i < g.layer_size;i++){
        let y_space = h/(g.layers[i].length+1);
        for(let j = 0;j < g.layers[i].length;j++){
            let x = x_off+i*x_space;
            let y = y_off+(j+1)*y_space;
            node_xy[g.layers[i][j]] = [x,y];
        }
    }
    //draw links
    for(let link of g.links){
        if(link.enabled)
            stroke(0,255,0);
        else
            stroke(255,0,0);
        let x1 = node_xy[link.from.id][0], y1 = node_xy[link.from.id][1];
        let x2 = node_xy[link.to.id][0], y2 = node_xy[link.to.id][1];
        line(x1,y1,x2,y2);
        fill(255);
        textSize(12);
        textAlign(CENTER);
        text(link.weight.toFixed(2),(x1+x2)/2,(y1+y2)/2);
    }
    //draw nodes
    for(let i = 0;i < g.layer_size;i++){
        for(let j = 0;j < g.layers[i].length;j++){
            let x = node_xy[g.layers[i][j]][0];
            let y = node_xy[g.layers[i][j]][1];
            noStroke();
            fill(0,0,255);
            ellipse(x,y,40);
            fill(255);
            textSize(18);
            textAlign(CENTER);
            text(g.layers[i][j],x,y);
        }
    }
    pop(); 
}

function drawGenome2(g){
    if(g == undefined)return;
    //draw nodes
    let x_off = 50;
    let y_off = 100;
    let x_space = 100,y_space = 100;
    let node_xy = {};
    for(let i = 0;i < g.layers_size;i++){
        for(let j = 0;j < g.layers[i].length;j++){
            let x = x_off+i*x_space;
            let y = y_off+(j+i/2)*y_space;
            node_xy[g.layers[i][j]] = [x,y];
            noStroke();
            fill(0,0,255);
            ellipse(x,y,30);
            fill(255);
            textSize(12);
            textAlign(CENTER);
            text(g.layers[i][j],x,y);
        }
    }

    //draw links
    for(let innov in g.links){
        const link = g.links[innov];
        if(link.enabled)
            stroke(0,255,0,80);
        else
            stroke(255,0,0,80);
        let x1 = node_xy[link.from.id][0], y1 = node_xy[link.from.id][1];
        let x2 = node_xy[link.to.id][0], y2 = node_xy[link.to.id][1];
        line(x1,y1,x2,y2);
        fill(255,60);
        textSize(12);
        textAlign(CENTER);
        text(link.weight.toFixed(2),(x1+x2)/2,(y1+y2)/2);
    }
}