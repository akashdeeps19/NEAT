class Specie{
    constructor(rep){
        this.clients = [];
        this.rep = rep;
        this.avgFitness = 0;
        this.maxFitness = -Infinity;
        this.bestClient = undefined;
        this.totalFitness = 0;
        this.stagnantGens = 0;
    }

    addClient(client){
        if(this.rep.distance(client) < 3){
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

    addStats(){
        let best = undefined;
        let maxFit = -Infinity, sum = 0;
        for(let client of this.clients){
            sum += client.fitness_score;
            if(client.fitness_score > maxFit){
                maxFit = client.fitness_score;
                best = client;
            }
        }
        this.totalFitness = sum;
        this.avgFitness = sum/(this.clients.length==0?1:this.clients.length);
        if(maxFit > this.maxFitness){
            this.bestClient = best;
            this.maxFitness = maxFit;
            this.stagnantGens = 0;
        }
        else{
            this.stagnantGens++;
        }
    }

    sortClients(){
        this.clients.sort((a,b)=>{
            b.fitness_score - a.fitness_score;
        });
    }
    
    fitnessSharing(){
        for(let client of this.clients){
            client.fitness_score /= this.clients.length;
        }

    }

    thanos(){ //kills bottom half of clients :p
        if(this.clients.length <= 2)return;
        for(let i = this.clients.length-1;i >= this.clients.length/2;i--)
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
                childGenome = parent1.crossover(parent2);
            }
        }
        childGenome.mutate();
    
        return new Client(childGenome);
    }

    getNextGen(n){
        this.thanos();
        this.fitnessSharing();
        this.addStats();
        let children = [];
        for(let i = 0;i < n;i++){
            children.push(this.getChild());
        }
        // this.clients = children.splice();
        // this.changeRep();
        return children;
    }

}