class Population{
    constructor(size_){
        this.clients = [];
        this.population_size = size_;
        this.generation = 1;
        this.species = [];
        this.avgFitness = 0;
        this.maxFitness = -Infinity;
        this.bestClient = undefined;
    }

    initialPop(){
        for(let i = 0;i < this.population_size;i++){
            this.clients.push(new Client());
        }
        this.speciate();
    }

    speciate(){
        for(let specie of this.species)
            specie.clients = [];
        for(let client of this.clients){
            let found = false;
            for(let specie of this.species){
                if(specie.addClient(client)){
                    found = true;
                    break;
                }
            }
            if(!found){
                this.species.push(new Specie(client));
            }
        }
        for(let specie of this.species){
            specie.changeRep();
        }
    }


    evolve(){
        // this.speciate();
        this.killSpecies();
        this.sortSpecies();
        this.avgFitness = this.getAvgFitness();
        let total = this.avgFitness==0?1:this.avgFitness*this.species.length;
        if((this.generation-1)%1 == 0)
            this.printStats();
        let children = [];
        for(let specie of this.species){
            children.push(new Client(specie.bestClient.genome.copy()))
            let n = Math.floor(specie.avgFitness/total*this.population_size)-1;
            children = children.concat(specie.getNextGen(n));
        }
        while(children.length < this.population_size){
            let child = this.species[0].getChild();
            children.push(child);
        }
        this.clients = [];
        this.clients = children.slice();
        this.speciate();
        this.generation++;
    }

    killSpecies(){
        for(let i = this.species.length-1;i >= 0;i--){
            this.species[i].sortClients();
            this.species[i].thanos();
            this.species[i].fitnessSharing();
            this.species[i].addStats();
            this.avgFitness = this.getAvgFitness();
            let total = this.avgFitness==0?1:this.avgFitness*this.species.length;
            let avg = this.species[i].avgFitness/total * this.clients.length; 
            if((this.species[i].stagnantGens > 15 || avg < 1) && this.species.length > 1){
                this.species.splice(i,1);
            }
        }
    }

    sortSpecies(){
        for(let specie of this.species)
            specie.sortClients();
        this.species.sort((a,b)=>{
            return b.maxFitness - a.maxFitness;
        });
    }

    getAvgFitness(){
        let sum = 0;
        for(let specie of this.species){
            sum += specie.avgFitness;
        }
        return sum/(this.species.length == 0?1:this.species.length)
    }

    getBestClient(){
        let maxScore = -Infinity;
        let best = undefined;
        for(let specie of this.species){
            if(specie.bestClient.score > maxScore){
                maxScore = specie.bestClient.score;
                best = specie.bestClient;
            }
        }
        return best; 
    }

    printStats(){
        console.log(`<==== GENERATION : ${this.generation} ====>`);
        console.log(`Max Fitness : ${this.species[0].maxFitness}`);
        console.log(`Avg Fitness : ${this.avgFitness}`);
        
        console.log(`No of Species : ${this.species.length}`);
        this.bestClient = this.getBestClient();
        console.log(`Max score : ${this.bestClient.score}`);
    }
}




/*
 * <====ORDER====>
 * 
 * SETUP
 *  random population
 *  speciate
 * 
 * EVOLVE
 *  calculate fitness
 *  sort species clients
 *  species best client
 *  sort species based on max fitness
 *  species fitness sharing
 *  species average fitness
 *  kill species
 *  update population stats
 *  get children based on avg fitness of species
 *  set population clients to children
 *  speciate
 */