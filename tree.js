class Bst {
    constructor() {
      this.root = null;
    }
  
    insert(data) {
      var node = new Node(data);
  
      if (!this.root) {
        this.root = node;
        return this;
      }
      let current = this.root;
      while (current) {
        // duplicates check
        if (data === current.data) {
          return;
        }
  
        // left node insertion
        if (data < current.data) {
          if (!current.left) {
            current.left = node;
            break;
          }
          current = current.left;
        }
  
        //right node insertion
        if (data > current.data) {
          if (!current.right) {
            current.right = node;
            break;
          }
          current = current.right;
        }
      }
    }
  }

  class Node{
    constructor(data){
      this.right = null;
      this.left = null;
      this.data = data
    }
  }

  module.exports = {Bst}