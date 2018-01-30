phina.namespace(function() {

  const add = (vec1, vec2, deltaTime) => {
    vec1.x += vec2.x * deltaTime / 1000;
    vec1.y -= vec2.y * deltaTime / 1000;
  };

  phina.define("phina.particle2dx.Particle", {
    superClass: "phina.display.Sprite",

    emitterType: 0,

    texture: null,
    r: 1.0,
    g: 1.0,
    b: 1.0,
    a: 1.0,

    emitterPosition: null,
    life: 0,

    velocity: null,
    gravity: null,
    radialAccel: null,
    tangentialAccel: 0,
    _tangentialAccel: null,

    posAngle: 0,
    posRadius: 0,
    rotPerSec: 0,

    init: function(image) {
      this.superInit(image);

      this.velocity = phina.geom.Vector2();
      this.gravity = phina.geom.Vector2();
      this.radialAccel = phina.geom.Vector2();
      this.emitterPosition = phina.geom.Vector2();
      this._tangentialAccel = phina.geom.Vector2();
    },

    initRadialAccel: function(radialAccelLength) {
      this.radialAccel
        .set(this.x - this.emitterPosition.x, this.y - this.emitterPosition.y)
        .normalize()
        .mul(radialAccelLength);
    },

    update: function(app) {
      if (this.emitterType === 0) {
        add(this.velocity, this.gravity, app.deltaTime);
        add(this.velocity, this.radialAccel, app.deltaTime);

        if (this.tangentialAccel) {
          this._tangentialAccel
            .set(this.x - this.emitterPosition.x, this.y - this.emitterPosition.y)
            .normalize();
          this._tangentialAccel.set(-this._tangentialAccel.y, this._tangentialAccel.x);
          this._tangentialAccel.mul(this.tangentialAccel);
          add(this.velocity, this._tangentialAccel, app.deltaTime);
        }

        add(this.position, this.velocity, app.deltaTime);
      } else if (this.emitterType === 1) {
        this.posAngle -= this.rotPerSec * app.deltaTime / 1000;
        this.position.set(
          this.emitterPosition.x + Math.cos(this.posAngle.toRadian()) * this.posRadius,
          this.emitterPosition.y - Math.sin(this.posAngle.toRadian()) * this.posRadius
        );
      }
    },

    draw: function(canvas) {
      if (this.image.setColor) this.image.setColor(this.r, this.g, this.b);
      this.superMethod("draw", canvas);
    },

  });

});