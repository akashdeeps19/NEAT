class Neat{
    constructor(){
        this.innovations = 0;
        this.innovations_lookup = {}; // KEY -> from_node_id VALUE -> {KEY->to_node_id VALUE->innovation_no}
    }

    createLink(from,to,weight,enabled){
        if(this.getInnovNo(from,to) != -1)
            return new Link(from,to,weight,enabled,this.getInnovNo(from,to));
            
        if(!(from.id in this.innovations_lookup))
            this.innovations_lookup[from.id] = {};
        this.innovations_lookup[from.id][to.id] = this.innovations;
        const link = new Link(from,to,weight,enabled,this.innovations);
        this.innovations++;
        return link;
    }

    getInnovNo(from,to){
        if(from.id in this.innovations_lookup && to.id in this.innovations_lookup[from.id])
            return this.innovations_lookup[from.id][to.id];
        return -1;
    }

}
