import * as helpers from "./helpers.js"

export class Node {
    constructor(xPos, yPos) {
        this.connections = [] // connections are ordered: left, right, up, down
        this.neighbors = [] // neighbors are ordered same as the connections
        this.xPos = xPos // the x position of this node in the maze grid, not on the screen
        this.yPos = yPos // the y position of this node in the maze grid, not on the screen
    }

    cacheNeighbors() {
        this.neighbors = this.connections.map(c => c.getOtherNode(this))
    }
}

export class NodeConnection {
    constructor(node1, node2, active = false) {
        this.node1 = node1 // left or up node
        this.node2 = node2 // right or down node
        this.active = active

        this.node1.connections.push(this)
        this.node2.connections.push(this)
    }

    getOtherNode(node) {
        if (this.node1 === node)
            return this.node2
        return this.node1
    }
}

export class Maze {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.nodes = 
            helpers.create2DArray(this.width, this.height, (x, y) => new Node(x, y))
        this.horizontalConnections = 
            helpers.create2DArray(this.width - 1, this.height, (x, y) => new NodeConnection(this.nodes[y][x], this.nodes[y][x + 1]))
        this.verticalConnections = 
            helpers.create2DArray(this.width, this.height - 1, (x, y) => new NodeConnection(this.nodes[y][x], this.nodes[y + 1][x]))
        this.cacheNodeNeighbors()
    }

    cacheNodeNeighbors() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.nodes[y][x].cacheNeighbors();
            }
        }
    }

    reset() {
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width - 1; x++)
                this.horizontalConnections[y][x].active = false;

        for (let y = 0; y < this.height - 1; y++)
            for (let x = 0; x < this.width; x++)
                this.verticalConnections[y][x].active = false;
    }
}