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


const population = new Population(100);
population.initialPop();

function setup(){
    createCanvas(800,600);   
}

function draw(){
    background(50);
    drawGenome(gen);
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



function newClient(){
    return new Client();
}

function evolve(){
    for(let client of population.clients){
        client.update();
        // console.log(client.fitness_score)
    }
    population.evolve();
}

function drawGenome(g){
    if(g == undefined)return;
    //draw nodes
    let x_off = 50;
    let y_off = 100;
    let x_space = 200,y_space = 100;
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
        let link = g.links[innov];
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
}