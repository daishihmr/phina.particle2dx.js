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