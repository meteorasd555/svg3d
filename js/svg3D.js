//(function(ns) {

function inherit(superClazz, subClazz) {
	var tempProto = subClazz.prototype;
	subClazz.prototype = new superClazz();
	for (var p in tempProto) {
		subClazz.prototype[p] = tempProto[p];
	}
}

var GraphicImply = function(domElement, width, height) {
	this.r = Raphael(domElement);
	this.r.setSize(width, height);

}

GraphicImply.prototype = {
	drawPath: function(bline) {
		var i, j, pathAr = bline.getPaths(),
			l = pathAr.length,
			lj, sPath,
			r = this.r;

		for (i = 0; i < pathAr.length; i++) {
			lj = pathAr[i].length;
			sPath = "";
			for (j = 0; j < lj; j++) {
				if (j == 0) {
					sPath += "M" + pathAr[i][0][0] + " " + pathAr[i][0][1];
				} else {
					sPath += "L" + pathAr[i][j][0] + " " + pathAr[i][j][1];
				}
			}
			r.path(sPath);
		}
	},
	drawFace: function(vertexs, color) {
		var i = 0,
			l = vertexs.length,
			sPath = "";

		for (i; i < l; i++) {
			if (i == 0) {
				sPath += "M" + vertexs[i][0] + " " + vertexs[i][1];
			} else {
				sPath += "L" + vertexs[i][0] + " " + vertexs[i][1];
			}
		}
		sPath += "Z";

		this.r.path(sPath).attr({
			stroke: "none",
			fill: color,
			opacity: 1
		});
	},
	clear: function() {
		this.r.clear();
	}
}

var GraphicImply2 = function(domElement, width, height) {
	this.canvas = document.createElement("canvas");
	domElement.appendChild(this.canvas);
	this.width = width;
	this.height = height;
	this.canvas.width = width;
	this.canvas.height = height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.strokeStyle = "#000000"; 
	this.ctx.lineWidth = 1;
}

GraphicImply2.prototype = {
	drawPath: function(bline) {
		var i, j, pathAr = bline.getPaths(),
			l = pathAr.length,
			lj, sPath;

		for (i = 0; i < pathAr.length; i++) {
			lj = pathAr[i].length;

			for (j = 0; j < lj; j++) {
				if (j == 0) {
					this.ctx.moveTo(pathAr[i][0][0],pathAr[i][0][1]);
				} else {
					this.ctx.lineTo(pathAr[i][j][0],pathAr[i][j][1]);
				}
				
				this.ctx.stroke(); 
			}
			
		}
	},
	drawFace: function(vertexs) {
		var i = 0,
			l = vertexs.length,
			sPath = "";

		for (i; i < l; i++) {
			if (i == 0) {
				sPath += "M" + vertexs[i][0] + " " + vertexs[i][1];
			} else {
				sPath += "L" + vertexs[i][0] + " " + vertexs[i][1];
			}
		}
		sPath += "Z";

		this.r.path(sPath).attr({
			stroke: "none",
			fill: "red",
			opacity: 0.3
		});
	},
	clear: function() {
		this.canvas.width = this.width;
		this.canvas.height = this.height
	}
}

var Scene = function(domElement, width, height) {
	this.objectList = [];
	this.viewPortWidth = width;
	this.viewPortHeight = height;
	this.graphicCanvas = new GraphicImply(domElement, width, height);
}

Scene.prototype = {
	constructor: Scene,
	init: function() {

	},
	setCamera: function(camera) {
		this.camera = camera;
	},
	addGeometry: function(geometry) {
		geometry.setCamera(this.camera);
		this.objectList.push(geometry);
	},
	render: function() {
		var i = 0,
			obj;
		this.graphicCanvas.clear();
		for (i; i < this.objectList.length; i++) {
			obj = this.objectList[i];
			obj.render(this.graphicCanvas, width, height);
		}
	}
}

