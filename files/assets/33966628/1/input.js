var Input = pc.createScript('input');

Input.attributes.add('ball', {type: 'entity'});
Input.attributes.add('camera', {type: 'entity'});
Input.attributes.add('ballRadius', {type: 'number', default: 0.5});

Input.worldPos = new pc.Vec3();

// initialize code called once per entity
Input.prototype.initialize = function() {
    
    var self = this;
    
    this._paused = true;
    
    // Listen for game events so we know whether to respond to input
    this.app.on("game:start", function () {
        self._paused = false;
    });
    this.app.on("game:gameover", function () {
        self._paused = true;
    });

    // set up touch events if available
    if (this.app.touch) {
        this.app.touch.on("touchstart", this._onTouchStart, this);                
    }

    // set up mouse events
    this.app.mouse.on("mousedown", this._onMouseDown, this);
};

Input.prototype._onTap = function (x, y) {
    var p = this.ball.getPosition();
    var camPos = this.camera.getPosition();
    var worldPos = Input.worldPos;

    // Get the position in the 3D world of the touch or click
    // Store the in worldPos variable. 
    // This position is at the same distance away from the camera as the ball
    this.camera.camera.screenToWorld(x, y, camPos.z - p.z, worldPos);

    // get the distance of the touch/click to the ball
    var dx = (p.x - worldPos.x);
    var dy = (p.y - worldPos.y);

    // If the click is inside the ball, tap the ball
    var lenSqr = dx*dx + dy*dy;
    if (lenSqr < this.ballRadius*this.ballRadius) {
        this.ball.script.ball.tap(dx, dy);
    }            
};

Input.prototype._onTouchStart = function (e) {
    if (this._paused) {
        return;
    }

    // respond to event
    var touch = e.changedTouches[0];
    this._onTap(touch.x, touch.y);

    // stop mouse events firing as well
    e.event.preventDefault();
};

Input.prototype._onMouseDown = function (e) {
    if (this._paused) {
        return;
    }

    // respond to event
    this._onTap(e.x, e.y);
};