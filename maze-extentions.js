import * as helpers from "./helpers.js"

export class DirectionalMazeView {
    constructor(maze) {
        this.maze = maze
        this.nodeDirections = helpers.create2DArray(this.maze.width, this.maze.height)
    }

    reset() {
        for (let y = 0; y < this.maze.height; y++)
            for (let x = 0; x < this.maze.width; x++)
                this.nodeDirections[y][x] = null
    }

    getDirectionOf(node) {
        return this.nodeDirections[node.yPos][node.xPos]
    }

    setNodeDirection(node, connection) {
        // update prev connection
        let prevConnection = this.getDirectionOf(node)
        this.nodeDirections[node.yPos][node.xPos] = connection

        this.updateConnection(connection)
        this.updateConnection(prevConnection)
    }

    /**
     * Activates this connection if one of its nodes is activating it. Deactivates otherwise.
     */
    updateConnection(c) {
        if (c == null) return
        c.active =  this.nodeDirections[c.node1.yPos][c.node1.xPos] == c || 
                    this.nodeDirections[c.node2.yPos][c.node2.xPos] == c
    }
}

export class VisitedMazeView {
    constructor(maze) {
        this.maze = maze
        this.visitedNodeMap = helpers.create2DArray(this.maze.width, this.maze.height, () => false)
    }

    reset() {
        for (let y = 0; y < this.maze.height; y++)
            for (let x = 0; x < this.maze.width; x++)
                this.visitedNodeMap[y][x] = false
    }

    isVisited(node) {
        return this.visitedNodeMap[node.yPos][node.xPos]
    }

    visitNode(node) {
        this.visitedNodeMap[node.yPos][node.xPos] = true
    }

    unvisitNode(node) {
        this.visitedNodeMap[node.yPos][node.xPos] = false
    }
}