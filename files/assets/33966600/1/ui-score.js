var UiScore = pc.createScript('uiScore');

// initialize code called once per entity
UiScore.prototype.initialize = function() {
    this.score = this.entity.findByName("Score");
    
    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    
    this.onEnable();
};

UiScore.prototype.onEnable = function () {
    // listen for score events on the game object and update the score
    this.app.on("game:score", this._changeScore, this);
    this._changeScore(0);
};

UiScore.prototype.onDisable = function () {
    // stop listening for events
    this.app.off("game:score", this._changeScore, this);
};

UiScore.prototype._changeScore = function (newScore) {
    // Update the text
    this.score.element.text = newScore.toString();
};