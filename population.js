class Population{
    constructor(size){
        this.clients = [];
        this.population_size = size;
        this.generation = 0;
        this.species = [];
        this.avgFitness = 0;
    }

    initialPop(){
        for(let i = 0;i < this.population_size;i++){
            this.clients.push(new Client());
        }
        this.speciate();
    }

    speciate(){
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
            specie.sortClients();
        }
    }


    evolve(){
        // this.speciate();
        this.killSpecies();
        this.sortSpecies();
        this.avgFitness = this.getAvgFitness();
        let children = [];
        for(let specie of this.species){
            children.push(new Client(specie.bestClient.genome.copy()))
            let n = Math.floor(specie.avgFitness/this.avgFitness*this.species.length)-1;
            children = children.concat(specie.getNextGen(n));
        }
        while(children.length < this.population_size){
            let child = this.species[0].getChild();
            children.push(child);
        }
        this.clients = [];
        this.clients = children.slice();
        this.speciate();
    }

    killSpecies(){
        for(let i = this.species.length-1;i >= 0;i--){
            this.species[i].thanos();
            this.species[i].addStats();
            this.avgFitness = this.getAvgFitness();
            let avg = this.species[i].avgFitness/(this.avgFitness==0?1:this.avgFitness) * this.clients.length; 
            if(this.species[i].stagnantGens > 15 || avg < 1){
                this.species.splice(i,1);
            }
        }
    }

    sortSpecies(){
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
}