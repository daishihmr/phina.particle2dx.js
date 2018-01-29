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