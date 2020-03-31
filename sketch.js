// <==== SKETCH TEMPLATE ====> //

let population;
let population_size = 500;
let input_size = 2;
let output_size = 1;

// let bestClient;
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
}

function keyPressed(){
    if(key === ' '){
        noLoop();
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
