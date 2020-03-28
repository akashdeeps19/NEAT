let neat = new Neat();

class Genome{
    constructor(input_size,output_size){
        this.input_size = input_size;
        this.output_size = output_size;
        this.node_size = 0;
        this.link_size = 0;
        this.layers_size = 0;
        this.nodes = {}; //KEY -> node_id VALUE -> node 
        this.links = {}; //KEY -> innovation_no. VALUE -> link
        this.node_adj = {}; //KEY -> node_id  VALUE -> Array of innovation no.s, the node is connected
        this.layers = {}; //KEY -> layer VALUE -> Array of node_ids
        this.biases = [];
        // this.createInitialNodes();
        // this.createDenseGenome();
    }

    // <=====HELPERS=====> //
    addLink(link){
        this.links[link.innov_no] = link;
        if(!(link.from.id in this.node_adj))this.node_adj[link.from.id] = [];
        if(!(link.to.id in this.node_adj))this.node_adj[link.to.id] = [];
        this.node_adj[link.from.id].push(link.innov_no);
        this.node_adj[link.to.id].push(link.innov_no);
        this.link_size++;
    }

    addNode(node){
        this.nodes[node.id] = node;
        if(!(node.layer in this.layers))this.layers[node.layer] = [];
        this.layers[node.layer].push(node.id);
        this.node_size++;
        this.layers_size = Math.max(this.layers_size,node.layer+1);
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
        for(let i = this.layers_size-1;i >= layer;i--){
            this.layers[i+1] = [];
            for(let id of this.layers[i]){
                this.nodes[id].layer++;
                this.layers[i+1].push(id);
            }
            if(i == this.layers_size-1)continue;
            this.biases[i+1] = this.biases[i];
        }
        this.layers[layer] = [];
        this.biases[layer] = 2*Math.random()-1;
        this.layers_size++;
    }

    // <====INITIAL CONNECTIONS====> //
    createInitialNodes(){
        for(let i = 0;i < this.input_size;i++)
            this.addNode(new Node(i,0));
        for(let i = this.input_size;i < this.input_size + this.output_size;i++)
            this.addNode(new Node(i,1));

        this.biases[0] = 2*Math.random()-1;
        this.layers_size = 2;
    }

    createDenseGenome(){
        for(let i = 0;i < this.input_size;i++){
            for(let j = this.input_size;j < this.input_size+this.output_size;j++){
                const link = neat.createLink(this.nodes[i],this.nodes[j],2*Math.random()-1,true);
                this.addLink(link);
            }
        }
    }

    // <====OUTPUT CALCULATION OF NEURAL NETWORK====> //
    // getOutput(input){
    //     for(let i = 0;i < input.length;i++)
    //         this.nodes[i].output = input[i];

    //     let output = [];
    //     for(let i = this.input_size;i < this.input_size + this.output_size;i++)
    //         output.push(this.getNodeOutput(i));

    //     for(let i = 0;i < this.node_size;i++)
    //         this.nodes[i].output = undefined;
        
    //     return output;
    // }
    // getNodeOutput(id){
    //     if(this.nodes[id].output !== undefined)
    //         return this.nodes[id].output; // Add sigmoid if you want
    //     let output = 0;
    //     for(let innov of this.node_adj[id]){
    //         let link = this.links[innov];
    //         if(link.enabled && link.to.id == id)
    //             output += link.weight * this.getNodeOutput(link.from.id);
    //     }
    //     output += this.biases[this.nodes[id].layer-1];
    //     output = this.sigmoid(output);
    //     this.nodes[id].output = output;
    //     return output;
    // }

    getOutput(input){
        let output = [];
        for(let i = 0;i < input.length;i++)
            this.nodes[i].output = input[i];

        for(let i = 1;i < this.layers_size-1;i++){
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
            let link = this.links[innov];
            if(link.enabled && link.to.id == id){
                output += link.weight * this.nodes[link.from.id].output;
            }
        }
        this.nodes[id].output = output;
        output += this.biases[this.nodes[id].layer-1];
        output = this.relu(output);
        return output;
    }

    sigmoid(x){
        return 1/(1 + Math.exp(-x));
    }

    relu(x){
        return Math.max(0,x);
    }

    // <====MUTATION====> //
    mutate(){
        if(Math.random() < 0.8)
            this.mutateWeight();
        if(Math.random() < 0.05)
            this.mutateLink();
        if(Math.random() < 0.01 && this.node_size <= 5)
            this.mutateNode();
    }

