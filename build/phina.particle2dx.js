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
phina.namespace(() => {

  phina.define("phina.particle2dx.EmitterGL", {
    superClass: "phina.particle2dx.Emitter",

    gl: null,

    init: function(options) {
      this.superInit(options);

      this.$watch("gl", function() {
        this._initTexture(options);
        this._initDrawable(options);
      });
      if (options.gl) {
        this.gl = options.gl;
      }

      this.on("added", () => {
        var findGL = function(elm) {
          if (elm.gl) return elm.gl;
          else return findGL(elm.parent);
        };
        var gl = findGL(this.parent);
        if (gl) this.gl = gl;
      });
    },

    _initTexture: function(options) {
      var gl = this.gl;
      this.texture = phigl.Texture(gl, options.textureName);
    },

    _initDrawable: function(options) {
      var gl = this.gl;
      var ext = phigl.Extensions.getInstancedArrays(gl);

      var drawable = phigl.InstancedDrawable(gl, ext)
        .setProgram(program)
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("vertexPosition", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -0.5, +0.5,
            //
            +0.5, +0.5,
            //
            -0.5, -0.5,
            //
            +0.5, -0.5,
          ],
        }, {
          unitSize: 2,
          data: [
            //
            0, 1,
            //
            1, 1,
            //
            0, 0,
            //
            1, 0,
          ],
        }])
        .declareInstanceAttributes("instanceMatrix", "instanceVisible")
        .declareUniforms("texture");

      var instanceData = [];
      var particles = Array.range(0, this.maxParticles).map(function(index) {
        var particle = phina.particle2dx.Particle({
          index: index,
          instanceData: instanceData,
        });

        Array.prototype.push.apply(instanceData, particle._data);

        return particle;
      });
      drawable.setInstanceAttributeData(instanceData);

      this.drawable = drawable;
    },

    drawWebGL: function(layer) {
      var gl = this.gl;

      this.drawable.draw(this.maxParticles);
    },

    _static: {
      _programCache: null,
      _vertexShader: null,
      _fragmentShader: null,

      getProgram: function(gl) {
        var id = phigl.GL.getId(gl);
        if (this._programCache[id] == null) {
          this._programCache[id] = phigl.Program(gl)
            .attach(this.getVertexShader())
            .attach(this.getFragmentShader())
            .link();
        }
        return this._programCache[id];
      },

      getVertexShader: function() {
        if (this._vertexShader == null) {
          this._vertexShader = phigl.VertexShader();
          this._vertexShader.data = [
            "attribute vec2 vertexPosition;",
            "attribute vec2 uv;",
            "attribute mat3 instanceMatrix;",
            "attribute float instanceVisible;",

            "varying vec2 vUv;",

            "void main(void) {",
            "  vUv = uv;",
            "  if (instanceVisible < 0.5) {",
            "    gl_Position = vec4(0.0);",
            "  } else {",
            "    ",
            "  }",
            "}",
          ].join("\n");
        }
        return this._vertexShader;
      },

      getFragmentShader: function() {
        if (this._fragmentShader == null) {
          this._fragmentShader = phigl.FragmentShader();
          this._fragmentShader.data = [
            "precision mediump float;",

            "uniform sampler2D texture;",

            "varying vec2 vUv;",

            "void main(void) {",
            "",
            "}",
          ].join("\n");
        }
        return this._fragmentShader;
      },
    },
  });

});
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
phina.namespace(function() {

  phina.define("phina.particle2dx.Particle2dxLayer", {
    superClass: "phina.display.Layer",

    viewportSize: 1,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.Particle2dxLayer.defaults);

      this.domElement = document.createElement("canvas");
      this.domElement.width = this.width;
      this.domElement.height = this.height;

      var gl = this.domElement.getContext("webgl") || this.domElement.getContext("experimental-webgl");

      if (this.width > this.height) {
        gl.viewport(0, (this.height - this.width) / 2, this.width, this.width);
        this.viewportSize = 1 / this.width;
      } else {
        gl.viewport((this.width - this.height) / 2, 0, this.height, this.height);
        this.viewportSize = 1 / this.height;
      }
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.enable(gl.BLEND);
      gl.cullFace(gl.BACK);

      this.gl = gl;
    },

    draw: function(canvas) {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this._drawChildren(this);
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image,
        0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height
      );
    },

    _drawChildren: function(elm) {
      if (elm.drawWebGL) elm.drawWebGL(this);
      for (var i = 0; i < elm.children.length; ++i) {
        this._drawChildren(elm.children[i]);
      }
    },

    _static: {
      defaults: {

      },
    },
  });

});
phina.namespace(() => {

  phina.define("phina.particle2dx.ParticleCanvas", {
    superClass: "phina.particle2dx.Particle",

    init: function(options) {
      this.superInit(options);
    },

  });

});
//# sourceMappingURL=phina.particle2dx.js.map
