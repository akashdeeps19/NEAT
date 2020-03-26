class Node{
    constructor(id,layer){
        this.id = id;
        this.layer = layer;
        this.output = undefined;
    }

    copy(){
        return new Node(this.id,this.layer);
    }
}

class Link{
    constructor(from,to,weight,enabled,innov_no){
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.enabled = enabled;
        this.innov_no = innov_no;
    }

    equals(link){
        return link.from.id == this.from.id && link.to.id == this.to.id;
    }

    copy(){
        return new Link(this.from,this.to,this.weight,this.enabled,this.innov_no);
    }
}