var PerspectiveCamera = function(fov, aspect, near, far) {

	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;

	this.position = {
		x: 0,
		y: 0,
		z: 0
	};

	this.direction = [0, 0, -1];

	this.defaultDirection = [0, 0, -1];

	this.rotationZ = 0;


}

PerspectiveCamera.prototype = {
	constructor: PerspectiveCamera,
	init: function() {
		var theta = this.fov / 2 * Math.PI / 180,
			f = -this.far,
			n = -this.near;

		this.width = width;
		this.height = height;

		this.matrix = Matrix.create([
			[1 / (Math.tan(theta) * this.aspect), 0, 0, 0],
			[0, 1 / Math.tan(theta), 0, 0],
			[0, 0, f / (f - n), -1],
			[0, 0, f * n / (n - f), 0]
		]);

	},
	getMatrix: function() {
		var converMatrix, v1, v2, xMat, yMat, zMat, dirMat, msdV, signX = signY = 1;

		this.init();

		v1 = $V([0, this.direction[1], this.direction[2]]);
		v2 = $V([
			0,
			this.defaultDirection[1],
			this.defaultDirection[2]
		]);
		var tx = v1.angleFrom(v2);

		msdV = v1.subtract(v2);
		signX = msdV.elements[1] > 0 ? 1 : -1;



		v1 = $V([this.direction[0], 0, this.direction[2]]);
		v2 = $V([
			this.defaultDirection[0],
			0,
			this.defaultDirection[2]
		]);
		var ty = -v1.angleFrom(v2);

		msdV = v1.subtract(v2);
		signY = msdV.elements[0] > 0 ? 1 : -1;

		xMat = Matrix.RotationX(signX * tx);
		yMat = Matrix.RotationY(signY * ty);
		zMat = Matrix.RotationZ(this.rotationZ);
		dirMat = yMat.x(xMat.x(zMat));

		converMatrix = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[-this.position.x, -this.position.y, -this.position.z, 1]
		]);

		converMatrix = converMatrix.x(dirMat);

		return converMatrix.multiply(this.matrix);
	}
}

var Bline = function() {
	this.currentPaths = [];
	this.currentPosition = [0, 0];
	this.series = [];
}

Bline.prototype = {
	constructor: Bline,
	INIT_POSITION: [0, 0],
	moveTo: function(vectorAr) {
		this.currentPosition = vectorAr;
		if (this.currentPaths.length == 0) {
			this.currentPaths.push(vectorAr);
		}
		if (this.currentPaths.length != 1) {
			this.series.push(this.currentPaths);
			this.currentPaths = [this.currentPosition.slice()];
		}

	},
	lineTo: function(vectorAr) {
		if (this.currentPaths.length == 0) {
			this.currentPaths.push(this.INIT_POSITION);
		}
		this.currentPaths.push(vectorAr);
		this.currentPosition = vectorAr;
	},
	clear: function() {
		this.series = [];
		this.currentPaths = [];
	},
	getPaths: function() {
		var paths = this.series.slice();
		paths.push(this.currentPaths);
		return paths;
	}
}


var Geometry = function() {
	this.showFace = true;
	this.showLine = true;
	this.defaultModelMatrix = Matrix.create([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	]);
	this.modelMatrix = this.defaultModelMatrix.dup();
	this.ultiMatrix = null;
	this.center = [0, 0, 0];
	this.vertexs = [];
	this.paths = [];
	this.camera = null;
}

