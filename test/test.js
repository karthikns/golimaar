let assert = require("assert");
let GoatMath = require("../src/common/lib/goat-math");

describe("GoatMath.NormalizeVec", function () {
    describe("on input vector with magnitude 0", function () {
        it("should do nothing to input vector", function () {
            const vector = GoatMath.NewVec(0, 0);
            const result = GoatMath.NormalizeVec(vector);
            assert.equal(result.x, 0);
            assert.equal(result.y, 0);
        });
    });

    describe("on input vector with magnitude 1", function () {
        it("should do nothing to input vector", function () {
            const vector = GoatMath.NewVec(1, 0);
            const result = GoatMath.NormalizeVec(vector);
            assert.equal(result.x, 1);
            assert.equal(result.y, 0);
        });
    });

    describe("on input vector with magnitude greater than 1", function () {
        it("should reduce magnitude to 1", function () {
            const vector = GoatMath.NewVec(5, 5);
            const result = GoatMath.NormalizeVec(vector);
            assert.equal(result.x.toPrecision(3), 0.707);
            assert.equal(result.y.toPrecision(3), 0.707);
        });
    });

    describe("on input vector with magnitude less than 1", function () {
        it("should reduce magnitude to 1", function () {
            const vector = GoatMath.NewVec(-0.5, -0.5);
            const result = GoatMath.NormalizeVec(vector);
            assert.equal(result.x.toPrecision(3), -0.707);
            assert.equal(result.y.toPrecision(3), -0.707);
        });
    });
});

describe("GoatMath.ScaleVec", function () {
    describe("on non-zero magnitude vector and greater than 1 scaling", function () {
        it("should scale by the given amount", function () {
            const vector = GoatMath.NewVec(1, -1);
            const result = GoatMath.ScaleVec(vector, 5);
            assert.equal(result.x, 5);
            assert.equal(result.y, -5);
        });
    });

    describe("on non-zero magnitude vector and 1 scaling", function () {
        it("should not change input vector", function () {
            const vector = GoatMath.NewVec(-1, -1);
            const result = GoatMath.ScaleVec(vector, 1);
            assert.equal(result.x, -1);
            assert.equal(result.y, -1);
        });
    });

    describe("on non-zero magnitude vector and negative scaling", function () {
        it("should reverse direction of input vector", function () {
            const vector = GoatMath.NewVec(-1, 1);
            const result = GoatMath.ScaleVec(vector, -1);
            assert.equal(result.x, 1);
            assert.equal(result.y, -1);
        });
    });
});

describe("GoatMath.DoCirclesCollide", function () {
    describe("on two non-colliding circles", function () {
        it("should return false", function () {
            const circleOne = { center: { x: 1, y: 1}, radius: 1 };
            const circleTwo = { center: { x: 3, y: 1}, radius: 1 };
            assert.equal(GoatMath.DoCirclesCollide(circleOne, circleTwo), false);
        });
    });

    describe("on two colliding circles", function () {
        it("should return true", function () {
            const circleOne = { center: { x: 1, y: 1}, radius: 1 };
            const circleTwo = { center: { x: 2.99, y: 1}, radius: 1 };
            assert.equal(GoatMath.DoCirclesCollide(circleOne, circleTwo), true);
        });
    });
});
