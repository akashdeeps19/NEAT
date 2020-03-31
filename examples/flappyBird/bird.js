class Bird {
    constructor(genome = undefined) {
        // position and size of bird
        this.x = 64;
        this.y = height / 2;
        this.r = 12;
    
        // Gravity, lift and velocity
        this.gravity = 0.8;
        this.lift = -12;
        this.velocity = 0;
    
        // Is this a copy of another Bird or a new one?
        // The Neural Network is the bird's "brain"
        this.genome = genome
    
        // Score is how many frames it's been alive
        this.score = 0;
        // Fitness is normalized version of score
        this.fitness_score = 0;
      }
    
    
      // Display the bird
      show() {
        fill(255, 100);
        stroke(255);
        ellipse(this.x, this.y, this.r * 2, this.r * 2);
      }
    
      // This is the key function now that decides
      // if it should jump or not jump!
      think(pipes) {
        // First find the closest pipe
        let closest = null;
        let record = Infinity;
        for (let i = 0; i < pipes.length; i++) {
          let diff = pipes[i].x+pipes[i].w - this.x;
          if (diff > 0 && diff < record) {
            record = diff;
            closest = pipes[i];
          }
        }
    
        if (closest != null) {
          // Now create the inputs to the neural network
          let inputs = [];
          // x position of closest pipe
          inputs[0] = map(closest.x, this.x, width, 0, 1);
          // top of closest pipe opening
          inputs[1] = map(closest.top, 0, height, 0, 1);
          // bottom of closest pipe opening
          inputs[2] = map(closest.bottom, 0, height, 0, 1);
          // bird's y position
          inputs[3] = map(this.y, 0, height, 0, 1);
          // bird's y velocity
          inputs[4] = map(this.velocity, -5, 5, 0, 1);
    
          // Get the outputs from the network
          let action = this.genome.predict(inputs);
          // Decide to jump or not!
          if (action[1] > action[0]) {
            this.up();
          }
        }
      }
    
      // Jump up
      up() {
        this.velocity += this.lift;
      }
    
      bottomTop() {
        // Bird dies when hits bottom?
        return (this.y > height || this.y < 0);
      }
    
      // Update bird's position based on velocity, gravity, etc.
      update() {
        this.velocity += this.gravity;
        // this.velocity *= 0.9;
        this.y += this.velocity;
    
        // Every frame it is alive increases the score
        this.score++;
      }

    crossover(other){
        let g = this.genome.crossover(other.genome);
        return new Bird(g);
    }

    copy(){
        return new Bird(this.genome.copy());
    }
  }

  // "{\"input_size\":5,\"output_size\":2,\"node_size\":10,\"link_size\":18,\"layer_size\":4,\"nodes\":[{\"id\":0,\"layer\":0},{\"id\":1,\"layer\":0},{\"id\":2,\"layer\":0},{\"id\":3,\"layer\":0},{\"id\":4,\"layer\":0},{\"id\":5,\"layer\":3},{\"id\":6,\"layer\":3},{\"id\":7,\"layer\":1},{\"id\":8,\"layer\":2},{\"id\":9,\"layer\":1}],\"biases\":[-0.8832098591455843,0.051057181712891885,-0.7270255019642712],\"links\":[{\"from\":{\"id\":0,\"layer\":0},\"to\":{\"id\":5,\"layer\":3},\"weight\":-0.9233432509088622,\"enabled\":true,\"innov_no\":0},{\"from\":{\"id\":0,\"layer\":0},\"to\":{\"id\":6,\"layer\":3},\"weight\":-0.7140733759805027,\"enabled\":true,\"innov_no\":1},{\"from\":{\"id\":1,\"layer\":0},\"to\":{\"id\":5,\"layer\":3},\"weight\":0.7969251880485241,\"enabled\":true,\"innov_no\":2},{\"from\":{\"id\":1,\"layer\":0},\"to\":{\"id\":6,\"layer\":3},\"weight\":-0.7587436324162945,\"enabled\":true,\"innov_no\":3},{\"from\":{\"id\":2,\"layer\":0},\"to\":{\"id\":5,\"layer\":3},\"weight\":0.5481271956021038,\"enabled\":true,\"innov_no\":4},{\"from\":{\"id\":2,\"layer\":0},\"to\":{\"id\":6,\"layer\":3},\"weight\":-0.8883460482283901,\"enabled\":false,\"innov_no\":5},{\"from\":{\"id\":3,\"layer\":0},\"to\":{\"id\":5,\"layer\":3},\"weight\":-0.6924078521289682,\"enabled\":true,\"innov_no\":6},{\"from\":{\"id\":3,\"layer\":0},\"to\":{\"id\":6,\"layer\":3},\"weight\":0.3159673074951424,\"enabled\":true,\"innov_no\":7},{\"from\":{\"id\":4,\"layer\":0},\"to\":{\"id\":5,\"layer\":3},\"weight\":-0.4709043093947892,\"enabled\":true,\"innov_no\":8},{\"from\":{\"id\":4,\"layer\":0},\"to\":{\"id\":6,\"layer\":3},\"weight\":0.15258434970842955,\"enabled\":true,\"innov_no\":9},{\"from\":{\"id\":0,\"layer\":0},\"to\":{\"id\":7,\"layer\":1},\"weight\":-0.1396027282603607,\"enabled\":true,\"innov_no\":10},{\"from\":{\"id\":7,\"layer\":1},\"to\":{\"id\":5,\"layer\":3},\"weight\":-0.2116101889101676,\"enabled\":false,\"innov_no\":11},{\"from\":{\"id\":1,\"layer\":0},\"to\":{\"id\":7,\"layer\":1},\"weight\":-0.48987603890380205,\"enabled\":true,\"innov_no\":12},{\"from\":{\"id\":3,\"layer\":0},\"to\":{\"id\":7,\"layer\":1},\"weight\":-0.19423945815611643,\"enabled\":true,\"innov_no\":15},{\"from\":{\"id\":8,\"layer\":2},\"to\":{\"id\":5,\"layer\":3},\"weight\":0.7453557010948006,\"enabled\":true,\"innov_no\":20},{\"from\":{\"id\":7,\"layer\":1},\"to\":{\"id\":8,\"layer\":2},\"weight\":1,\"enabled\":true,\"innov_no\":27},{\"from\":{\"id\":2,\"layer\":0},\"to\":{\"id\":9,\"layer\":1},\"weight\":1,\"enabled\":true,\"innov_no\":31},{\"from\":{\"id\":9,\"layer\":1},\"to\":{\"id\":6,\"layer\":3},\"weight\":-0.9434089436595696,\"enabled\":true,\"innov_no\":32}],\"node_adj\":[[0,1,10],[2,3,12],[4,5,31],[6,7,15],[8,9],[0,2,4,6,8,11,20],[1,3,5,7,9,32],[11,12,15,27,10],[20,27],[31,32]],\"layers\":[[0,1,2,3,4],[7,9],[8],[5,6]],\"link_map\":{\"0\":0,\"1\":1,\"2\":2,\"3\":3,\"4\":4,\"5\":5,\"6\":6,\"7\":7,\"8\":8,\"9\":9,\"10\":10,\"11\":11,\"12\":12,\"15\":13,\"20\":14,\"27\":15,\"31\":16,\"32\":17}}"