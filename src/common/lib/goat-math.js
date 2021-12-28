const GoatMath = {};

module.exports = GoatMath;

(function GoatMathNamespace() {
    // Input:
    //
    // Output:
    //      <num>
    GoatMath.DistanceSquare = function DistanceSquare(vectorOne, vectorTwo) {
        const xDifferential = vectorTwo.x - vectorOne.x;
        const yDifferential = vectorTwo.y - vectorOne.y;
        return (xDifferential) * (xDifferential) + (yDifferential) * (yDifferential);
    };

    // Input:
    //
    // Output:
    //      <num>
    GoatMath.Distance = function Distance(vectorOne, vectorTwo) {
        return Math.sqrt(GoatMath.DistanceSquare(vectorOne, vectorTwo));
    };

    // Input:
    //      circleOne: { center: { x: <num>, y: <num> }, radius: <num> }
    //      circleTwo: { center: { x: <num>, y: <num> }, radius: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoCirclesCollide = function DoCirclesCollide(circleOne, circleTwo) {
        const distanceBetweenCentersSquare = this.DistanceSquare(circleOne.center, circleTwo.center);

        const sumOfRadius = circleOne.radius + circleTwo.radius;
        const sumOfRadiusSquare = sumOfRadius * sumOfRadius;

        if (distanceBetweenCentersSquare < sumOfRadiusSquare) {
            return true;
        }

        return false;
    };

    // Input:
    //      point: { x: <num>, y: <num> }
    //      boundingBoxTopLeftPoint: { x: <num>, y: <num> }
    //      boundingBoxDimensions: { x: <num>, y: <num> }
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

    GoatMath.SnapCircleToBoundingBox = function SnapCircleToBoundingBox(
        circle,
        boundingBoxTopLeftPoint,
        boundingBoxDimensions) {

        circle.center.x = Math.max(circle.center.x, boundingBoxTopLeftPoint.x + circle.radius);
        circle.center.x = Math.min(circle.center.x, boundingBoxTopLeftPoint.x + boundingBoxDimensions.x - circle.radius);

        circle.center.y = Math.max(circle.center.y, boundingBoxTopLeftPoint.y + circle.radius);
        circle.center.y = Math.min(circle.center.y, boundingBoxTopLeftPoint.y + boundingBoxDimensions.y - circle.radius);
    }

    // Input:
    //      position: { center: { x: <num>, y: <num> }, r: <num> }
    //      radius: <num>
    //      boundingBoxTopLeftPoint: { x: <num>, y: <num> }
    //      boundingBoxDimensions: { x: <num>, y: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoesCircleLeaveBoundingBox = function DoesCircleLeaveBoundingBox(
        circle,
        boundingBoxTopLeftPoint,
        boundingBoxDimensions) {

        boundingBoxTopLeftPoint.x -= circle.radius;
        boundingBoxTopLeftPoint.y -= circle.radius;
        boundingBoxDimensions.x += (2 * circle.radius);
        boundingBoxDimensions.y += (2 * circle.radius);

        return GoatMath.DoesPointLeaveBoundingBox(circle.center, boundingBoxTopLeftPoint, boundingBoxDimensions);
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
