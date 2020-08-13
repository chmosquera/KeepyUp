var Ball = pc.createScript('ball');

Ball.attributes.add('gravity', {
    type: 'number',
    default: -9.8,
    description: 'The value of gravity to use'
});

Ball.attributes.add('defaultTap', {
    type: 'number',
    default: 5,
    description: 'Speed to set the ball to when it is tapped'
});

Ball.attributes.add('impactEffect', {
    type: 'entity',
    description: 'The particle effect to trigger when the ball is tapped'
});

Ball.attributes.add('ballMinimum', {
    type: 'number',
    default: -6,
    description: 'When ball goes below minimum y value game over is triggered'
});

Ball.attributes.add('speedMult', {
    type: 'number',
    default: 4,
    description: 'Multiplier to apply to X speed when tap is off center'
});

Ball.attributes.add('angMult', {
    type: 'number',
    default: -6,
    description: 'Multiplier to apply to angular speed when tap is off center'
});

Ball.tmp = new pc.Vec3();

// initialize code called once per entity
Ball.prototype.initialize = function() {
    this.paused = true;
    
    // Get the "Game" Entity and start listening for events
    this.game = this.app.root.findByName("Game");

    this.app.on("game:start", this.unpause, this);
    this.app.on("game:gameover", this.pause, this);
    this.app.on("game:reset", this.reset, this);

    // Initialize properties
    this._vel = new pc.Vec3(0, 0, 0);
    this._acc = new pc.Vec3(0, this.gravity, 0);
    this._angSpeed = 0;

    // Store the initial position and rotation for reseting
    this._origin = this.entity.getLocalPosition().clone();
    this._rotation = this.entity.getLocalRotation().clone();
};

// update code called every frame
Ball.prototype.update = function(dt) {
    // Don't update when paused
    if (this.paused) {
        this.entity.rotate(0, 30*dt, 0);
        return;
    }

    var p = this.entity.getLocalPosition();
    var tmp = Ball.tmp;

    // integrate the velocity in a temporary variable
    tmp.copy(this._acc).scale(dt);
    this._vel.add(tmp);

    // integrate the position in a temporary variable
    tmp.copy(this._vel).scale(dt);
    p.add(tmp);

    // update position
    this.entity.setLocalPosition(p);

    // rotate by angular speed
    this.entity.rotate(0, 0, this._angSpeed);

    // check for game over condition
    if (p.y < this.ballMinimum) {
        this.game.script.game.gameOver();
    }
};

/*
 * Called by the input handler to tap the ball up in the air
 * dx is the tap distance from centre of ball in x
 * dy is the tap distance from centre of ball in y
 */
Ball.prototype.tap = function (dx, dy, notScoring) { 
    // Update velocity and spin based on position of tap
    this._vel.set(this.speedMult * dx, this.defaultTap, 0);
    this._angSpeed += this.angMult * dx;

    // calculate the position of the tap in world space
    var tmp = Ball.tmp;
    tmp.copy(this.entity.getLocalPosition());
    tmp.x -= dx;
    tmp.y -= dy;

    // trigger particle effect to tap position, facing away from the center of the ball
    this.impactEffect.setLocalPosition(tmp);
    this.impactEffect.particlesystem.reset();
    this.impactEffect.particlesystem.play();
    this.impactEffect.lookAt(this.entity.getPosition());

    // play audio
    this.entity.sound.play("bounce");

    if (!notScoring) {
        // increment the score by 1
        this.game.script.game.addScore(1);        
    }
};

// Pause the ball update when not playing the game
Ball.prototype.unpause = function () {
    this.paused = false;

    // start game with a tap
    this.tap(0, 0, true);
};

// Resume ball updating
Ball.prototype.pause = function () {
    this.paused = true;
};

// Reset the ball to initial values
Ball.prototype.reset = function () {
    this.entity.setLocalPosition(this._origin);
    this.entity.setLocalRotation(this._rotation);
    this._vel.set(0,0,0);
    this._acc.set(0, this.gravity, 0);
    this._angSpeed = 0;
};