Geometry.prototype = {
	constructor: Geometry,
	setCamera: function(camera) {
		this.camera = camera;
	},
	translateX: function(x) {
		var matrix = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[x, 0, 0, 1]
		]);

		this.modelMatrix = this.modelMatrix.multiply(matrix);
	},
	translateY: function(y) {
		var matrix = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, y, 0, 1]
		]);

		this.modelMatrix = this.modelMatrix.multiply(matrix);
	},
	translateZ: function(z) {
		var matrix = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, z, 1]
		]);

		this.modelMatrix = this.modelMatrix.multiply(matrix);
	},
	rotateX: function(t) {
		var c = Math.cos(t),
			s = Math.sin(t),
			matrix,
			ct = this.center,
			m1, m2;

		m1 = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[-ct[0], -ct[1], -ct[2], 1]
		]);

		m2 = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[ct[0], ct[1], ct[2], 1]
		]);

		matrix = Matrix.create([
			[1, 0, 0, 0],
			[0, c, -s, 0],
			[0, s, c, 0],
			[0, 0, 0, 1]
		]);

		matrix = m1.multiply(matrix.multiply(m2));

		this.modelMatrix = this.modelMatrix.multiply(matrix);
	},
	rotateY: function(t) {
		var c = Math.cos(t),
			s = Math.sin(t),
			matrix,
			ct = this.center,
			m1, m2;

		m1 = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[-ct[0], -ct[1], -ct[2], 1]
		]);

		m2 = Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[ct[0], ct[1], ct[2], 1]
		]);

		matrix = Matrix.create([
			[c, 0, s, 0],
			[0, 1, 0, 0],
			[-s, 0, c, 0],
			[0, 0, 0, 1]
		]);

		matrix = m1.multiply(matrix.multiply(m2));

		this.modelMatrix = this.modelMatrix.multiply(matrix);
	},
	render: function(canvas, width, height) {
		var lines = new Bline(),
			vfaces = [],
			vMap = this.vertexs,
			point, mPoint, _2Dpoint,
			cx = width / 2,
			vertexs,
			i, j,
			cy = height / 2;
		if (this.showLine && this.paths && this.paths.length > 0) {
			for (i = 0; i < this.paths.length; i++) {
				vertexs = this.paths[i];
				for (j = 0; j < vertexs.length; j++) {
					point = vMap[vertexs[j]];
					mPoint = Matrix.create([
						[point[0], point[1], point[2], 1]
					]);
	
					_2Dpoint = this.doVertexConvert(mPoint, canvas, width, height);
					if (_2Dpoint == null) {
						return;
					}
					if (j == 0) {
						lines.moveTo([cx + _2Dpoint[0], cy - _2Dpoint[1]]);
					} else {
						lines.lineTo([cx + _2Dpoint[0], cy - _2Dpoint[1]]);
					}
	
				}
			}
		}
		
		canvas.drawPath(lines);

		if (this.showFace && this.faces && this.faces.length > 0) {

			for (i = 0; i < this.faces.length; i++) {
				vertexs = this.faces[i];
				vfaces = [];
				for (j = 0; j < vertexs.length; j++) {
					point = vMap[vertexs[j]];
					mPoint = Matrix.create([
						[point[0], point[1], point[2], 1]
					]);

					_2Dpoint = this.doVertexConvert(mPoint, canvas, width, height);
					if (_2Dpoint == null) {
						return;
					}

					vfaces.push([cx + _2Dpoint[0], cy - _2Dpoint[1]]);
				}
				canvas.drawFace(vfaces, this.colors[i]);
			}
		}



	},
	doVertexConvert: function(martix, canvas, width, height) {
		var pm = this.camera.getMatrix(),
			x, y,
			gWidth = this.camera.width,
			gHeight = this.camera.height,
			midMat;

		midMat = martix.multiply(this.modelMatrix);
		midMat = midMat.multiply(pm);

		x = midMat.elements[0][0] / (midMat.elements[0][3]);
		y = midMat.elements[0][1] / (midMat.elements[0][3]);
		z = midMat.elements[0][2] / (midMat.elements[0][3]);

		if (x < -1 || y < -1 || z < -1 || x > 1 || y > 1 || z > 0) {
			return null;
		}

		x = x * width / 2;
		y = y * height / 2;

		return [x, y];
	}
}

