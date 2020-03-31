class Neat{
    constructor(
        {
            mwr = 0.8,
            mlr = 0.05,
            mnr = 0.01,
            plr = 0.75,
            c1 = 1,
            c2 = 1,
            c3 = 0.5,
            lgn = 20,
            ct = 3,
            cr = 0.25
        }={})
    {
        this.innovations = 0;
        this.innovations_lookup = {}; // KEY -> from_node_id VALUE -> {KEY->to_node_id VALUE->innovation_no}

        //CONSTANTS
        this.mwr = mwr; //mutate weight rate
        this.mlr = mlr; //mutate link rate
        this.mnr = mnr; //mutate node rate
        this.plr = plr; //parent link enabled inheritence rate
        this.c1 = c1; //disjoint links weight
        this.c2 = c2; //excess links weight
        this.c3 = c3; //weight_diff weight
        this.lgn = lgn; //large genome normalizer
        this.ct = ct; //species compatibility threshold
        this.cr = cr; //client copy rate
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
