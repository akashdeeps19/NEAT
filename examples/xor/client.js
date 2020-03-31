class Client{
    constructor(genome = undefined){
        this.states = [[0,0],[0,1],[1,0],[1,1]];
        this.genome = genome;
        this.score = 0; 
        this.fitness_score = 0;
    }
    update(){
        for(let i = 0;i < 4;i++){
            let input = this.genome.predict(this.states[i])[0];
            this.score += 1 - Math.pow((this.states[i][0]^this.states[i][1])*1.0 - input,2);
        }
        this.fitness_score = this.score;
    }
    crossover(other){
        let g = this.genome.crossover(other.genome);
        return new Client(g);
    }

    copy(){
        return new Client(this.genome.copy());
    }
}