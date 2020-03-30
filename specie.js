class Specie{
    constructor(rep){
        this.rep = rep;
        this.clients = [rep];
        this.avgFitness = 0;
        this.maxFitness = -Infinity;
        this.bestClient = undefined;
        this.totalFitness = 0;
        this.stagnantGens = 0;
    }

    addClient(client){
        if(this.rep == undefined){
            console.log(this);
            console.log(client)
        }
        if(this.rep.genome.distance(client.genome) < 3){
            this.clients.push(client);
            return true;
        }
        return false;
    }

    changeRep(){
        if(this.clients.length == 0){
            this.rep = undefined;
            return;
        }
        let r = Math.floor(Math.random()*this.clients.length)
        this.rep = this.clients[r];
    }

    setAvgFitness(){
        let sum = 0
        for(let client of this.clients){
            sum += client.fitness_score;
        }
        this.totalFitness = sum;
        this.avgFitness = sum/(this.clients.length==0?1:this.clients.length);
    }

    sortClients(){
        this.clients.sort((a,b)=>{
            return b.fitness_score - a.fitness_score;
        });
        if(this.clients[0].fitness_score > this.maxFitness){
            this.bestClient = this.clients[0];
            this.maxFitness = this.clients[0].fitness_score;
            this.stagnantGens = 0;
        }
        else{
            this.stagnantGens++;
        }
    }

    fitnessSharing(){
        for(let client of this.clients){
            client.fitness_score /= this.clients.length;
        }

    }

    thanos(){ //kills bottom half of clients :p
        if(this.clients.length <= 2)return;
        let total = this.clients.length/2;
        for(let i = this.clients.length-1;i > total;i--)
            this.clients.splice(i,1);
    }

    pickOne(){
        let r = random();
        let i = -1;
        while(r > 0){
            r -= this.clients[++i].fitness_score/this.totalFitness;
        }
        return this.clients[i];
    }

    getChild(){
        let childGenome;
        if (Math.random() < 0.25) { //25% of the time there is no crossover 
            childGenome = this.pickOne().genome.copy();
        } 
        else { //75% of the time do crossover
            let parent1 = this.pickOne();
            let parent2 = this.pickOne();

            if (parent1.fitness_score < parent2.fitness_score) {
                childGenome = parent2.genome.crossover(parent1.genome);
            } 
            else {
                childGenome = parent1.genome.crossover(parent2.genome);
            }
        }
        childGenome.mutate();
    
        return new Client(childGenome);
    }

    getNextGen(n){
        // this.thanos();
        // this.fitnessSharing();
        // this.addStats();
        let children = [];
        for(let i = 0;i < n;i++){
            children.push(this.getChild());
        }
        // this.clients = children.splice();
        // this.changeRep();
        return children;
    }

}


// class Client{
//     constructor(genome){
//         this.states = [[0,0],[0,1],[1,0],[1,1]];
//         this.curr = 0;
//         this.state = this.states[0];
//         this.score = 0;
//         this.completed = false;
//         if(genome)this.genome = genome;
//         else{
//             this.genome = new Genome(2,1);
//             this.genome.createInitialNodes();
//             this.genome.createDenseGenome();
//         }
//         this.fitness_score = 0;
//     }
//     update(){
//         for(let i = 0;i < 4;i++){
//             let input = this.genome.getOutput(this.states[i])[0];
//             this.score += 1 - Math.pow((this.states[i][0]^this.states[i][1])*1.0 - input,2);
//         }
//         this.fitness_score = this.score;
//     }
// }

class Client {
    constructor(genome) {
      this.y = height / 2;
      this.x = 64;
  
      this.gravity = 0.8;
      this.lift = -12;
      this.velocity = 0;
  
      this.score = 0;
      this.fitness_score = 0;
      this.genome = genome;
    }
  
    show() {
      stroke(255);
      fill(255, 100);
      ellipse(this.x, this.y, 32, 32);
    }
  
    up() {
      this.velocity += this.lift;
    }
  
    mutate() {
      this.brain.mutate(0.1);
    }
  
    think(pipes) {
      // Find the closest pipe
      let closest = null;
      let closestD = Infinity;
      for (let i = 0; i < pipes.length; i++) {
        let d = pipes[i].x + pipes[i].w - this.x;
        if (d < closestD && d > 0) {
          closest = pipes[i];
          closestD = d;
        }
      }
  
      let inputs = [];
      inputs[0] = this.y / height;
      inputs[1] = closest.top / height;
      inputs[2] = closest.bottom / height;
      inputs[3] = closest.x / width;
      inputs[4] = this.velocity / 10;
      let output = this.brain.predict(inputs);
      //if (output[0] > output[1] && this.velocity >= 0) {
      if (output[0] > output[1]) {
        this.up();
      }
    }
  
    offScreen() {
      return this.y > height || this.y < 0;
    }
  
    update() {
      this.score++;
  
      this.velocity += this.gravity;
      //this.velocity *= 0.9;
      this.y += this.velocity;
    }
  }