phina.namespace(function() {

  const add = (vec1, vec2, deltaTime) => {
    vec1.x += vec2.x * deltaTime / 1000;
    vec1.y -= vec2.y * deltaTime / 1000;
  };

  phina.define("phina.particle2dx.Particle", {
    superClass: "phina.display.Sprite",

    emitterPosition: null,
    life: 0,

    velocity: null,
    gravity: null,
    radialAccel: null,
    tangentialAccel: 0,

    _tangentialAccel: null,

    init: function(textureName) {
      this.superInit(textureName);

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
    },
  });
});