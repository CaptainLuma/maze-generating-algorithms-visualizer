import * as helpers from "./helpers.js"
import { Color, Circle, MazeVisual } from "./graphics.js"
import { Node, Maze } from "./maze.js"
import { RecursiveBacktracking, OriginShift, PrimsAlgorithm, HuntAndKill, KruskalsAlgorithm, AldousBroder } from "./algorithms.js"

// globals
const maximumIterationLimitForInstantPlay = 300000
let debug = false

// html elements
const centerElement = document.getElementById("center")
const algorithmSelectElement = document.getElementById("algorithm_select")
const mazeSizeInput = document.getElementById("maze_size")
const resetButton = document.getElementById("button_reset")
const stepButton = document.getElementById("button_step")
const speedSelectElement = document.getElementById("speed_select")
const playPauseButton = document.getElementById("play_pause_button")
const algorithmInfoCloseButton = document.getElementById("algorithm_info_close_button")
const algorithmInfoOverlay = document.getElementById("algorithm_info_overlay")
const openAlgorithmInfoButton = document.getElementById("open_algorithm_info_button")

const algInfoElements = {
    algNotFound: document.getElementById("alg_not_found"),
    recursiveBacktracking: document.getElementById("alg_info_recursive_backtracking"),
    originShift: document.getElementById("alg_info_origin_shift"),
    prims: document.getElementById("alg_info_prims"),
    huntAndKill: document.getElementById("alg_info_hunt_and_kill"),
    kruskals: document.getElementById("alg_kruskals"),
    aldousBroder: document.getElementById("alg_aldous_broder"),
}

// canvas initialization
const cnv = document.getElementById('canvas')
const ctx = cnv.getContext('2d')

// animation variables
const defaultAnimationFrameLength = 0.125
let instantPlay = false
let isAnimationPlaying = false
let lastTime = null
let animationFrameLength = defaultAnimationFrameLength
let timeUntilNextFrame = 0

// maze and alg initialization
// let maze = new DirectedMaze(10, 10)
// let algorithm = new RecursiveBacktracking(maze)
// algorithm.initialize()
// let mazeVisual = new DirectedMazeVisual(maze)
// algorithm.updateVisualMazeValues(mazeVisual)
// rescaleCanvas()

let maze = new Maze(10, 10)
let algorithm = new RecursiveBacktracking(maze)
algorithm.initialize()
let mazeVisual = new MazeVisual(maze)
algorithm.updateVisualMazeValues(mazeVisual)
rescaleCanvas()

// keyboard shortcuts (temp)
document.addEventListener("keypress", keyPressHandler)
function keyPressHandler(event) {
    // if (!debug) return
    if (event.key == "a") [
        console.log(algorithm)
    ]
}

// algorithm select functionality
algorithmSelectElement.addEventListener("change", () => selectAlgorithm(algorithmSelectElement.value));
function selectAlgorithm(alg) {
    pause()
    mazeVisual.resetNodeVisuals()
    switch (alg) {
        case "recursive_backtracking":
            algorithm = new RecursiveBacktracking(maze)
            break
        case "prims_algorithm":
            algorithm = new PrimsAlgorithm(maze)
            break
        case "origin_shift":
            algorithm = new OriginShift(maze)
            break
        case "hunt_and_kill":
            algorithm = new HuntAndKill(maze)
            break
        case "kruskals_algorithm":
            algorithm = new KruskalsAlgorithm(maze)
            break
        case "aldous_broder":
            algorithm = new AldousBroder(maze)
            break
        default:
            console.log("alg not recognized");
    }

    algorithm.updateVisualMazeValues(mazeVisual)
    mazeVisual.draw(ctx)
}

// maze size change functionality
mazeSizeInput.addEventListener("change", () => {
    if (mazeSizeInput.value < 2)
        return
    if (mazeSizeInput.value > 500)
        return
    if (maze.width == mazeSizeInput.value)
        return

    maze = new Maze(mazeSizeInput.value, mazeSizeInput.value)
    mazeVisual = new MazeVisual(maze)
    selectAlgorithm(algorithmSelectElement.value)
})

