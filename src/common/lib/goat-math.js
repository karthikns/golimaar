const GoatMath = {};

module.exports = GoatMath;

(function GoatMathNamespace() {
    // Input:
    //      x1, y1, x2, y2
    // Output:
    //      <num>
    GoatMath.DistanceSquare = function DistanceSquare(x1, y1, x2, y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    };

    // Input:
    //      x1, y1, x2, y2
    // Output:
    //      <num>
    GoatMath.Distance = function Distance(x1, y1, x2, y2) {
        return Math.sqrt(GoatMath.DistanceSquare(x1, y1, x2, y2));
    };

    // Input:
    //      circle1: { x: <num>, y: <num>, r: <num> }
    //      circle2: { x: <num>, y: <num>, r: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoCirclesCollide = function DoCirclesCollide(circle1, circle2) {
        const distanceBetweenCentersSquare = this.DistanceSquare(circle1.x, circle1.y, circle2.x, circle2.y);

        const sumOfRadius = circle1.r + circle2.r;
        const sumOfRadiusSquare = sumOfRadius * sumOfRadius;

        if (distanceBetweenCentersSquare < sumOfRadiusSquare) {
            return true;
        }

        return false;
    };

    // Input:
    //      point: { x: <num>, y: <num>, r: <num> }
    //      boundingBoxTopLeftPoint: { x: <num>, y: <num>, r: <num> }
    //      boundingBoxDimensions: { x: <num>, y: <num>, r: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoesPointLeaveBoundingBox = function DoesPointLeaveBoundingBox(
        point,
        boundingBoxTopLeftPoint,
        boundingBoxDimensions) {

        if(point.x > boundingBoxTopLeftPoint.x + boundingBoxDimensions.x)
            return true;

        if(point.x < boundingBoxTopLeftPoint.x)
            return true;

        if(point.y > boundingBoxTopLeftPoint.y + boundingBoxDimensions.y)
            return true;

        if(point.y < boundingBoxTopLeftPoint.y)
            return true;

        return false;
    }

    // Input:
    //      position: { x: <num>, y: <num>, r: <num> }
    //      radius: <num>
    //      boundingBoxTopLeftPoint: { x: <num>, y: <num>, r: <num> }
    //      boundingBoxDimensions: { x: <num>, y: <num>, r: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoesCircleLeaveBoundingBox = function DoesCircleLeaveBoundingBox(
        position,
        radius,
        boundingBoxTopLeftPoint,
        boundingBoxDimensions) {

        boundingBoxTopLeftPoint.x -= radius;
        boundingBoxTopLeftPoint.y -= radius;
        boundingBoxDimensions.x += (2 * radius);
        boundingBoxDimensions.y += (2 * radius);

        return GoatMath.DoesPointLeaveBoundingBox(position, boundingBoxTopLeftPoint, boundingBoxDimensions);
    }

    // Input:
    //      x
    //      y
    // Output:
    //      { x: <num>, y: <num> }
    GoatMath.NewVec = function NewVec(x, y) {
        if (!x) {
            x = 0;
        }

        if (!y) {
            y = 0;
        }

        return { x: x, y: y };
    }

    // Input:
    //      vector: { x: <num>, y: <num> }
    // Output:
    //      { x: <num>, y: <num> }
    GoatMath.NormalizeVec = function NormalizeVec(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        const normalizedVector = { x: vector.x, y: vector.y };
        if (magnitude === 0) {
            return normalizedVector;
        }

        normalizedVector.x /= magnitude;
        normalizedVector.y /= magnitude;
        return normalizedVector;
    };

    // Input:
    //      vector: { x: <num>, y: <num> }
    //      scale: <num>
    // Output:
    //      { x: <num>, y: <num> }
    GoatMath.ScaleVec = function ScaleVec(vector, scale) {
        return { x: vector.x * scale, y: vector.y * scale };
    };

    // Input:
    //      vectorOne: { x: <num>, y: <num> }
    //      vectorTwo: { x: <num>, y: <num> }
    // Output:
    //      { x: <num>, y: <num> }
    GoatMath.AddVec = function AddVec(vectorOne, vectorTwo) {
        return { x: vectorOne.x + vectorTwo.x, y: vectorOne.y + vectorTwo.y };
    };

    // Input:
    //      vectorOne: { x: <num>, y: <num> }
    //      vectorTwo: { x: <num>, y: <num> }
    // Output:
    //      { x: <num>, y: <num> }
    GoatMath.SubVec = function SubVec(vectorOne, vectorTwo) {
        return { x: vectorOne.x - vectorTwo.x, y: vectorOne.y - vectorTwo.y };
    };
})();
