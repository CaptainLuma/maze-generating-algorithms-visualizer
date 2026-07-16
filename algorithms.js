import * as helpers from "./helpers.js"
import { DirectionalMazeView, VisitedMazeView } from "./maze-extentions.js"

class Algorithm {
    constructor(maze) {
        this.maze = maze
        this.complete = false
        this.type = "generator"
    }

    solveMaze(maxIterations) {
        if (this.complete)
            this.initialize()
        let iterationsPerformed = 0
        while(!this.complete) {
            this.iterate()
            iterationsPerformed++
            if (iterationsPerformed > maxIterations) {
                console.log(`Maximum iteration limit of ${maxIterations} exceeded.`)
                break;
            }
        }
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
    }
}

export class RecursiveBacktracking extends Algorithm {
    constructor(maze) {
        super(maze)

        this.directions = new DirectionalMazeView(maze)
        this.visits = new VisitedMazeView(maze)

        this.initialize()
    }

    // initializes the maze for this algorithm
    initialize() {
        this.maze.reset()
        this.directions.reset()
        this.visits.reset()

        this.originNode = this.maze.nodes[0][0]
        this.activeNode = this.originNode

        this.complete = false
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
        mazeVisual.getNodeVisual(this.activeNode).color = mazeVisual.activeNodeColor

        // set visual arrow directions
        if (mazeVisual.drawArrows) {
            for (let y = 0; y < this.maze.height; y++) {
                for (let x = 0; x < this.maze.width; x++) {
                    let connection = this.directions.getDirectionOf(this.maze.nodes[y][x])
                    if (connection == null)
                        continue // node points nowhere
                    mazeVisual.getConnectionVisual(connection).arrowTo = connection.getOtherNode(this.maze.nodes[y][x])
                }
            }
        }
    }

    // performs one iteration of the algorithm
    iterate() {
        if (this.complete) return

        // visit this node
        this.visits.visitNode(this.activeNode)
        
        // get directions of unvisited neighboring cells
        let possibleConnections = this.activeNode.connections.filter(c => {
            let other = c.getOtherNode(this.activeNode)
            return !this.visits.isVisited(other)
        })

        if (possibleConnections.length == 0) { // the cell is surrounded
            if (this.activeNode == this.originNode) {
                // the maze is complete
                this.complete = true
                return
            }

            // backtrack
            this.activeNode = this.directions.getDirectionOf(this.activeNode).getOtherNode(this.activeNode)
        } else { // the cell is not surrounded
            // travel to a random unvisited neighboring node
            let selectedConnection = helpers.getRandomFromArray(possibleConnections)
            this.activeNode = selectedConnection.getOtherNode(this.activeNode)

            // set the direction of this node to point in the opposite direction just traveled
            this.directions.setNodeDirection(this.activeNode, selectedConnection)
        }
    }
}

export class OriginShift extends Algorithm {
    constructor(maze) {
        super(maze)

        this.type = "modifier"
        this.directions = new DirectionalMazeView(maze)

        this.maxIterations = maze.width * maze.height * 20 // TODO: fix equation

        this.initialize()
    }

