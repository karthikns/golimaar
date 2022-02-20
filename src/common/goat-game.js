const GoatDiagnostics = require('./lib/goat-diagnostics');
const GoatMath = require('./lib/goat-math');
const GoatEnhancementHelpers = require('./goat-enhancement-helpers');

const GoatGame = {};

module.exports = GoatGame;

(function GoatGameNamespace() {
    // Configuration
    const dogRadius = 20;
    const dogSpeed = 500; // units per second
    const diagnosticsIntervalMilliseconds = 5000;
    const goalPostRadius = 75;
    const bulletSpeed = 500;
    const bulletRadius = 3;
    const firingSpeed = 3;
    const shotsAvailable = 1;
    const bulletLifespan = 5;

    const gameStartDate = new Date();
    function GetGameTimeSeconds() {
        return (new Date() - gameStartDate) / 1000;
    }

    GoatGame.onRenderState = function RenderStateDummy() {};

    let telemetry;
    GoatGame.SetTelemetryObject = function SetTelemetryObject(goatTelemetry) {
        telemetry = goatTelemetry;
    };

    const world = {
        board: { width: 800, height: 600 },
        dogs: {},
        goalPosts: [],
        bullets: [],
    };

    GoatGame.GetBoardDimensions = function GetBoardDimensions() {
        return world.board;
    }

    GoatGame.AddDog = function AddDog(socketId, myName, teamId) {
        const randGoalPost = world.goalPosts[teamId];

        world.dogs[socketId] = {
            circle: {
                center: GoatMath.NewVec(randGoalPost.spawnPoint.x, randGoalPost.spawnPoint.y),
                radius: dogRadius,
            },
            direction: GoatMath.NewVec(1, 0),
            teamId: teamId,
            color: randGoalPost.color,
            name: `${myName}`,
            hp: 1,
            input: {
                key: {
                    left: false,
                    right: false,
                    top: false,
                    bottom: false,
                    shoot: false,
                },
                mouseTouch: GoatMath.NewVec(0, 0),
                isKeyBasedMovement: true,
            },
            gun: {
                bulletColor: randGoalPost.color,
                bulletSpeed: bulletSpeed,
                bulletRadius: bulletRadius,
                firingSpeed: firingSpeed,
                shotsAvailable: shotsAvailable,
                lastFiredTime: 0,
                bulletLifespan: bulletLifespan,
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
        if (!world.dogs.hasOwnProperty(socketId)) {
            return;
        }

        const dog = world.dogs[socketId];
        if (dog) {
            dog.input.key.left = keyInput.left;
            dog.input.key.right = keyInput.right;
            dog.input.key.up = keyInput.up;
            dog.input.key.down = keyInput.down;
            dog.input.key.shoot = keyInput.shoot;
        }
    };

    GoatGame.SetMouseTouchState = function SetMouseTouchState(socketId, mouseTouchInput) {
        if (!world.dogs.hasOwnProperty(socketId)) {
            return;
        }

        const dog = world.dogs[socketId];
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
            x: world.board.width,
            y: 0,
            r: goalPostRadius,
            color: 'royalblue',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: world.board.width - 100,
                y: 100,
            },
        });

        goalPosts.push({
            x: world.board.width,
            y: world.board.height,
            r: goalPostRadius,
            color: 'yellowgreen',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: world.board.width - 100,
                y: world.board.height - 100,
            },
        });

        goalPosts.push({
            x: 0,
            y: world.board.height,
            r: goalPostRadius,
            color: 'orange',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: 100,
                y: world.board.height - 100,
            },
        });
    }

    function InitializeGame() {
        AddGoalPosts(world.goalPosts);
    }
    InitializeGame();

    function FireGun(dog, gameTime) {
        const gun = dog.gun;

        if ( (gameTime - gun.lastFiredTime) < (1 / firingSpeed) ) {
            return;
        }

        gun.lastFiredTime = gameTime;

        if (dog.teamId % 3 == 0) {
            const relativePosition = GoatMath.ScaleVec(dog.direction, dog.circle.radius);
            const bulletSpawnPosition = GoatMath.AddVec(dog.circle.center, relativePosition);

            const bullet = {
                circle: {
                    center: bulletSpawnPosition,
                    radius: gun.bulletRadius,
                },
                speed: gun.bulletSpeed,
                direction: dog.direction,
                color: gun.bulletColor,
                teamId: dog.teamId,
                shotsAvailable: gun.shotsAvailable,
                lifespan: gun.bulletLifespan,
                creationTime: gameTime,
            };

            world.bullets.push(bullet);
        }
        else if (dog.teamId % 3 == 1) {
            for(let y = -1; y <= 1; ++y) {
                for(let x = -1; x <= 1; ++x) {
                    if (!x && !y) {
                        continue;
                    }

                    const direction = GoatMath.NewVec(x, y);
                    const normalizedDirection = GoatMath.NormalizeVec(direction);
                    const relativePosition = GoatMath.ScaleVec(normalizedDirection, dog.circle.radius);
                    const bulletSpawnPosition = GoatMath.AddVec(dog.circle.center, relativePosition);

                    const bullet = {
                        circle: {
                            center: bulletSpawnPosition,
                            radius: gun.bulletRadius,
                        },
                        speed: gun.bulletSpeed,
                        direction: normalizedDirection,
                        color: gun.bulletColor,
                        teamId: dog.teamId,
                        shotsAvailable: gun.shotsAvailable,
                        lifespan: .15,
                        creationTime: gameTime,
                    };
        
                    world.bullets.push(bullet);        
                }
            }
        }
        else
        {
            const relativePosition = GoatMath.ScaleVec(dog.direction, dog.circle.radius);
            const bulletSpawnPosition = GoatMath.AddVec(dog.circle.center, relativePosition);

            const bullet = {
                circle: {
                    center: bulletSpawnPosition,
                    radius: gun.bulletRadius * 2,
                },
                speed: 0,
                direction: dog.direction,
                color: gun.bulletColor,
                teamId: dog.teamId,
                shotsAvailable: gun.shotsAvailable,
                lifespan: gun.bulletLifespan,
                creationTime: gameTime,
            };

            world.bullets.push(bullet);
        }
    }

    function ProcessDog(dog, actualIntervalSeconds, gameTime) {
        // distance = velocity * time
        const distanceToMove = dogSpeed * actualIntervalSeconds;
        let moveDirection = GoatMath.NewVec(0, 0);
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
        dog.circle.center = GoatMath.AddVec(dog.circle.center, moveDirection);

        let direction = GoatMath.SubVec(dog.input.mouseTouch, dog.circle.center);
        direction = GoatMath.NormalizeVec(direction);
        dog.direction = direction;

        if (dog.input.key.shoot) {
            FireGun(dog, gameTime);
        }
    }

    function ProcessDogs(dogs, intervalSeconds, gameTime) {
        for (const id in dogs) {
            ProcessDog(dogs[id], intervalSeconds, gameTime);
        }
    }

    function ProcessBullet(bullet, intervalSeconds) {
        const distanceToMove = bullet.speed * intervalSeconds;
        const relativeMovePosition = GoatMath.ScaleVec(bullet.direction, distanceToMove);
        bullet.circle.center = GoatMath.AddVec(bullet.circle.center, relativeMovePosition);
    }

    function ProcessBullets(bullets, intervalSeconds, gameTime) {
        bullets.forEach((bullet) => {
            ProcessBullet(bullet, intervalSeconds);
        });

        return bullets.filter(bullet => gameTime - bullet.creationTime < bullet.lifespan);
    }

    function IsBulletWithinBoundingBox(board, bullet) {
        return !GoatMath.DoesCircleLeaveBoundingBox(
            bullet.circle,
            GoatMath.NewVec(0, 0),
            GoatMath.NewVec(board.width, board.height)
        );
    }

    function DetectBoardCollisionBullets(bullets, board) {
        const IsBulletWithinBoard = IsBulletWithinBoundingBox.bind(null, board);
        return bullets.filter(IsBulletWithinBoard);
    }

    function SnapDogsToBoard(dogs, board) {
        for (const id in dogs) {
            GoatMath.SnapCircleToBoundingBox(
                dogs[id].circle,
                GoatMath.NewVec(0, 0),
                GoatMath.NewVec(board.width, board.height)
            );
        }
    }

    function ProcessDogBulletCollisions(world) {
        let dogBulletCollisionPairs = [];
        world.bullets.forEach((bullet, index) => {
            for (const id in world.dogs) {
                if(GoatMath.DoCirclesCollide(world.dogs[id].circle, bullet.circle)) {
                    dogBulletCollisionPairs.push({ dogId: id, bulletIndex: index });
                }
            }
        });

        dogBulletCollisionPairs.forEach(dogBulletCollisionPair => {
            const dog = world.dogs[dogBulletCollisionPair.dogId];
            const bullet = world.bullets[dogBulletCollisionPair.bulletIndex];

            if (dog.teamId == bullet.teamId) {
                return;
            }

            if(bullet.shotsAvailable <= 0) {
                return;
            }

            dog.hp--;
            bullet.shotsAvailable--;
        });

        for (const id in world.dogs) {
            if (world.dogs[id].hp <= 0) {
                GoatGame.RemoveDog(id);
            }
        }

        world.bullets = world.bullets.filter(bullet => bullet.shotsAvailable > 0);
    }

    function ProcessCollisions(world) {
        ProcessDogBulletCollisions(world);

        SnapDogsToBoard(world.dogs, world.board);
        world.bullets = DetectBoardCollisionBullets(world.bullets, world.board);
    }

    // Physics

    // WARNING: DO NOT CHANGE THIS VALUE
    const physicsInterval = 15; // milliseconds

    let physicsTimeSeconds = GetGameTimeSeconds();
    let physicsPerfCounter = new GoatDiagnostics.PerfCounter();

    // Keep logic to a minimal here
    setInterval(function () {
        const newPhysicsTimeSeconds = GetGameTimeSeconds();
        const intervalSeconds = newPhysicsTimeSeconds - physicsTimeSeconds;
        physicsTimeSeconds = newPhysicsTimeSeconds;

        physicsPerfCounter.Stop();
        physicsPerfCounter.Start();

        ProcessDogs(world.dogs, intervalSeconds, newPhysicsTimeSeconds);
        world.bullets = ProcessBullets(world.bullets, intervalSeconds, newPhysicsTimeSeconds);

        ProcessCollisions(world);
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