    mutateWeight(){
        for(let innov in this.links){
            let link = this.links[innov];
            if(Math.random() < 0.1)
                link.weight = 2*Math.random()-1;
            else
                link.weight += (2*this.randomG(50)-1);// Gaussian distribution
            link.weight = Math.min(1,Math.max(-1,link.weight)); // limits weight to (-1,1)
        }
        for(let i = 0;i < this.biases.length;i++){
            if(Math.random() < 0.1)
                this.biases[i] = 2*Math.random()-1;
            else
                this.biases[i] += (2*this.randomG(50)-1);// Gaussian distribution
            this.biases[i] = Math.min(1,Math.max(-1,this.biases[i])); // limits bias to (-1,1)
        }
    }

    mutateNode(){
        let keys = Object.keys(this.links);
        let r = Math.floor(Math.random()*keys.length);
        let link = this.links[keys[r]];
        let node = new Node(this.node_size, link.from.layer + 1);
        link.enabled = false;
        let link1 = neat.createLink(link.from,node,1,true);
        let link2 = neat.createLink(node,link.to,link.weight,true);
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
            let l1 = Math.floor(Math.random()*this.layers_size);
            let l2 = Math.floor(Math.random()*this.layers_size);
            if(l1 == l2)continue;

            let from,to,n1,n2;
            n1 = this.layers[l1][Math.floor(Math.random()*this.layers[l1].length)];
            n2 = this.layers[l2][Math.floor(Math.random()*this.layers[l2].length)];
            // console.log('while')

            if(l1 < l2){
                from = this.nodes[n1];
                to = this.nodes[n2];
            }
            else{
                from = this.nodes[n2];
                to = this.nodes[n1];
            }

            if(!(neat.getInnovNo(from,to) in this.links)){
                link = neat.createLink(from,to,2*Math.random()-1,true);
                this.addLink(link);
            }
        }
        // console.log(link)
    }

    // <====GENOME AS OUTPUT OR PARAM====> //
    crossover(g2){
        let childGenome = new Genome(this.input_size,this.output_size);
        for(let id in this.nodes){
            childGenome.addNode(this.nodes[id].copy());
        }
        childGenome.biases = this.biases.slice();
        for(let innov in this.links){
            const link1 = this.links[innov];
            let childLink;
            if(g2.links[innov]){ //matching genes
                let link2 = g2.links[innov];
                if(Math.random() < 0.5){
                    let from = this.nodes[link1.from.id];
                    let to = this.nodes[link1.to.id];
                    childLink = link1.copy(from,to);
                }
                else{
                    let from = g2.nodes[link2.from.id];
                    let to = g2.nodes[link2.to.id];
                    childLink = link2.copy(from,to);
                }
                //childLink.enabled = link1.enabled; // safer operation

                if(!link1.enabled || !link2.enabled){ // <<UNCOMMENT THIS FOR EXACT PAPER IMPLEMENTAION!!>>
                    if(Math.random() < 0.75)
                        childLink.enabled = false;
                    else
                        childLink.enabled = true;
                }
            } 
            else{
                let from = this.nodes[link1.from.id];
                let to = this.nodes[link1.to.id];
                childLink = link1.copy(from,to);
            }
            childGenome.addLink(childLink);
        }
        return childGenome;
    }

    distance(g2){
        let keys1 = Object.keys(this.links);
        let max1 = keys1[keys1.length-1];
        let keys2 = Object.keys(g2.links);
        let max2 = keys2[keys2.length-1];
        let min_innov = Math.min(max1,max2);
        let disjoint = 0,excess = 0,weight_diff = 0;

        for(let innov in this.links){
            if(innov > min_innov){
                excess++;
                continue;
            }
            const link1 = this.links[innov];

            if(g2.links[innov]){
                weight_diff += Math.abs(link1.weight - g2.links[innov].weight);
            }
            else{
                disjoint++;
            }
        }
        for(let innov in g2.links){
            if(innov > min_innov){
                excess++;
                continue;
            }

            if(!this.links[innov]){
                disjoint++;
            }
        }
        // console.log(excess,disjoint,weight_diff);

        let species_dist = 1*excess/1 + 1*disjoint/1 + 1*weight_diff; //δ = c1 * E / N + c2 D / N + c3 * W
        return species_dist;
        
    }

    copy(){
        const copyGenome = new Genome(this.input_size,this.output_size);
        for(let id in this.nodes){
            copyGenome.addNode(this.nodes[id].copy());
        }
        copyGenome.biases = this.biases.slice();
        for(let innov in this.links){
            const link = this.links[innov];
            let from = copyGenome.nodes[link.from.id];
            let to = copyGenome.nodes[link.to.id];
            let copyLink = link.copy(from,to);
            copyGenome.addLink(copyLink);
        }
        return copyGenome;
    }
}