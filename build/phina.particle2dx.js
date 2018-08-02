phina.namespace(function() {

  phina.define("phina.particle2dx.ColoredTexture", {
    superClass: "phina.graphics.Canvas",

    orig: null,

    r: -1,
    g: -1,
    b: -1,

    _textureName: null,
    _domElementBackup: null,

    init: function(options) {
      this.superInit();
      this.orig = phina.asset.AssetManager.get("image", options.textureName);
      this.setSize(this.orig.domElement.width, this.orig.domElement.height);

      this._textureName = options.textureName;

      this._canvasForCache = Array.range(0, 1000).map(function() {
        return phina.graphics.Canvas().setSize(this.width, this.height);
      }.bind(this));

      this.setColor(1.0, 1.0, 1.0);
    },

    setColor: function(r, g, b) {
      const nr = (~~(r * 256)) * 1;
      const ng = (~~(g * 256)) * 1;
      const nb = (~~(b * 256)) * 1;

      if (this.r === nr && this.g === ng && this.b === nb) return;

      this.r = nr;
      this.g = ng;
      this.b = nb;

      const key = "{_textureName},{r},{g},{b}".format(this);
      const cache = phina.particle2dx.ColoredTexture._cache;
      if (cache[key]) {
        if (!this._domElementBackup) this._domElementBackup = this.domElement;
        this.domElement = cache[key].domElement;
      } else {
        if (this._domElementBackup) this.domElement = this._domElementBackup;

        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.orig.domElement, 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgb({r},{g},{b})".format(this);
        ctx.fillRect(0, 0, this.width, this.height);

        const clone = this._canvasForCache.length ? this._canvasForCache.shift() : phina.graphics.Canvas().setSize(this.width, this.height);
        clone.context.drawImage(this.domElement, 0, 0);
        cache[key] = clone;
      }
    },

    _static: {
      _cache: {},
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.Emitter", {
    superClass: "phina.app.Object2D",

    active: false,
    random: null,

    particles: null,

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
      this.maxParticles = json.maxParticles; // なぜか全然足りないから２倍作っとく
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
      this.particles = Array.range(0, this.maxParticles)
        .map(function(index) {
          var p = this._createParticle(options.textureName, index);
          p.on("removed", function() {
            p.visible = false;
            this.particles.push(p);
          }.bind(this));
          return p;
        }.bind(this));
    },

    _createParticle: function(textureName, index) {
      throw "no impl";
    },

    _createParticleAccessory: function() {
      return phina.particle2dx.Particle();
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
      for (var i = 0; i < ~~this.emitCount; i++) {
        this.emit();
      }
      this.emitCount -= ~~(this.emitCount);
    },

    emit: function() {
      var p = this.particles.shift();
      if (!p) {
        // console.warn("たりない");
        return;
      }
      p.addChildTo(this.parent);

      var r = this.random;
      var particle = p.particle;

      particle.life = this.particleLifespan + r.randfloat(-this.particleLifespanVariance, this.particleLifespanVariance);
      particle.emitterType = this.emitterType;
      particle.emitterPosition.set(this.x, this.y);

      var sizeFrom = this.startParticleSize + r.randfloat(-this.startParticleSizeVariance, this.startParticleSizeVariance);
      var sizeTo = this.finishParticleSize + r.randfloat(-this.finishParticleSizeVariance, this.finishParticleSizeVariance);
      var rotationFrom = this.rotationStart + r.randfloat(-this.rotationStartVariance, this.rotationStartVariance);
      var rotationTo = this.rotationEnd + r.randfloat(-this.rotationEndVariance, this.rotationEndVariance);

      var rFrom = this.startColorRed + r.randfloat(-this.startColorVarianceRed, this.startColorVarianceRed);
      var rTo = this.finishColorRed + r.randfloat(-this.finishColorVarianceRed, this.finishColorVarianceRed);
      var gFrom = this.startColorGreen + r.randfloat(-this.startColorVarianceGreen, this.startColorVarianceGreen);
      var gTo = this.finishColorGreen + r.randfloat(-this.finishColorVarianceGreen, this.finishColorVarianceGreen);
      var bFrom = this.startColorBlue + r.randfloat(-this.startColorVarianceBlue, this.startColorVarianceBlue);
      var bTo = this.finishColorBlue + r.randfloat(-this.finishColorVarianceBlue, this.finishColorVarianceBlue);
      var aFrom = this.startColorAlpha + r.randfloat(-this.startColorVarianceAlpha, this.startColorVarianceAlpha);
      var aTo = this.finishColorAlpha + r.randfloat(-this.finishColorVarianceAlpha, this.finishColorVarianceAlpha);

      if (this.emitterType === 0) {

        particle.position.x = this.x + r.randfloat(-this.sourcePositionVariancex, this.sourcePositionVariancex);
        particle.position.y = this.y + r.randfloat(-this.sourcePositionVariancey, this.sourcePositionVariancey);

        var angle = (this.angle + r.randfloat(-this.angleVariance, this.angleVariance)).toRadian();
        var speed = this.speed + r.randfloat(-this.speedVariance, this.speedVariance);

        particle.velocity.set(Math.cos(angle) * speed, -Math.sin(angle) * speed);
        particle.gravity.set(this.gravityx, this.gravityy);
        particle.initRadialAccel(this.radialAcceleration + r.randfloat(-this.radialAccelVariance, this.radialAccelVariance));
        particle.tangentialAccel = this.tangentialAcceleration + r.randfloat(-this.tangentialAccelVariance, this.tangentialAccelVariance);

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
        });

      } else if (this.emitterType === 1) {

        particle.posAngle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);

        var radiusFrom = this.maxRadius + r.randfloat(-this.maxRadiusVariance, this.maxRadiusVariance);
        var radiusTo = this.minRadius + r.randfloat(-this.minRadiusVariance, this.minRadiusVariance);
        particle.rotPerSec = (this.rotatePerSecond + r.randfloat(-this.rotatePerSecondVariance, this.rotatePerSecondVariance)).toRadian();

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
          radiusFrom: radiusFrom,
          radiusTo: radiusTo,
        });
      }

      particle.update({ deltaTime: 0 });
    },

    _static: {
      defaults: {
        jsonName: null,
        textureName: null,
      },
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.EmitterGL", {
    superClass: "phina.particle2dx.Emitter",

    gl: null,
    texture: null,

    init: function(options) {
      this.superInit(options);
      this.textureName = options.textureName;
    },

    _initParticles: function(options) {
      this.oneInstanceData = [
        // instanceVisible
        0,
        // instancePosition
        0, 0,
        // instanceRotation
        0,
        // instanceScale
        1,
        // instanceColor
        0, 0, 0, 0,
      ];

      var rawArray = Array.range(0, this.maxParticles).map(function() {
        return this.oneInstanceData;
      }.bind(this)).flatten();
      this.instanceData = new Float32Array(rawArray);

      this.superMethod("_initParticles", options);
    },

    _createParticle: function(textureName, index) {
      var p = phina.particle2dx.ParticleGL(this, index);
      p.particle = this._createParticleAccessory().attachTo(p);
      return p;
    },

    setup: function(layer) {
      var gl = layer.gl;
      var ext = layer.ext;
      var vpMatrix = layer.vpMatrix;

      this.texture = phigl.Texture(gl, this.textureName);

      this.drawable = phigl.InstancedDrawable(gl, ext)
        .setProgram(this._createProgram(gl))
        .setIndexValues([0, 1, 2, 2, 1, 3])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            // 左上
            -0.5, +0.5,
            // 左下
            -0.5, -0.5,
            // 右上
            +0.5, +0.5,
            // 右下
            +0.5, -0.5,
          ]
        }, {
          unitSize: 2,
          data: [
            // 左上
            0, 1,
            // 左下
            0, 0,
            // 右上
            1, 1,
            // 右下
            1, 0,
          ],
        }])
        .declareInstanceAttributes([
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceColor",
        ])
        .declareUniforms("vpMatrix", "texture");

      return this;
    },

    render: function(layer) {
      var gl = layer.gl;
      if (this.blendFuncDestination === 1) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      } else if (this.blendFuncDestination === 771) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      }

      this.drawable.uniforms["vpMatrix"].setValue(layer.vpMatrix);
      this.drawable.uniforms["texture"].setValue(0).setTexture(this.texture);
      this.drawable.setInstanceAttributeData(this.instanceData);
      this.drawable.draw(this.maxParticles);
    },

    _createProgram: function(gl) {
      var srcV = phina.particle2dx.EmitterGL.vertexShaderSource;
      var srcF = phina.particle2dx.EmitterGL.fragmentShaderSource;

      return phigl.Program(gl)
        .attach(phigl.VertexShader().setSource(srcV))
        .attach(phigl.FragmentShader().setSource(srcF))
        .link();
    },

    _static: {

      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "attribute float instanceVisible;",
        "attribute vec2 instancePosition;",
        "attribute float instanceRotation;",
        "attribute float instanceScale;",
        "attribute vec4 instanceColor;",

        "uniform mat4 vpMatrix;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vUv = uv;",
        "  vColor = instanceColor;",
        "  if (instanceVisible > 0.5) {",
        "    float s = sin(-instanceRotation);",
        "    float c = cos(-instanceRotation);",
        "    mat4 m = mat4(",
        "      vec4(c, -s, 0.0, 0.0),",
        "      vec4(s, c, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(instancePosition, 0.0, 1.0)",
        "    ) * mat4(",
        "      vec4(instanceScale, 0.0, 0.0, 0.0),",
        "      vec4(0.0, instanceScale, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(0.0, 0.0, 0.0, 1.0)",
        "    );",
        "    mat4 mvpMatrix = vpMatrix * m;",
        "    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);",
        "  } else {",
        "    gl_Position = vec4(0.0);",
        "  }",
        "}",
      ].join("\n"),

      fragmentShaderSource: [
        "precision mediump float;",

        "uniform sampler2D texture;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vec4 col = texture2D(texture, vUv);",
        "  if (col.a == 0.0) discard;",
        "  gl_FragColor = col * vColor;",
        "}",
      ].join("\n"),
    }

  });

  phina.define("phina.particle2dx.ParticleGL", {
    superClass: "phina.app.Element",

    oneDataLength: 0,
    instanceData: null,
    index: 0,

    init: function(emitter, index) {
      this.superInit();
      this.oneDataLength = emitter.oneInstanceData.length;
      this.instanceData = emitter.instanceData;
      this.index = index;
    },

    _accessor: {
      visible: {
        get: function() {
          return !!this.instanceData[this.oneDataLength * this.index + 0];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 0] = v ? 1 : 0;
        },
      },
      x: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 1] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 2] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 3] = v;
        },
      },
      scale: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 4] = v;
        },
      },
      r: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 5] = v;
        },
      },
      g: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 6];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 6] = v;
        },
      },
      b: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 7] = v;
        },
      },
      a: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 8] = v;
        },
      },
    },
  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.Particle", {
    superClass: "phina.accessory.Accessory",

    emitterType: 0,

    r: 1.0,
    g: 1.0,
    b: 1.0,
    a: 1.0,

    emitterPosition: null,
    life: 0,

    position: null,
    velocity: null,
    gravity: null,
    radialAccel: null,
    tangentialAccel: 0,
    _tangentialAccel: null,

    posAngle: 0,
    rotPerSec: 0,

    init: function() {
      this.superInit();

      this.position = phina.geom.Vector2();
      this.velocity = phina.geom.Vector2();
      this.gravity = phina.geom.Vector2();
      this.radialAccel = phina.geom.Vector2();
      this.emitterPosition = phina.geom.Vector2();
      this._tangentialAccel = phina.geom.Vector2();
    },

    initRadialAccel: function(radialAccelLength) {
      this.radialAccel
        .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y)
        .normalize()
        .mul(radialAccelLength);
    },

    set: function(data) {
      var duration = this.life * 1000;
      var p = this.target;
      p.visible = true;
      if (this.emitterType === 0) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      } else if (this.emitterType === 1) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
          posRadius: data.radiusFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
            posRadius: data.radiusTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      }
    },

    update: function(app) {
      var deltaSec = app.deltaTime * 0.001;

      if (this.emitterType === 0) {
        add(this.velocity, this.gravity, deltaSec);
        add(this.velocity, this.radialAccel, deltaSec);

        if (this.tangentialAccel) {
          this._tangentialAccel
            .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y);

          this._tangentialAccel
            .set(-this._tangentialAccel.y, this._tangentialAccel.x) // 90度回す
            .normalize()
            .mul(this.tangentialAccel);
          add(this.velocity, this._tangentialAccel, deltaSec);
        }

        add(this.position, this.velocity, deltaSec);
      } else if (this.emitterType === 1) {
        this.posAngle -= this.rotPerSec * deltaSec;
        this.position.set(
          this.emitterPosition.x + Math.cos(this.posAngle) * this.target.posRadius,
          this.emitterPosition.y - Math.sin(this.posAngle) * this.target.posRadius
        );
      }

      this.target.x = this.position.x;
      this.target.y = this.position.y;
    },

  });

  var add = function(vec1, vec2, deltaSec) {
    vec1.x += vec2.x * deltaSec;
    vec1.y -= vec2.y * deltaSec;
  };

});
phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleCanvas", {
    superClass: "phina.display.Sprite",

    particle: null,

    init: function(image) {
      this.superInit(image);
      this.particle = phina.particle2dx.Particle().attachTo(this);
    },

    draw: function(canvas) {
      if (this.image.setColor) this.image.setColor(this.r, this.g, this.b);
      this.superMethod("draw", canvas);
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleGLLayer", {
    superClass: "phina.display.Layer",

    emitters: null,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.ParticleGLLayer.defaults);

      this.emitters = [];

      this.domElement = options.domElement || document.createElement("canvas");
      this.domElement.width = this.width * options.quality;
      this.domElement.height = this.height * options.quality;

      var gl = this.domElement.getContext("webgl") || this.domElement.getContext("experimental-webgl");

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

      var projectionMatrix = mat4.create();
      var viewMatrix = mat4.create();
      var modelMatrix = mat4.create();
      var vpMatrix = mat4.create();
      mat4.ortho(projectionMatrix, 0, this.width, this.height, 0, 0.9, 1.1);
      mat4.lookAt(viewMatrix, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
      mat4.mul(vpMatrix, projectionMatrix, viewMatrix);

      this.gl = gl;
      this.ext = phigl.Extensions.getInstancedArrays(gl);
      this.vpMatrix = vpMatrix;
    },

    createEmitter: function(options) {
      var emitter = phina.particle2dx.EmitterGL(options);
      this.emitters.push(emitter);
      emitter.addChildTo(this);
      emitter.setup(this);
      emitter.on("removed", function() {
        this.emitters.erase(emitter);
      }.bind(this));
      return emitter;
    },

    draw: function(canvas) {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this._drawParticles();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image,
        0, 0, image.width, image.height, //
        -this.width * this.originX, -this.height * this.originY, this.width, this.height //
      );
    },

    _drawParticles: function() {
      for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].render(this);
      }
    },

    _static: {
      defaults: {},
    },
  });

});
//# sourceMappingURL=phina.particle2dx.js.map
