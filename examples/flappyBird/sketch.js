let totalPopulation = 500;
// All active birds (not yet collided with pipe)
let activeBirds = [];
// All birds for any given population
let allBirds = [];
// Pipes
let pipes = [];
// A frame counter to determine when to add a pipe
let counter = 0;
let dead = false;

let population;

// Interface elements
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan, statsSpan,tipSpan;

// All time high score
let highScore = 0;

// Training or just showing the current best
let runBest = false;
let playing = false;
let showNN = false;
let runBestButton,playButton, showNNButton;
let player;
let bestBird;
let gen,stats;
let backgroundImg, birdImg;
let playerGravity = 0.5

function preload(){
    gen = loadJSON('best_client.json');
    backgroundImg = loadImage('./img/background.png');
    birdImg = loadImage('./img/bird3.png')
}

function setup() {
  let canvas = createCanvas(700, 400);
  canvas.parent('canvascontainer');
  // Access the interface elements
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');
  tipSpan = select('#tip')
  highScoreSpan = select('#hs');
  allTimeHighScoreSpan = select('#ahs');
  statsSpan = select('#stats');
  runBestButton = select('#best');
  runBestButton.mousePressed(toggleState);
  playButton = select('#play');
  playButton.mousePressed(togglePlay);
  showNNButton = select('#showNN');
  showNNButton.mousePressed(toggleShowNN);

  // Create a population
  for (let i = 0; i < totalPopulation; i++) {
    let bird = new Bird();
    activeBirds[i] = bird;
  }
  population = new Population(5,2,activeBirds.slice());
  population.initialPop();
  let g = population.deserialize(gen);
  bestBird = new Bird(g);
  player = new Bird();
  player.gravity = playerGravity;
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
    if(playing)togglePlay()
    // Go train some more
  } else {
    nextGeneration();
    runBestButton.html('run pre-trained bird');
  }
}

function togglePlay(){
  playing = !playing;
  if (playing) {
    resetGame();
    speedSlider.value(1)
    playButton.html('train');
    tipSpan.html('Press space to jump')
    // Go train some more
  } else {
    nextGeneration();
    playButton.html('play');
    tipSpan.html('')
    if(dead){
      dead = false;
      loop()
    }
  }
}

function toggleShowNN(){
  showNN = !showNN;
  if(showNN){
    showNNButton.html('Back to Game');
  }
  else{
    showNNButton.html('Show Neural Network');
  }
}


function draw() {
  // background(0);
  if(showNN){
    background(0);
    let g;
    if(runBest){
      g = bestBird.genome
    }
    else{
      g = activeBirds.length == 0?bestBird.genome:activeBirds[0].genome
    }
    drawGenome(g,50,50,height-50,width-50);
    return;
  }
  image(backgroundImg,0,0,width,height);

  // Should we speed up cycles per frame
  let cycles = speedSlider.value();
  speedSpan.html(cycles);

  // How many times to advance the game
  for (let n = 0; n < cycles; n++) {
    // Show all the pipes
    
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }
    // Are we just running the best bird
    if(playing){
      player.update();
      for (let j = 0; j < pipes.length; j++) {
        // Start over, bird hit pipe
        if (pipes[j].hits(player)) {
          textSize(40);
          textAlign(CENTER,CENTER);
          fill(255);
          text('Click to Play',width/2,height/2);
          dead = true;
          noLoop();
          break;
        }
      }

      if (player.bottomTop()) {
        textSize(40);
        textAlign(CENTER,CENTER);
        fill(255);
        text('Click to Play',width/2,height/2);
        dead = true;
        noLoop();
      }

    }
    else if (runBest) {
      bestBird.think(pipes);
      bestBird.update();
      for (let j = 0; j < pipes.length; j++) {
        // Start over, bird hit pipe
        if (pipes[j].hits(bestBird)) {
          resetGame();
          break;
        }
      }

      if (bestBird.bottomTop()) {
        resetGame();
      }
      // Or are we running all the active birds
    } else {
      for (let i = activeBirds.length - 1; i >= 0; i--) {
        let bird = activeBirds[i];
        // Bird uses its brain!
        bird.think(pipes);
        bird.update();

        // Check all the pipes
        for (let j = 0; j < pipes.length; j++) {
          // It's hit a pipe
          if (pipes[j].hits(activeBirds[i])) {
            // Remove this bird
            activeBirds.splice(i, 1);
            break;
          }
        }

        if (bird.bottomTop()) {
          activeBirds.splice(i, 1);
        }

      }
    }

    // Add a new pipe every so often
    if (counter % 75 == 0) {
      pipes.push(new Pipe());
    }
    counter++;
    
    }
    

    
  // What is highest score of the current population
  let tempHighScore = 0;
  // If we're training
  if (!runBest && !playing) {
    // Which is the best bird?
    let tempBestBird = null;
    for (let i = 0; i < activeBirds.length; i++) {
      let s = activeBirds[i].score;
      if (s > tempHighScore) {
        tempHighScore = s;
        tempBestBird = activeBirds[i];
      }
    }

    // Is it the all time high scorer?
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
      // bestBird = tempBestBird;
    }
  } else if(!playing){
    // Just one bird, the best one so far
    tempHighScore = bestBird.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }
  else{
    tempHighScore = player.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }

  // Update DOM Elements
  highScoreSpan.html(tempHighScore);
  allTimeHighScoreSpan.html(highScore);

  // Draw everything!
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].show();
  }
  if(playing){
    player.show();
  }
  else if (runBest) {
    bestBird.show();
  } else {
    for (let i = 0; i < activeBirds.length; i++) {
      activeBirds[i].show();
    }
    // If we're out of birds go to the next generation
    if (activeBirds.length == 0) {
        nextGeneration();
      }
  }
}

function keyPressed(){
  if(key == 'S'){
    population.saveClient(activeBirds[0].genome);
  }
  if(key == ' '){
    if(playing){
      player.up();
    }
  }
  return false
}

function mousePressed(){
  if(playing && dead){
    dead = false;
    loop();
    resetGame();
  }
}

function resetGame() {
  counter = 0;
  // Resetting best bird score to 0
  if (bestBird && runBest) {
    bestBird.score = 0;
  }
  if(playing){
    player = new Bird()
    player.gravity = playerGravity;
  }
  pipes = [];
}
function printStats(){
  statsSpan.html(`
  </br><==== GENERATION : ${stats.gen} ====></br>
    No of Species : ${stats.species}</br>
    Avg Fitness : ${stats.avg_fitness}</br>
    Max score : ${stats.max_score}</br>
  ` + statsSpan.html());
}
// Create the next generation
function nextGeneration() {
  resetGame();
  // Normalize the fitness values 0-1
  normalizeFitness(population.clients);
  // Generate a new set of birds
  stats = population.evolve();
  printStats()
  activeBirds = population.clients.slice();
  // Copy those birds to another array
}

function normalizeFitness(birds) {
  // Make score exponentially better?
  for (let i = 0; i < birds.length; i++) {
    birds[i].fitness_score = pow(birds[i].score, 2);
  }
}