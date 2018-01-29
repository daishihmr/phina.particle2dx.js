phina.namespace(function() {

  phina.define("phina.particle2dx.Emitter", {
    superClass: "phina.app.Object2D",

    random: null,
    time: 0,
    particles: null,
    texture: null,

    emitCount: 0,
    emitPerMillisecond: 0,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.Emitter.defaults);

      this.random = phina.util.Random();

      this._initProperties(options);
      this._initParticles(options);

      this.emitPerMillisecond = (this.maxParticles / this.particleLifespan) / 1000;
    },

    _initProperties: function(options) {
      var json = phina.asset.AssetManager.get("json", options.jsonName).data;

      this.duration = json.duration;
      this.particleLifespan = json.particleLifespan;
      this.particleLifespanVariance = json.particleLifespanVariance;
      this.maxParticles = json.maxParticles;
      this.angle = json.angle;
      this.angleVariance = json.angleVariance;
      this.speed = json.speed;
      this.speedVariance = json.speedVariance;
      this.sourcePositionVariancex = json.sourcePositionVariancex;
      this.sourcePositionVariancey = json.sourcePositionVariancey;
      this.gravityx = json.gravityx;
      this.gravityy = json.gravityy;

      // 中心からの加速度
      this.radialAcceleration = json.radialAcceleration;
      this.radialAccelVariance = json.radialAccelVariance;

      // 接線加速度
      this.tangentialAcceleration = json.tangentialAcceleration;
      this.tangentialAccelVariance = json.tangentialAccelVariance;

      // this.configName = json.configName;

      // this.emitterType = json.emitterType;

      // this.maxRadius = json.maxRadius;
      // this.maxRadiusVariance = json.maxRadiusVariance;
      // this.minRadius = json.minRadius;
      // this.minRadiusVariance = json.minRadiusVariance;
      // this.rotatePerSecond = json.rotatePerSecond;
      // this.rotatePerSecondVariance = json.rotatePerSecondVariance;

      // 1: additive 771: normal
      this.blendFuncDestination = json.blendFuncDestination;

      // 770固定
      this.blendFuncSource = json.blendFuncSource;

      // pixel
      this.startParticleSize = json.startParticleSize;
      this.startParticleSizeVariance = json.startParticleSizeVariance;

      this.finishParticleSize = json.finishParticleSize;
      this.finishParticleSizeVariance = json.finishParticleSizeVariance;
      this.rotationStart = json.rotationStart;
      this.rotationStartVariance = json.rotationStartVariance;
      this.rotationEnd = json.rotationEnd;
      this.rotationEndVariance = json.rotationEndVariance;
 
      this.startColorRed = json.startColorRed;
      this.startColorGreen = json.startColorGreen;
      this.startColorBlue = json.startColorBlue;
      this.startColorAlpha = json.startColorAlpha;
      this.startColorVarianceRed = json.startColorVarianceRed;
      this.startColorVarianceGreen = json.startColorVarianceGreen;
      this.startColorVarianceBlue = json.startColorVarianceBlue;
      this.startColorVarianceAlpha = json.startColorVarianceAlpha;
      this.finishColorRed = json.finishColorRed;
      this.finishColorGreen = json.finishColorGreen;
      this.finishColorBlue = json.finishColorBlue;
      this.finishColorAlpha = json.finishColorAlpha;
      this.finishColorVarianceRed = json.finishColorVarianceRed;
      this.finishColorVarianceGreen = json.finishColorVarianceGreen;
      this.finishColorVarianceBlue = json.finishColorVarianceBlue;
      this.finishColorVarianceAlpha = json.finishColorVarianceAlpha;

      // this.textureFileName = json.textureFileName;
      // this.textureImageData = json.textureImageData;
      // this.yCoordFlipped = json.yCoordFlipped;

      this.textureName = options.textureName;
    },

    _initParticles: function(options) {
      this.particles = Array.range(0, this.maxParticles).map((index) => {
        return this._createParticle(index);
      });
    },

    _createParticle: function() {
      const particle = phina.particle2dx.Particle(this.textureName);
      if (this.blendFuncDestination === 1) {
        particle.blendMode = "lighter";
      }
      return particle;
    },

    update: function(app) {
      this.emitCount += this.emitPerMillisecond * app.deltaTime;
      for (let i = 0; i < this.emitCount; i++) {
        this.emit();
      }
      this.emitCount -= Math.floor(this.emitCount);
    },

    emit: function() {
      const particle = this.particles.shift();
      if (!particle) return;

      const r = this.random;

      particle.life = this.particleLifespan + r.randfloat(-this.particleLifespanVariance, this.particleLifespanVariance);

      particle.x = this.x + r.randfloat(-this.sourcePositionVariancex, this.sourcePositionVariancex);
      particle.y = this.y + r.randfloat(-this.sourcePositionVariancey, this.sourcePositionVariancey);

      const angle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);
      const speed = this.speed + r.randfloat(-this.speedVariance, this.speedVariance);

      particle.velocity.set(Math.cos(angle.toRadian()) * speed, -Math.sin(angle.toRadian()) * speed);
      particle.gravity.set(this.gravityx, this.gravityy);
      particle.emitterPosition.set(this.x, this.y);
      particle.initRadialAccel(this.radialAcceleration + r.randfloat(-this.radialAccelVariance, this.radialAccelVariance));
      particle.tangentialAccel = this.tangentialAcceleration + r.randfloat(-this.tangentialAccelVariance, this.tangentialAccelVariance);

      const sizeFrom = this.startParticleSize + r.randfloat(-this.startParticleSizeVariance, this.startParticleSizeVariance);
      const sizeTo = this.finishParticleSize + r.randfloat(-this.finishParticleSizeVariance, this.finishParticleSizeVariance);
      const rotationFrom = this.rotationStart + r.randfloat(-this.rotationStartVariance, this.rotationStartVariance);
      const rotationTo = this.rotationEnd + r.randfloat(-this.rotationEndVariance, this.rotationEndVariance);
      const alphaFrom = this.startColorAlpha + r.randfloat(-this.startColorVarianceAlpha, this.startColorVarianceAlpha);
      const alphaTo = this.finishColorAlpha + r.randfloat(-this.finishColorVarianceAlpha, this.finishColorVarianceAlpha);

      particle.tweener
        .clear()
        .set({
          scaleX: sizeFrom / particle.width,
          scaleY: sizeFrom / particle.height,
          rotation: rotationFrom,
          alpha: alphaFrom,
        })
        .to({
          scaleX: sizeTo / particle.width,
          scaleY: sizeTo / particle.height,
          rotation: rotationTo,
          alpha: alphaTo,
        }, particle.life * 1000)
        .call(() => {
          particle.remove();
          this.particles.push(particle);
        });

      particle.addChildTo(this.parent);
    },

    _static: {
      defaults: {
        jsonName: null,
        textureName: null,
      },
    },

  });

});