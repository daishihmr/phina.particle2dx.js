phina.namespace(function() {

  phina.define("phina.particle2dx.Emitter", {
    superClass: "phina.app.Object2D",

    active: false,
    random: null,

    particles: null,
    texture: null,

    emitCount: 0,
    emitPerMillisec: 0,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.Emitter.defaults);

      this.random = phina.util.Random();

      this._initProperties(options);
      this._initParticles(options);

      this.emitPerMillisec = this.maxParticles / (this.particleLifespan * 1000);
    },

    _initProperties: function(options) {
      var json = phina.asset.AssetManager.get("json", options.jsonName).data;

      this.duration = json.duration;

      // 0:Gravity 1:Radius
      this.emitterType = json.emitterType;

      // this.configName = json.configName;

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

      this.maxRadius = json.maxRadius;
      this.maxRadiusVariance = json.maxRadiusVariance;
      this.minRadius = json.minRadius;
      this.minRadiusVariance = json.minRadiusVariance;
      this.rotatePerSecond = json.rotatePerSecond;
      this.rotatePerSecondVariance = json.rotatePerSecondVariance;

      // 1:additive 771:normal
      this.blendFuncDestination = json.blendFuncDestination;
      // 770固定
      this.blendFuncSource = json.blendFuncSource;

      this.startParticleSize = json.startParticleSize;
      this.startParticleSizeVariance = json.startParticleSizeVariance;
      if (json.finishParticleSize == -1) {
        this.finishParticleSize = this.startParticleSize;
      } else {
        this.finishParticleSize = json.finishParticleSize;
      }
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
    },

    _initParticles: function(options) {
      const texture = phina.particle2dx.ColoredTexture({
        textureName: options.textureName,
      });
      // なぜか全然足りないから２倍作っとく
      this.particles = Array.range(0, this.maxParticles * 2).map(() => this._createParticle(texture));
    },

    _createParticle: function(texture) {
      const particle = phina.particle2dx.Particle(texture);
      if (this.blendFuncDestination === 1) {
        particle.blendMode = "lighter";
      }
      return particle;
    },

    start: function() {
      this.active = true;
      if (this.duration > 0) {
        this.tweener
          .clear()
          .wait(this.duration * 1000)
          .set({ active: false });
      }

      return this;
    },

    stop: function() {
      this.active = false;

      return this;
    },

    update: function(app) {
      if (!this.active) return;

      this.emitCount += this.emitPerMillisec * app.deltaTime;
      for (let i = 0; i < ~~this.emitCount; i++) {
        this.emit();
      }
      this.emitCount -= ~~(this.emitCount);
    },

    emit: function() {
      const particle = this.particles.shift();
      if (!particle) {
        console.warn("たりない");
        return;
      }

      const r = this.random;

      particle.life = this.particleLifespan + r.randfloat(-this.particleLifespanVariance, this.particleLifespanVariance);
      particle.emitterType = this.emitterType;
      particle.emitterPosition.set(this.x, this.y);

      const sizeFrom = this.startParticleSize + r.randfloat(-this.startParticleSizeVariance, this.startParticleSizeVariance);
      const sizeTo = this.finishParticleSize + r.randfloat(-this.finishParticleSizeVariance, this.finishParticleSizeVariance);
      const rotationFrom = this.rotationStart + r.randfloat(-this.rotationStartVariance, this.rotationStartVariance);
      const rotationTo = this.rotationEnd + r.randfloat(-this.rotationEndVariance, this.rotationEndVariance);

      const rFrom = this.startColorRed + r.randfloat(-this.startColorVarianceRed, this.startColorVarianceRed);
      const rTo = this.finishColorRed + r.randfloat(-this.finishColorVarianceRed, this.finishColorVarianceRed);
      const gFrom = this.startColorGreen + r.randfloat(-this.startColorVarianceGreen, this.startColorVarianceGreen);
      const gTo = this.finishColorGreen + r.randfloat(-this.finishColorVarianceGreen, this.finishColorVarianceGreen);
      const bFrom = this.startColorBlue + r.randfloat(-this.startColorVarianceBlue, this.startColorVarianceBlue);
      const bTo = this.finishColorBlue + r.randfloat(-this.finishColorVarianceBlue, this.finishColorVarianceBlue);
      const aFrom = this.startColorAlpha + r.randfloat(-this.startColorVarianceAlpha, this.startColorVarianceAlpha);
      const aTo = this.finishColorAlpha + r.randfloat(-this.finishColorVarianceAlpha, this.finishColorVarianceAlpha);

      if (this.emitterType === 0) {

        particle.x = this.x + r.randfloat(-this.sourcePositionVariancex, this.sourcePositionVariancex);
        particle.y = this.y + r.randfloat(-this.sourcePositionVariancey, this.sourcePositionVariancey);

        const angle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);
        const speed = this.speed + r.randfloat(-this.speedVariance, this.speedVariance);

        particle.velocity.set(Math.cos(angle.toRadian()) * speed, -Math.sin(angle.toRadian()) * speed);
        particle.gravity.set(this.gravityx, this.gravityy);
        particle.initRadialAccel(this.radialAcceleration + r.randfloat(-this.radialAccelVariance, this.radialAccelVariance));
        particle.tangentialAccel = this.tangentialAcceleration + r.randfloat(-this.tangentialAccelVariance, this.tangentialAccelVariance);

        particle.$extend({
          scaleX: sizeFrom / particle.width,
          scaleY: sizeFrom / particle.height,
          rotation: rotationFrom,
          r: rFrom,
          g: gFrom,
          b: bFrom,
          alpha: aFrom,
        });

        particle.tweener
          .clear()
          .to({
            scaleX: sizeTo / particle.width,
            scaleY: sizeTo / particle.height,
            rotation: rotationTo,
            r: rTo,
            g: gTo,
            b: bTo,
            alpha: aTo,
          }, particle.life * 1000)
          .call(() => {
            particle.remove();
            this.particles.push(particle);
          });
      } else if (this.emitterType === 1) {

        particle.posAngle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);

        const radiusFrom = this.maxRadius + r.randfloat(-this.maxRadiusVariance, this.maxRadiusVariance);
        const radiusTo = this.minRadius + r.randfloat(-this.minRadiusVariance, this.minRadiusVariance);
        particle.rotPerSec = this.rotatePerSecond + r.randfloat(-this.rotatePerSecondVariance, this.rotatePerSecondVariance);

        particle.$extend({
          scaleX: sizeFrom / particle.width,
          scaleY: sizeFrom / particle.height,
          rotation: rotationFrom,
          r: rFrom,
          g: gFrom,
          b: bFrom,
          alpha: aFrom,
          posRadius: radiusFrom,
        });

        particle.tweener
          .clear()
          .to({
            scaleX: sizeTo / particle.width,
            scaleY: sizeTo / particle.height,
            rotation: rotationTo,
            r: rTo,
            g: gTo,
            b: bTo,
            alpha: aTo,
            posRadius: radiusTo,
          }, particle.life * 1000)
          .call(() => {
            particle.remove();
            this.particles.push(particle);
          });
      }

      particle.update({ deltaTime: 0 });
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