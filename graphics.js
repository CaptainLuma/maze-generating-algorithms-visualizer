import * as helpers from "./helpers.js"

export class Color {
    constructor(r, g, b, a = 1) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    static red()    { return new Color(255, 0, 0) }
    static green()  { return new Color(0, 255, 0) }
    static blue()   { return new Color(0, 0, 255) }
    static white()  { return new Color(255, 255, 255) }
    static black()  { return new Color(0, 0, 0) }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }

    getCopy() {
        return new Color(this.r, this.g, this.b, this.a)
    }
}

export class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.toString();
        ctx.fill();
        ctx.closePath();
    }
}

export class NodeVisualInfo {
    constructor(color) {
        this.color = color
    }
}

export class ConnectionVisualInfo {
    constructor(color) {
        this.color = color
        this.arrowTo = null
    }
}

export class MazeVisual {
    constructor(maze) {
        this.maze = maze
        this.highlightOrigin = false
        this.marginY = 10
        this.backgroundColor = new Color(30, 30, 30, 0)
        this.color = new Color(0, 200, 255)
        this.activeNodeColor = Color.red()
        this.drawArrows = true

        this.nodeVisuals = 
            helpers.create2DArray(this.maze.width, this.maze.height, () => new NodeVisualInfo(this.color.getCopy()))
        this.horizontalConnectionVisuals = 
            helpers.create2DArray(this.maze.width - 1, this.maze.height, () => new ConnectionVisualInfo(this.color.getCopy()))
        this.verticalConnectionVisuals = 
            helpers.create2DArray(this.maze.width, this.maze.height - 1, () => new ConnectionVisualInfo(this.color.getCopy()))
    }

    resetNodeVisuals() {
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                this.nodeVisuals[y][x].color = this.color.getCopy()
            }
        }

        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width - 1; x++) {
                this.horizontalConnectionVisuals[y][x].color = this.color.getCopy()
                this.horizontalConnectionVisuals[y][x].arrowTo = null
            }
        }

        for (let y = 0; y < this.maze.height - 1; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                this.verticalConnectionVisuals[y][x].color = this.color.getCopy()
                this.verticalConnectionVisuals[y][x].arrowTo = null
            }
        }
    }

    getNodeVisual(node) {
        return this.nodeVisuals[node.yPos][node.xPos]
    }

    getConnectionVisual(connection) {
        if (connection.node1.xPos == connection.node2.xPos) {
            // connection is vertical
            return this.verticalConnectionVisuals[connection.node1.yPos][connection.node1.xPos]
        } else {
            // connection is horizontal
            return this.horizontalConnectionVisuals[connection.node1.yPos][connection.node1.xPos]
        }
    }

    calculateValues(ctx) {
        this.size = (ctx.canvas.height - this.marginY * 2) / this.maze.height;
        this.marginX = Math.round((ctx.canvas.width - this.size * this.maze.width) / 2);
        // size = Math.round(size);
        this.lineWidth = this.size / 15;
        this.nodeRadius = this.lineWidth * 1.5;
        this.arrowSize = this.lineWidth * 2;
        this.connectionLengthMultiplier = 1;

        if (this.drawArrows) this.connectionLengthMultiplier = 0.8
    }

    draw(ctx) {
        // calculate values
        this.calculateValues(ctx)

        // draw background
        // ctx.fillStyle = this.backgroundColor.toString()
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                let xPos = x * this.size + this.marginX + this.size / 2;
                let yPos = y * this.size + this.marginY + this.size / 2;

                let node = this.maze.nodes[y][x];
                let nodeVisualData = this.nodeVisuals[y][x];

                // draw connections
                if (x < this.maze.width - 1 && this.maze.horizontalConnections[y][x].active) {
                    // draw horizontal connection
                    let connectionVisualData = this.horizontalConnectionVisuals[y][x]
                    ctx.fillStyle = connectionVisualData.color.toString()
                    ctx.strokeStyle = connectionVisualData.color.toString()

                    if (this.drawArrows && connectionVisualData.arrowTo != null) {
                        // draw arrow
                        if (connectionVisualData.arrowTo === node)
                            this.drawArrowFrom(xPos + this.size, yPos, -1, 0, ctx)
                        else
                            this.drawArrowFrom(xPos, yPos, 1, 0, ctx)
                    } else {
                        // don't draw arrow
                        ctx.beginPath();
                        ctx.lineWidth = this.lineWidth;
                        ctx.moveTo(xPos, yPos);
                        ctx.lineTo(xPos + this.size, yPos);
                        ctx.stroke();
                    }                    
                }
                
                if (y < this.maze.height - 1 && this.maze.verticalConnections[y][x].active) {
                    // draw vertical connection
                    let connectionVisualData = this.verticalConnectionVisuals[y][x]
                    ctx.fillStyle = connectionVisualData.color.toString()
                    ctx.strokeStyle = connectionVisualData.color.toString()

                    if (this.drawArrows && connectionVisualData.arrowTo != null) {
                        // draw arrow
                        if (connectionVisualData.arrowTo === node)
                            this.drawArrowFrom(xPos, yPos + this.size, 0, -1, ctx)
                        else
                            this.drawArrowFrom(xPos, yPos, 0, 1, ctx)
                    } else {
                        // don't draw arrow
                        ctx.beginPath();
                        ctx.lineWidth = this.lineWidth;
                        ctx.moveTo(xPos, yPos);
                        ctx.lineTo(xPos, yPos + this.size);
                        ctx.stroke();
                    }
                }

                // draw node
                ctx.fillStyle = nodeVisualData.color.toString()
                ctx.beginPath();
                ctx.arc(xPos, yPos, this.nodeRadius, 0, 2*Math.PI);
                ctx.fill();
            }
        }
    }

    drawArrowFrom(xPos, yPos, directionX, directionY, ctx) {
        // draw arrow triangle      
        let triangleX = xPos + directionX * this.size * this.connectionLengthMultiplier * 1.1;
        let triangleY = yPos + directionY * this.size * this.connectionLengthMultiplier * 1.1;
        
        ctx.beginPath();
        ctx.moveTo(triangleX, triangleY);

        triangleX = triangleX - directionX * this.arrowSize;
        triangleY = triangleY - directionY * this.arrowSize;

        if (directionY == 0)  triangleY = triangleY - this.arrowSize;
        else                        triangleX = triangleX - this.arrowSize;

        ctx.lineTo(triangleX, triangleY);

        if (directionY == 0)  triangleY = triangleY + this.arrowSize * 2;
        else                        triangleX = triangleX + this.arrowSize * 2;

        ctx.lineTo(triangleX, triangleY);
        ctx.fill();

        // draw line
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.moveTo(xPos, yPos);
        ctx.lineTo(xPos + directionX * this.size * 0.8, yPos + directionY * this.size * 0.8);
        ctx.stroke();
    }
}