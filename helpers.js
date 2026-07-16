export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min); // min inclusive, max exclusive
}

export function create2DArray(width, height, callback = () => null) {
    let arr = []
    for (let y = 0; y < height; y++) {
        arr.push([])
        for (let x = 0; x < width; x++) {
            arr[y].push(callback(x, y))       
        }
    }
    return arr
}

export function popRandom(arr) {
  if (arr.length === 0) return undefined;

  const index = Math.floor(Math.random() * arr.length);
  return arr.splice(index, 1)[0];
}

export function getRandomFromArray(arr) {
    if (arr.length == 0)
        return null

    return arr[getRandomInt(0, arr.length)]
}