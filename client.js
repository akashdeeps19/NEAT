// <==== CLIENT TEMPLATE ====> //

class Client{
    constructor(genome = undefined){
        this.genome = genome;
        this.score = 0; 
        this.fitness_score = 0;
    }
    update(){
        
    }
    crossover(other){
        let g = this.genome.crossover(other.genome);
        return new Client(g);
    }

    copy(){
        return new Client(this.genome.copy());
    }
}