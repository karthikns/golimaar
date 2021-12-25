const GoatDiagnostics = require('./lib/goat-diagnostics');
const GoatMath = require('./lib/goat-math');
const GoatEnhancementHelpers = require('./goat-enhancement-helpers');

const GoatGame = {};

module.exports = GoatGame;

(function GoatGameNamespace() {
    // Configuration
    const dogRadius = 10;
    const dogSpeed = 500; // units per second
    const diagnosticsIntervalMilliseconds = 5000;
    const goalPostRadius = 75;
    const scoreDecrementInterval = 3500;

    GoatGame.board = { width: 800, height: 600 };

    GoatGame.onRenderState = function RenderStateDummy() {};

    let telemetry;
    GoatGame.SetTelemetryObject = function SetTelemetryObject(goatTelemetry) {
        telemetry = goatTelemetry;
    };

    const world = {
        dogs: {},
        goats: [],
        goalPosts: [],
    };

    GoatGame.AddDog = function AddDog(socketId, myName, teamId) {
        const randGoalPost = world.goalPosts[teamId];

        world.dogs[socketId] = {
            x: randGoalPost.spawnPoint.x,
            y: randGoalPost.spawnPoint.y,
            r: dogRadius,
            color: randGoalPost.color,
            name: `${myName}`,
            spriteFrame: {},
            input: {
                key: {
                    left: false,
                    right: false,
                    top: false,
                    bottom: false,
                },
                mouseTouch: { x: 0, y: 0 },
                isKeyBasedMovement: true,
            },
        };

        ReportEvent('dog-added', 'id', `${socketId}`, 'team', teamId);
    };

    GoatGame.RemoveDog = function RemoveDog(socketId) {
        delete world.dogs[socketId];
        ReportEvent('dog-removed', 'id', socketId);
    };

    GoatGame.RemoveAllDogs = function RemoveAllDogs() {
        world.dogs = {};
        // TODO: Add telemetry
    };

    GoatGame.SetInputKeyState = function SetInputKeyState(socketId, keyInput) {
        const dog = world.dogs[socketId];
        if (dog) {
            dog.input.key.left = keyInput.left;
            dog.input.key.right = keyInput.right;
            dog.input.key.up = keyInput.up;
            dog.input.key.down = keyInput.down;
        }
    };

    GoatGame.SetMouseTouchState = function SetMouseTouchState(socketId, mouseTouchInput) {
            const dog = world.dogs[socketId] || {};
            dog.input.mouseTouch = mouseTouchInput;
    };

    GoatGame.ResetGoats = function ResetGoats() {
    };

    GoatGame.ResetScore = function ResetScore() {
        world.goalPosts.forEach((goalPost) => {
            goalPost.numberOfGoatsTouched = 0;
        });
    };

    function AddGoalPosts(goalPosts) {
        goalPosts.push({
            x: 0,
            y: 0,
            r: goalPostRadius,
            color: 'crimson',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: 100,
                y: 100,
            },
        });

        goalPosts.push({
            x: GoatGame.board.width,
            y: 0,
            r: goalPostRadius,
            color: 'royalblue',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: GoatGame.board.width - 100,
                y: 100,
            },
        });

        goalPosts.push({
            x: GoatGame.board.width,
            y: GoatGame.board.height,
            r: goalPostRadius,
            color: 'yellowgreen',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: GoatGame.board.width - 100,
                y: GoatGame.board.height - 100,
            },
        });

        goalPosts.push({
            x: 0,
            y: GoatGame.board.height,
            r: goalPostRadius,
            color: 'orange',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: 100,
                y: GoatGame.board.height - 100,
            },
        });
    }

    function InitializeGame() {
        AddGoalPosts(world.goalPosts);
    }
    InitializeGame();

    function DontAllowObjectToGoBeyondTheBoard(object) {
        if (object.x - object.r < 0) {
            object.x = object.r;
        }

        if (object.y - object.r < 0) {
            object.y = object.r;
        }

        if (object.x + object.r > GoatGame.board.width) {
            object.x = GoatGame.board.width - object.r;
        }

        if (object.y + object.r > GoatGame.board.height) {
            object.y = GoatGame.board.height - object.r;
        }
    }

    function MoveDog(dog, socketId, distanceToMove) {
        var moveDirection = { x: 0, y: 0 };
        if (dog.input.key.left) {
            moveDirection.x += -1;
        }
        if (dog.input.key.up) {
            moveDirection.y += -1;
        }
        if (dog.input.key.right) {
            moveDirection.x += 1;
        }
        if (dog.input.key.down) {
            moveDirection.y += 1;
        }

        moveDirection = GoatMath.NormalizeVec(moveDirection);
        moveDirection = GoatMath.ScaleVec(moveDirection, distanceToMove);
        dog.x += moveDirection.x;
        dog.y += moveDirection.y;

        DontAllowObjectToGoBeyondTheBoard(dog);
    }

    function MoveDogs(dogs, distanceToMove) {
        for (const id in dogs) {
            MoveDog(dogs[id], id, distanceToMove);
        }
    }

    // Physics

    // WARNING: DO NOT CHANGE THIS VALUE
    const physicsInterval = 15; // milliseconds

    var physicsTime = new Date();
    var physicsPerfCounter = new GoatDiagnostics.PerfCounter();
    var scoreDecrementTimer = new Date();

    // Keep logic to a minimal here
    setInterval(function () {
        var newPhysicsTime = new Date();
        var actualInterval = newPhysicsTime - physicsTime;
        physicsTime = newPhysicsTime;

        physicsPerfCounter.Stop();
        physicsPerfCounter.Start();

        // distance = velocity * time
        const dogDistanceToMove = (dogSpeed * actualInterval) / 1000;
        MoveDogs(world.dogs, dogDistanceToMove);

        if (physicsTime - scoreDecrementTimer > scoreDecrementInterval) {
            scoreDecrementTimer = physicsTime;
            world.goalPosts.forEach((goalPost) => {
            });
        }
    }, physicsInterval);

    // Render
    var renderPerfCounter = new GoatDiagnostics.PerfCounter();
    const renderFps = 60;
    const renderInterval = 1000 / renderFps;
    setInterval(function () {
        renderPerfCounter.Stop();
        renderPerfCounter.Start();

        GoatGame.onRenderState(world);
    }, renderInterval);

    function GetPrintableNumber(number) {
        return Math.round(number * 100) / 100;
    }

    // Diagnostics
    setInterval(function () {
        const serverRendersPerSecond = GetPrintableNumber(1000 / renderPerfCounter.GetAverageTime());
        renderPerfCounter.Clear();

        const physicsLoopAverageIterationIntervalMs = GetPrintableNumber(physicsPerfCounter.GetAverageTime());
        physicsPerfCounter.Clear();

        console.log(`--Diagnostics--`);
        console.log(`    Server render FPS: ${serverRendersPerSecond}`);
        console.log(`    Server physics loop average interval (ms): ${physicsLoopAverageIterationIntervalMs}`);

        ReportEvent(
            'physics-graphics-health',
            'physics-interval-average',
            physicsLoopAverageIterationIntervalMs,
            'graphics-fps-average',
            serverRendersPerSecond
        );
    }, diagnosticsIntervalMilliseconds);

    function ReportEvent(eventName, paramName1, paramValue1, paramName2, paramValue2, paramName3, paramValue3) {
        if (!telemetry) {
            return;
        }

        telemetry.ReportEvent(
            new Date(),
            eventName,
            paramName1,
            paramValue1,
            paramName2,
            paramValue2,
            paramName3,
            paramValue3
        );
    }
})();
