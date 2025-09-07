
function getColorDistance(c1: [number, number, number, number], c2: [number, number, number, number]): number {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getPixel(imageData: ImageData, x: number, y: number): [number, number, number, number] {
    const i = (y * imageData.width + x) * 4;
    return [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]];
}

export function floodFill(imageData: ImageData, startX: number, startY: number, tolerance: number): ImageData {
    const { width, height } = imageData;
    const maskDataArray = new Uint8ClampedArray(width * height * 4);
    const startColor = getPixel(imageData, startX, startY);
    
    const q: [number, number][] = [[startX, startY]];
    const visited = new Set<number>();
    const startIndex = startY * width + startX;
    
    if (visited.has(startIndex)) return new ImageData(maskDataArray, width, height);
    visited.add(startIndex);

    while (q.length > 0) {
        const [x, y] = q.shift()!;
        
        const i = (y * width + x) * 4;
        maskDataArray[i] = 255;      // R
        maskDataArray[i+1] = 255;    // G
        maskDataArray[i+2] = 255;    // B
        maskDataArray[i+3] = 255;    // A (White, opaque)

        const neighbors: [number, number][] = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
            const nIdx = ny * width + nx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(nIdx)) {
                visited.add(nIdx);
                const neighborColor = getPixel(imageData, nx, ny);
                if (getColorDistance(startColor, neighborColor) <= tolerance) {
                    q.push([nx, ny]);
                }
            }
        }
    }

    return new ImageData(maskDataArray, width, height);
}