var BoxGeometry = function(width, height, depth, x, y, z) {
	Geometry.call(this);
	this.paths = [
		//	[0, 1]
		[0, 1, 2, 3, 0, 4, 5, 6, 7, 4],
		[1, 5],
		[2, 6],
		[3, 7]
	];

	this.faces = [
		[0, 1, 2, 3],
		[1, 5, 6, 2],
		[5, 4, 7, 6],
		[0, 4, 7, 3],
		[0, 1, 5, 4],
		[3, 2, 6, 7]
	]
	
	this.colors = ["red", "blue", "yellow", "#CCC", "#CA0", "#AC7"]

	this.init(width, height, depth, x, y, z);
}

BoxGeometry.prototype = {
	constructor: BoxGeometry,
	init: function(width, height, depth, x, y, z) {
		var w2 = width / 2,
			h2 = height / 2,
			d2 = depth / 2,
			ct = this.center,
			cx, cy, cz;

		cx = ct[0] = x || ct[0];
		cy = ct[1] = y || ct[1];
		cz = ct[2] = z || ct[2];


		this.vertexs = [
			[cx - w2, cy - h2, cz + d2],
			[cx + w2, cy - h2, cz + d2],
			[cx + w2, cy + h2, cz + d2],
			[cx - w2, cy + h2, cz + d2],
			[cx - w2, cy - h2, cz - d2],
			[cx + w2, cy - h2, cz - d2],
			[cx + w2, cy + h2, cz - d2],
			[cx - w2, cy + h2, cz - d2]
		]
	}
}

inherit(Geometry, BoxGeometry);


var BallGeometry = function(r, d1, d2, x, y, z) {
	Geometry.call(this);
	this.paths = [];
	this.vertexs = [];
	this.init(r, d1, d2, x, y, z);
}

BallGeometry.prototype = {
	constructor: BallGeometry,
	init: function(r, d1, d2, x, y, z) {
		var c = 2 * Math.PI,
			hc = c / 2,
			d90 = Math.PI / 2,
			cd,
			dm1 = hc / d1,
			dm2 = c / d2,
			t1, t2, tx, ty, tz, t, ar = [],
			arCol = [],
			i = 0;

		arCol.length = d2;

		for (t1 = 0; t1 <= d1; t1++) {
			cd = -d90 + t1 * dm1;
			t = Math.abs(Math.cos(cd)) * r;
			tz = Math.sin(cd) * r + z;
			ar = [];
			for (t2 = 0; t2 < d2; t2++) {
				tx = Math.cos(t2 * dm2) * t + x;
				ty = Math.sin(t2 * dm2) * t + y;
				this.vertexs.push([tx, ty, tz]);
				ar.push(i);
				arCol[i % d2] = arCol[i % d2] || [];
				arCol[i % d2].push(i);
				i++;
			}
			ar = ar.slice();
			ar.push(i - d2);
			this.paths.push(ar);
		}

		this.paths = this.paths.concat(arCol)

	}
}

inherit(Geometry, BallGeometry);

var BLineGeometry = function(vertexsAr, x, y, z) {
	Geometry.call(this);
	this.paths = [];
	this.vertexs = vertexsAr;
	this.init(x, y, z);
}


BLineGeometry.prototype = {
	constructor: BallGeometry,
	init: function(x, y, z) {
		var l = this.vertexs.length;
		var i = 0, j = 0;
		var sp;
		for(i;i < l; i++) {
			for(j = i + 1;j < l; j++) {
				this.paths.push([i, j]);
				
			}
		}
		l = this.vertexs.length;
		for(i = 0;i < l; i++) {
			this.vertexs[i][0] = this.vertexs[i][0] + x;
			this.vertexs[i][1] = this.vertexs[i][1] + y;
			this.vertexs[i][2] = this.vertexs[i][2] + z;
		}
		
	}
}

inherit(Geometry, BLineGeometry);

//}(window.S))