    // initializes the maze for this algorithm
    initialize() {
        this.maze.reset()
        this.directions.reset()

        // initialize maze to perfect maze
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width - 1; x++) {
                // all nodes point right
                this.directions.setNodeDirection(this.maze.nodes[y][x], this.maze.horizontalConnections[y][x]);
            }
        }
        for (let y = 0; y < this.maze.height - 1; y++) {
            // nodes in the right-most colunmn point down
            this.directions.setNodeDirection(this.maze.nodes[y][this.maze.width - 1], this.maze.verticalConnections[y][this.maze.width - 1]) 
        }
        // bottom right node is origin
        this.directions.setNodeDirection(this.maze.nodes[this.maze.height - 1][this.maze.width - 1], null)
        this.originNode = this.maze.nodes[this.maze.height - 1][this.maze.width - 1]

        this.iterationsPerformed = 0
        this.complete = false
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
        mazeVisual.getNodeVisual(this.originNode).color = mazeVisual.activeNodeColor

        // set visual arrow directions
        if (mazeVisual.drawArrows) {
            for (let y = 0; y < this.maze.height; y++) {
                for (let x = 0; x < this.maze.width; x++) {
                    let connection = this.directions.getDirectionOf(this.maze.nodes[y][x])
                    if (connection == null)
                        continue // node points nowhere
                    mazeVisual.getConnectionVisual(connection).arrowTo = connection.getOtherNode(this.maze.nodes[y][x])
                }
            }
        }
    }

    // performs one iteration of the algorithm
    iterate() {
        // select a random direction (connection)
        let connection = helpers.getRandomFromArray(this.originNode.connections);

        // set the origin nodes direction to this direction
        this.directions.setNodeDirection(this.originNode, connection);

        // the node in this direction becomes the new origin node
        this.originNode = connection.getOtherNode(this.originNode)
        this.directions.setNodeDirection(this.originNode, null)

        this.iterationsPerformed++
        if (this.iterationsPerformed > this.maxIterations)
            this.complete = true
    }
}

export class PrimsAlgorithm extends Algorithm {
    constructor(maze) {
        super(maze)

        this.visits = new VisitedMazeView(maze)

        this.initialize()
    }

    // initializes the maze for this algorithm
    initialize() {
        this.maze.reset()
        this.visits.reset()
        
        // choose random origin position
        this.originNode = this.maze.nodes[helpers.getRandomInt(0, this.maze.height)][helpers.getRandomInt(0, this.maze.width)]

        this.visits.visitNode(this.originNode)

        this.activeNodes = []
        this.activeNodes.push(this.originNode)

        this.complete = false
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
        mazeVisual.getNodeVisual(this.originNode).color = mazeVisual.activeNodeColor
        // this.activeNodePositions.forEach(pos => {
        //     mazeVisual.nodeVisuals[pos.y][pos.x].color = mazeVisual.activeNodeColor
        // })
    }

    // performs one iteration of the algorithm
    iterate() {
        if (this.activeNodes.length == 0)
            this.complete = true
        if (this.complete) return

        // select random active node
        let indexOfActiveNode = helpers.getRandomInt(0, this.activeNodes.length)
        let activeNode = this.activeNodes[indexOfActiveNode]

        // get connections of unvisited neighboring cells
        let possibleConnections = activeNode.connections.filter(c => {
            let other = c.getOtherNode(activeNode)
            return !this.visits.isVisited(other)
        })

        if (possibleConnections.length == 0) {
            // remove this node from the active nodes list
            this.activeNodes.splice(indexOfActiveNode, 1)
            this.iterate() // a new connection should always be made each iteration for user satisfaction
            return
        }

        // activate the connection to a random unvisited neighboring node
        let connection = helpers.getRandomFromArray(possibleConnections)
        connection.active = true

        // visit, and add node to list of active nodes
        let nextNode = connection.getOtherNode(activeNode)
        this.activeNodes.push(nextNode)
        this.visits.visitNode(nextNode)
    }
}

export class HuntAndKill extends Algorithm {
    constructor(maze) {
        super(maze)

        this.visits = new VisitedMazeView(maze)
        this.finalNode = maze.nodes[maze.height - 1][maze.width - 1]

        this.initialize()
    }

    // initializes the maze for this algorithm
    initialize() {
        this.maze.reset()
        this.visits.reset()
        
        this.originNode = this.maze.nodes[0][0]
        this.activeNode = this.originNode
        this.nodeLastHunted = this.maze.nodes[0][0] // the node position where hunt mode was exited. Hunt will resume here when dead end is reached.
        this.huntMode = false
        this.complete = false
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
        mazeVisual.getNodeVisual(this.activeNode).color = mazeVisual.activeNodeColor
    }

