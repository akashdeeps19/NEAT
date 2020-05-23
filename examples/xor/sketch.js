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
let population;
let population_size = 100;
let input_size = 2;
let output_size = 1;

let x = -100,y = 0,h = 600,w = 1000,scal = 1;

let bestClient;
// function preload(){
//     bestClient = loadJSON('best_client.json');
// }

function setup(){
    createCanvas(800,600); 
    let clients = []
    for(let i = 0;i < population_size;i++){
        clients[i] = new Client()
    }
    population = new Population(input_size,output_size,clients.slice());

    // bestClient = new Client(population.deserialize(bestClient));
}

function draw(){
    background(50);
    if(bestClient)
        drawGenome(bestClient.genome,x,y,h,w,scal);
    else if(population.bestClient)
        drawGenome(population.bestClient.genome,x,y,h,w,scal);
}
 
function keyPressed(){
    if(keyCode === 69){
        for(let i = 0;i < 50;i++)
            evolve();
    }
    if(key == 'S'){
        population.saveClient(population.bestClient.genome);
    }
    return false;
}

function evolve(){
    for(let client of population.clients){
        client.update();
    }
    population.evolve();
}