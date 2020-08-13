var UiGameover = pc.createScript('uiGameover');

UiGameover.attributes.add("overlay", {type: "entity"});

// initialize code called once per entity
UiGameover.prototype.initialize = function() {
    this.score = this.entity.findByName("Score");
    this._score = 0;

    this.app.on("game:score", function (score) {
        this._score = score;
    }, this);

    this.onEnable();
    
    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
};

UiGameover.prototype.onEnable = function () {
    this.overlay.enabled = true;
    
    // Listen for any event to move on from this page
    this.overlay.element.on("click", this.reset, this);
    this.score.element.text = this._score.toString();
};

UiGameover.prototype.onDisable = function () {
    this.overlay.enabled = false;
    
    // Stop listening to events
    this.overlay.element.off("click", this.reset, this);
};

UiGameover.prototype.reset = function (e) {
    this.app.fire("ui:reset");
    
    // prevent touch and mouse events
    e.stopPropagation();
};