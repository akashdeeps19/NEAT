class Genome{
    constructor(input_size,output_size,neat){
        this.input_size = input_size;
        this.output_size = output_size;
        this.node_size = 0;
        this.link_size = 0;
        this.layer_size = 0;
        this.nodes = []; //INDEX -> node_id VALUE -> node 
        this.biases = [];//INDEX -> layer VALUE -> bias
        this.links = []; //VALUE -> link
        this.node_adj = []; //INDEX -> node_id  VALUE -> Array of innovation no.s, the node is connected
        this.layers = []; //INDEX -> layer VALUE -> Array of node_ids
        this.link_map = {}; //KEY -> innovation_no. VALUE -> link_index in this.links
        this.neat = neat;
    }

    // <=====HELPERS=====> //

    addNode(node){
        this.nodes[node.id] = node;

        this.node_adj[node.id] = [];

        if(!this.layers[node.layer])this.layers[node.layer] = [];
        this.layers[node.layer].push(node.id);

        this.node_size++;
        this.layer_size = Math.max(this.layer_size,node.layer+1);
    }

    addLink(link){
        let i;
        for(i = this.links.length-1;i >= 0;i--){
            if(this.links[i].innov_no > link.innov_no){
                this.links[i+1] = this.links[i];
                this.link_map[this.links[i+1].innov_no] = i+1;
            }
            else break;
        }
        this.links[i+1] = link;

        this.link_map[link.innov_no] = i+1;

        this.node_adj[link.from.id].push(link.innov_no);
        this.node_adj[link.to.id].push(link.innov_no);

        this.link_size++;
    }

    getLink(innov){
        if(!(innov in this.link_map))
            return false;
        let i = this.link_map[innov];
        return this.links[i];
    }

    randomG(v){ 
        let r = 0;
        for(let i = v; i > 0; i --){
            r += Math.random();
        }
        return r / v;
    }

    isFullyConnected(){
        for(let i = 0;i < this.node_size;i++){
            if(this.node_adj[i].length < this.node_size - this.layers[this.nodes[i].layer].length)
                return false;
        }
        return true;
    }

    shiftLayer(layer){
        for(let i = this.layer_size-1;i >= layer;i--){
            this.layers[i+1] = [];
            for(let id of this.layers[i]){
                this.nodes[id].layer++;
                this.layers[i+1].push(id);
            }
            if(i == this.layer_size-1)continue;
            this.biases[i+1] = this.biases[i];
        }
        this.layers[layer] = [];
        this.biases[layer] = 2*Math.random()-1;
        this.layer_size++;
    }

    // <====INITIAL CONNECTIONS====> //
    createInitialNodes(){
        for(let i = 0;i < this.input_size;i++)
            this.addNode(new Node(i,0));
        for(let i = this.input_size;i < this.input_size + this.output_size;i++)
            this.addNode(new Node(i,1));

        this.biases[0] = 2*Math.random()-1;
        this.layer_size = 2;
    }

    createDenseGenome(){
        for(let i = 0;i < this.input_size;i++){
            for(let j = this.input_size;j < this.input_size+this.output_size;j++){
                const link = this.neat.createLink(this.nodes[i],this.nodes[j],2*Math.random()-1,true);
                this.addLink(link);
            }
        }
    }

    // <====OUTPUT CALCULATION OF NEURAL NETWORK====> //
    predict(input){
        let output = [];
        for(let i = 0;i < input.length;i++)
            this.nodes[i].output = input[i];

        for(let i = 1;i < this.layer_size-1;i++){
            for(let id of this.layers[i]){
                this.getNodeOutput(id);
            }
        }
        for(let i = this.input_size;i < this.input_size + this.output_size;i++){
            output.push(this.getNodeOutput(i));
        }
        for(let i = 0;i < this.node_size;i++)
            this.nodes[i].output = undefined;
        
        return output;
    }

    getNodeOutput(id){
        let output = 0;
        for(let innov of this.node_adj[id]){
            let link = this.getLink(innov);
            if(link.enabled && link.to.id == id){
                output += link.weight * this.nodes[link.from.id].output;
            }
        }
        output += this.biases[this.nodes[id].layer-1];
        output = this.sigmoid(output);
        this.nodes[id].output = output;
        return output;
    }

    sigmoid(x){
        return 1/(1 + Math.exp(-4.9*x));
    }

    relu(x){
        return Math.max(0,x);
    }

    // <====MUTATION====> //
    mutate(){
        if(Math.random() < this.neat.mwr)
            this.mutateWeight();
        if(Math.random() < this.neat.mlr)
            this.mutateLink();
        if(Math.random() < this.neat.mnr)
            this.mutateNode();
    }

    mutateWeight(){
        for(let link of this.links){
            if(Math.random() < 0.1)
                link.weight = 2*Math.random()-1;
            else
                link.weight += (2*this.randomG(50)-1)/5;// Gaussian distribution
            link.weight = Math.min(1,Math.max(-1,link.weight)); // limits weight to (-1,1)
        }
        for(let i = 0;i < this.biases.length;i++){
            if(Math.random() < 0.1)
                this.biases[i] = 2*Math.random()-1;
            else
                this.biases[i] += (2*this.randomG(50)-1)/5;// Gaussian distribution
            this.biases[i] = Math.min(1,Math.max(-1,this.biases[i])); // limits bias to (-1,1)
        }
    }

    mutateNode(){
        if(this.link_size == 0)return;
        let r = Math.floor(Math.random()*this.link_size);
        let link = this.links[r];
        let node = new Node(this.node_size, link.from.layer + 1);
        link.enabled = false;
        let link1 = this.neat.createLink(link.from,node,1,true);
        let link2 = this.neat.createLink(node,link.to,link.weight,true);
        if(node.layer == link.to.layer){
            this.shiftLayer(node.layer);
        }
        this.addNode(node);
        this.addLink(link1);
        this.addLink(link2);
    }

    mutateLink(){
        if(this.isFullyConnected())return;

        let link = undefined;
        while(!link){
            let l1 = Math.floor(Math.random()*this.layer_size);
            let l2 = Math.floor(Math.random()*this.layer_size);
            if(l1 == l2)continue;

            let from,to,n1,n2;
            n1 = this.layers[l1][Math.floor(Math.random()*this.layers[l1].length)];
            n2 = this.layers[l2][Math.floor(Math.random()*this.layers[l2].length)];
           
            if(l1 < l2){
                from = this.nodes[n1];
                to = this.nodes[n2];
            }
            else{
                from = this.nodes[n2];
                to = this.nodes[n1];
            }

            if(!(this.neat.getInnovNo(from,to) in this.link_map)){
                link = this.neat.createLink(from,to,2*Math.random()-1,true);
                this.addLink(link);
            }
        }
    }

    // <====GENOME AS OUTPUT OR PARAM====> //
    crossover(g2){
        let childGenome = new Genome(this.input_size,this.output_size,this.neat);
        for(let node of this.nodes){
            childGenome.addNode(node.copy());
        }
        childGenome.biases = this.biases.slice();
        for(let link1 of this.links){
            let innov = link1.innov_no;
            let childLink;
            if(innov in g2.link_map){ //matching genes
                let link2 = g2.getLink(innov);
                if(Math.random() < 0.5){
                    let from = childGenome.nodes[link1.from.id];
                    let to = childGenome.nodes[link1.to.id];
                    childLink = link1.copy(from,to);
                }
                else{
                    let from = childGenome.nodes[link2.from.id];
                    let to = childGenome.nodes[link2.to.id];
                    childLink = link2.copy(from,to);
                }
                //childLink.enabled = link1.enabled; // safer operation

                if(!link1.enabled || !link2.enabled){ // <<UNCOMMENT THIS FOR EXACT PAPER IMPLEMENTAION!!>>
                    if(Math.random() < this.neat.plr)
                        childLink.enabled = false;
                    else
                        childLink.enabled = true;
                }
            } 
            else{
                let from = childGenome.nodes[link1.from.id];
                let to = childGenome.nodes[link1.to.id];
                childLink = link1.copy(from,to);
            }
            
            childGenome.addLink(childLink);
        }
        return childGenome;
    }

    distance(other){
        let i1 = 0,i2 = 0;
        let disjoint = 0,excess,weight_diff = 0,similar = 0;

        let g1 = this,g2 = other; //g1 -> genome with max innov g2 -> genome with min innov
        if(other.link_size != 0)
            if(this.link_size == 0 || this.links[this.link_size-1].innov_no < other.links[other.link_size-1].innov_no){
                g1 = other;
                g2 = this;
            }

        while(i1 < g1.link_size && i2 < g2.link_size){
            if(g1.links[i1].innov_no == g2.links[i2].innov_no){
                weight_diff += Math.abs(g1.links[i1].weight - g2.links[i2].weight);
                similar++;
                i1++;
                i2++;
            }
            else if(g1.links[i1].innov_no < g2.links[i2].innov_no){
                disjoint++;
                i1++;
            }
            else{
                disjoint++;
                i2++;
            }
        }
        
        excess = g1.link_size - i1;
        weight_diff /= similar==0?1:similar;
        let N = g2.link_size - this.neat.lgn;
        N = Math.max(1,N);
        // console.log(excess,disjoint,weight_diff)
        // if(!similar)return 100;
        let species_dist = this.neat.c1*excess/N + this.neat.c2*disjoint/N + this.neat.c3*weight_diff; //δ = c1 * E / N + c2 * D / N + c3 * W
        return species_dist;
        
    }

    copy(){
        const copyGenome = new Genome(this.input_size,this.output_size,this.neat);
        for(let node of this.nodes){
            copyGenome.addNode(node.copy());
        }
        copyGenome.biases = this.biases.slice();
        for(let link of this.links){
            let from = copyGenome.nodes[link.from.id];
            let to = copyGenome.nodes[link.to.id];
            let copyLink = link.copy(from,to);
            copyGenome.addLink(copyLink);
        }
        return copyGenome;
    }
}