resetButton.addEventListener("click", () => {
    algorithm.initialize()
    algorithm.updateVisualMazeValues(mazeVisual)
    mazeVisual.draw(ctx)
})

stepButton.addEventListener("click", () => {
    algorithm.iterate()
    algorithm.updateVisualMazeValues(mazeVisual)
    mazeVisual.draw(ctx)
})

// scale canvas to fit window size
window.addEventListener("resize", rescaleCanvas)
function rescaleCanvas() {
    // const rect = centerElement.getBoundingClientRect()
    const rect = {
        width: centerElement.offsetWidth,
        height: centerElement.offsetHeight
    }
    
    // perform calculation
    const ratio = 1
    const invRatio = 1
    
    if (rect.height * ratio > rect.width) {
        // container is taller than canvas ratio
        cnv.width = rect.width
        cnv.height = rect.width * invRatio
    } else {
        // container is wider than canvas ratio
        cnv.height = rect.height
        cnv.width = rect.height * ratio
    }

    // redraw stuff
    mazeVisual.draw(ctx)
}

function getElementForAlgorithm(algString) {
        switch (algString) {
            case "recursive_backtracking":
                return algInfoElements.recursiveBacktracking
            case "prims_algorithm":
                return algInfoElements.prims
            case "origin_shift":
                return algInfoElements.originShift
            case "hunt_and_kill":
                return algInfoElements.huntAndKill
            case "kruskals_algorithm":
                return algInfoElements.kruskals
            case "aldous_broder":
                return algInfoElements.aldousBroder
            default:
                return algInfoElements.algNotFound
        }
    }

openAlgorithmInfoButton.addEventListener("click", () => {
    // hide current alg info text
    Object.values(algInfoElements).forEach(el => {
        el.classList.add("hidden")
    })

    // show info panel
    algorithmInfoOverlay.classList.remove("hidden")

    // show the info for the selected algorithm
    getElementForAlgorithm(algorithmSelectElement.value).classList.remove("hidden")
})

algorithmInfoCloseButton.addEventListener("click", () => {
    algorithmInfoOverlay.classList.add("hidden")
})

speedSelectElement.addEventListener("change", (event) => {
    if (speedSelectElement.value == "instant") {
        instantPlay = true
        return
    }

    instantPlay = false
    let speedMultiplier = parseFloat(speedSelectElement.value)
    animationFrameLength = defaultAnimationFrameLength / speedMultiplier
})

playPauseButton.addEventListener("click", () => {
    if (instantPlay) {
        pause()
        algorithm.solveMaze(maximumIterationLimitForInstantPlay)
        algorithm.updateVisualMazeValues(mazeVisual)
        mazeVisual.draw(ctx)
    } else {
        isAnimationPlaying ? pause() : play()
    }
})

function play() {
    // play
    isAnimationPlaying = true
    document.getElementById("play_icon").classList.add("hidden")
    document.getElementById("pause_icon").classList.remove("hidden")
}

function pause() {
    // pause
    isAnimationPlaying = false
    document.getElementById("play_icon").classList.remove("hidden")
    document.getElementById("pause_icon").classList.add("hidden")
}

requestAnimationFrame(animationLoop)
function animationLoop(timestamp) {
    if (lastTime === null) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (timeUntilNextFrame <= 0) {
        timeUntilNextFrame = animationFrameLength
        AnimationFrame(deltaTime)
    }

    timeUntilNextFrame -= deltaTime
    requestAnimationFrame(animationLoop);
}

function AnimationFrame(deltaTime) {
    if (isAnimationPlaying) {
        if (algorithm.complete && algorithm.type != "modifier")
            algorithm.initialize()

        if (instantPlay) {
            algorithm.solveMaze(maximumIterationLimitForInstantPlay)
            pause()
        }

        algorithm.iterate()
        algorithm.updateVisualMazeValues(mazeVisual)
        mazeVisual.draw(ctx)

        if (algorithm.complete && algorithm.type != "modifier") {
            pause()
        }
    }
}