let fault;
class Population{
    constructor(size_){
        this.clients = [];
        this.population_size = size_;
        this.generation = 1;
        this.species = [];
        this.avgFitness = 0;
        this.totalFitness = 0;
        this.maxFitness = -Infinity;
        this.bestClient = undefined;
    }

    initialPop(){
        for(let i = 0;i < this.population_size;i++){
            this.clients.push(new Client(this.randomGenome()));
        }
        this.speciate();
    }

    randomGenome(){
        const g = new Genome(5,2);
        g.createInitialNodes();
        g.createDenseGenome();
        g.mutate();
        return g
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
        for(let i = this.species.length-1;i >= 0;i--){
            if(this.species[i].clients.length == 0)
                this.species.splice(i,1);
        }
        for(let specie of this.species){
            specie.changeRep();
        }
    }


    evolve(){
        // this.speciate();
        this.sortSpecies();
        this.killSpecies();
        // if(!this.avgFitness){console.log(population.species.slice());return;}
        // this.avgFitness = this.getAvgFitness();
        let total = this.totalFitness;
        if((this.generation-1)%1 == 0)
            this.printStats();
        let children = [];
        children.push(new Client(this.bestClient.genome.copy()));
        children[0].genome.mutate();
        for(let specie of this.species){
            children.push(new Client(specie.bestClient.genome.copy()));
            let n = Math.floor(specie.avgFitness/total*this.population_size)-1;
            children = children.concat(specie.getNextGen(n));
        }
        children.pop()
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
        for(let specie of this.species){
            specie.fitnessSharing();
            specie.thanos();
            specie.setAvgFitness()
        }
        this.avgFitness = this.getAvgFitness();
        let total = this.totalFitness;
        for(let i = this.species.length-1;i >= 0;i--){
            let n = this.species[i].avgFitness/total * this.population_size; 
            if((this.species[i].stagnantGens > 15 || n < 1) && this.species.length > 1){
                // if(this.species[i].stagnantGens > 15 && i == 0)
                //     console.log('best is stagnant')
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
            if(!specie.avgFitness){
                fault = specie;
                console.log('fault')
            }
            sum += specie.avgFitness;
        }
        this.totalFitness = sum;
        return sum/(this.species.length == 0?1:this.species.length)
    }

    getBestClient(){
        if(this.species[0].maxFitness > this.maxFitness){
            this.maxFitness = this.species[0].maxFitness;
            return this.species[0].bestClient; 
        }
        return this.bestClient;
    }

    printStats(){
        console.log(`<==== GENERATION : ${this.generation} ====>`);
        console.log(`Max Fitness : ${this.species[0].maxFitness}`);
        console.log(`Avg Fitness : ${this.avgFitness}`);
        console.log(`Mutations : ${mutations}`)
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
 *  kill species clients
 *  species average fitness
 *  kill species
 *  update population stats
 *  get children based on avg fitness of species
 *  set population clients to children
 *  speciate
 */