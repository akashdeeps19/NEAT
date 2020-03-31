class Specie{
    constructor(rep,gen,neat){
        this.rep = rep;
        this.clients = [rep];
        this.neat = neat;

        //STATS
        this.startGen = gen
        this.avgFitness = 0;
        this.maxFitness = -Infinity;
        this.bestClient = undefined;
        this.totalFitness = 0;
        this.stagnantGens = 0;
    }

    // <====SPECIATE====> //
    addClient(client){
        if(this.rep.genome.distance(client.genome) < this.neat.ct){
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

    // <====HELPERS===> //
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

    setAvgFitness(){
        let sum = 0
        for(let client of this.clients){
            sum += client.fitness_score;
        }
        this.totalFitness = sum;
        this.avgFitness = sum/(this.clients.length==0?1:this.clients.length);
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

    // <====NEW GENERATION FUNCTIONS====> //
    getNextGen(n){
        let children = [];
        for(let i = 0;i < n;i++){
            children.push(this.getChild());
        }
        return children;
    }

    getChild(){
        let child;
        if (Math.random() < this.neat.cr) { //25% of the time there is no crossover 
            child = this.pickOne().copy();
        } 
        else { //75% of the time do crossover
            let parent1 = this.pickOne();
            let parent2 = this.pickOne();

            if (parent1.fitness_score < parent2.fitness_score) {
                child = parent2.crossover(parent1);
            } 
            else {
                child = parent1.crossover(parent2);
            }
        }
        child.genome.mutate();
    
        return child;
    }

    pickOne(){
        let r = random();
        let i = -1;
        while(r > 0){
            r -= this.clients[++i].fitness_score/this.totalFitness;
        }
        return this.clients[i];
    }

}