    // performs one iteration of the algorithm
    iterate() {
        if (this.complete) return
        
        // visit this node
        this.visits.visitNode(this.activeNode)

        // get directions of unvisited neighboring cells
        let possibleConnections = this.activeNode.connections.filter(c => {
            let other = c.getOtherNode(this.activeNode)
            return !this.visits.isVisited(other)
        })

        if (possibleConnections.length == 0) {
            // the cell is surrounded
            if (this.huntMode) {
                if (this.activeNode === this.finalNode) {
                    this.complete = true
                    return
                }

                let nodeXPos = this.activeNode.xPos + 1
                let nodeYPos = this.activeNode.yPos
                if (nodeXPos >= this.maze.width) {
                    nodeXPos = 0
                    nodeYPos++
                }
                this.activeNode = this.maze.nodes[nodeYPos][nodeXPos]
                this.nodeLastHunted = this.activeNode
            } else {
                this.huntMode = true
                this.activeNode = this.nodeLastHunted
            }
        } else {
            this.huntMode = false

            // travel to a random unvisited neighboring node
            let connection = helpers.getRandomFromArray(possibleConnections)
            connection.active = true
            this.activeNode = connection.getOtherNode(this.activeNode)
        }
    }
}

export class KruskalsAlgorithm extends Algorithm {
    constructor(maze) {
        super(maze)
        
        this.initialize()
    }

    initialize() {
        this.maze.reset()
        
        this.remainingConnections = this.getAllConnections()
        this.nodeSets = helpers.create2DArray(this.maze.width, this.maze.height, (x, y) => {
            let obj = {}
            obj.parent = obj
            return obj
        })

        this.complete = false
    }

    getAllConnections() {
        let connections = []

        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width - 1; x++) {
                connections.push(this.maze.horizontalConnections[y][x])
            }
        }

        for (let y = 0; y < this.maze.height - 1; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                connections.push(this.maze.verticalConnections[y][x])
            }
        }

        return connections
    }

    getRoot(obj) {
        while (obj != null && obj.parent != obj) {
            obj = obj.parent
        }
        return obj
    }

    iterate() {
        if (this.remainingConnections.length == 0)
            this.complete = true
        if (this.complete) return

        // select random connection
        let indexOfConnection = helpers.getRandomInt(0, this.remainingConnections.length)
        let connection = this.remainingConnections.splice(indexOfConnection, 1)[0]

        // join nodes if not part of same set
        let node1Root = this.getRoot(this.nodeSets[connection.node1.yPos][connection.node1.xPos])
        let node2Root = this.getRoot(this.nodeSets[connection.node2.yPos][connection.node2.xPos])
        if (node1Root !== node2Root) {
            // join
            connection.active = true
            node1Root.parent = node2Root
        } else {
            this.iterate() // for user satisfaction, each iteration should activate a connection. However this line can be removed
        }
    }
}

export class AldousBroder extends Algorithm {
    constructor(maze) {
        super(maze)
        this.visits = new VisitedMazeView(maze)
        this.totalNumNodes = this.maze.width * this.maze.height
        this.initialize()
    }

    initialize() {
        this.maze.reset()
        this.visits.reset()
        this.activeNode = this.maze.nodes[0][0]
        this.numNodesVisited = 0
        this.complete = false
    }

    updateVisualMazeValues(mazeVisual) {
        mazeVisual.resetNodeVisuals()
        mazeVisual.getNodeVisual(this.activeNode).color = mazeVisual.activeNodeColor
    }

    iterate() {
        if (this.complete) return

        // travel in random direction
        let connection = helpers.getRandomFromArray(this.activeNode.connections)
        this.activeNode = connection.getOtherNode(this.activeNode)

        // carve a path if node in this direction hasn't been visited
        if (!this.visits.isVisited(this.activeNode)) {
            this.visits.visitNode(this.activeNode)
            this.numNodesVisited++
            connection.active = true
        }
        
        if (this.numNodesVisited >= this.totalNumNodes)
            this.complete = true
    }
}