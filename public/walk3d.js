(function(global, console) {
    "use strict";
    
    console.clear();
    
    var prefixes = [ '', 'moz', 'webkit', 'ms', 'o' ],
        requestPointerLock = findPrefixedFn(ptrlock, 'requestPointerLock'),
        exitPointerLock = findPrefixedFn(document, 'exitPointerLock');
    
    var xeach = Array.prototype.forEach.call.bind(Array.prototype.forEach),
        xmap = Array.prototype.map.call.bind(Array.prototype.map),
        xreduce = Array.prototype.reduce.call.bind(Array.prototype.reduce),
        xslice = Array.prototype.slice.call.bind(Array.prototype.slice),
        xindexOf = Array.prototype.indexOf.call.bind(Array.prototype.indexOf),
        pi = Math.PI || 3.14159265358979323;
    
    var MatrixStack = makeMatrixStackClass(),
        ms = new MatrixStack(),
        frameNum = 0;
    
    var Face = makeFaceClass();
    
    var camPos = { x: 0, y: 0, z: 0 },
        camVel = { x: 0, y: 0, z: 0 },
        camAng = { x: 0, y: 0, z: 0 },
        xaxis =  Object.freeze({ x: 1, y: 0, z: 0 }),
        yaxis =  Object.freeze({ x: 0, y: 1, z: 0 }),
        zaxis =  Object.freeze({ x: 0, y: 0, z: 1 }),
        view = qs('.view'),
        wallTemplate = removeElement(qs('.wall')),
        faces = [],
        captured = false,
        input = { u: 0, d: 0, l: 0, r: 0 },
        updateMap = noop;
    
    var charCodes = ['W', 'A', 'S', 'D'].reduce(function(r, c) {
        r[c] = c.charCodeAt(0);
        return r;
    }, {});
    
    makeFaces();
    
    qs('.map-editor-enabled').addEventListener('change', function(event) {
        qs('.map-palette').classList.toggle('hidden', 
            !event.currentTarget.checked);
        qs('.map-editor').classList.toggle('hidden', 
            !event.currentTarget.checked);
    });
    
    qs('.backface-cull-enabled')
        .addEventListener('change', function(event) {
        view.classList.toggle('no-backface-cull', 
            !event.currentTarget.checked);
    });
    
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyHandler);

    view.addEventListener('click', function(event) {
        if (!captured) {
            requestPointerLock(view);
            captured = true;
        } else {
            captured = false;
            exitPointerLock(document);
        }
    });
    
    view.addEventListener('mousemove', function(event) {
        if (!captured)
            return;
        
        var x = event.movementX || 0,
            y = event.movementY || 0;
        camAng.y += x / 300;
        camAng.x -= y / 600;
        
        //console.log(Math.sin(camAng.y), Math.cos(camAng.y));
    });
    
    requestAnimationFrame(function frame() {
        ++frameNum;
        test();
        requestAnimationFrame(frame);
        
        if ((frameNum & 0x0f) === 0 && (camVel.x || camVel.y || camVel.z)) {
            updateMap();
            sortByDistance();
        }
    });
    
    mapEditor();
    
    function noop() {
    }

    function keyHandler(event) {
        var down = (event.type === 'keydown') ? 1 : 0;
        switch (event.which) {
            case 27:
                captured = false;
                break;
            case charCodes.W:
                input.u = down;
                break;
            case charCodes.A:
                input.l = down;
                break;
            case charCodes.D:
                input.r = down;
                break;
            case charCodes.S:
                input.d = down;
                break;
            case 37:
                camAng.y -= 0.01;
                break;
            case 39:
                camAng.y += 0.01;
                break;
        }
    }
        
    function findPrefixedFn(obj, name) {
        return prefixes.reduce(function(result, prefix) {
            var prefixedName,
                f;
            
            if (!result) {
                if (prefix)
                    prefixedName = prefix + name[0].toUpperCase() + name.substr(1);
                else
                    prefixedName = name;
                
                f = obj[prefixedName];
            }
            
            if (f)
                result = f.call.bind(f);
            
            return result;
        }, null);
    }
    
    function sortByDistance() {
        var sorted = faces.reduce(function(sorted, face) {
            var toCam = {
                    x: face.pos.x - camPos.x,
                    y: face.pos.y - camPos.y,
                    z: face.pos.z - camPos.z
                },
                dist = toCam.x * toCam.x + 
                    toCam.y * toCam.y +
                    toCam.z * toCam.z,
                visible = dist < (2000*2000);
            face.visible = visible;
            face.dist = dist;
            
            if (visible) {
                sorted.push(face);
            } else if (!visible && face.inDocument) {
                face.inDocument = false;
                view.removeChild(face.element);
            }
            
            return sorted;
        }, []);
        
        sorted.sort(function(a, b) {
            /*var ax = (a.axis.x != 0) | 
                ((a.axis.y != 0)<<1) |
                ((a.axis.z != 0)<<2);
            var bx = (b.axis.x != 0) | 
                ((b.axis.y != 0)<<1) |
                ((b.axis.z != 0)<<2);*/
            return (/*ax < bx ? -1 :
                bx < ax ? 1 : */
                a.dist < b.dist ? -1 :
                b.dist < a.dist ? 1 :
                0);
        });
        
        sorted.reduce(function(prev, face, index, sorted) {
            var dist = Math.sqrt(face.dist),
                far = 2000;
            //face.element.style.zIndex = sorted.length - (index + 1);
            if (face.visible) {
                view.insertBefore(face.element, prev);
                face.inDocument = true;
                
                prev = face.element;
            }
            
            return prev;
        }, null);
    }

    function makeFaceClass() {
        Face.prototype = {
            reposition: function(ms) {
                ms.push();
                ms.translate(this.pos);
                ms.rotate(this.axis, this.angle);
                this.element.style.transform = ms.css();
                ms.pop();
            }
        };
        return Face;
        
        function Face(pos, axis, angle, material) {
            this.element = document.createElement('div');
            this.element.classList.add('wall');
            view.appendChild(this.element);
            this.pos = pos;
            this.axis = axis || xaxis;
            this.angle = angle || 0;
            this.visible = true;
            this.inDocument = true;
            this.material = material || '';
            if (material) {
                this.element.setAttribute('data-material', material);
                this.element.classList.add('texture-' + material);
            }
            this.dist = 0;
        }
    }

    // sin(  0deg) =  0   cos(  0deg) =  1
    // sin( 90deg) =  1   cos( 90deg) =  0
    // sin(180deg) =  0   cos(180deg) = -1
    // sin(270deg) = -1   cos(270deg) =  0

    // 0 faces in +Z direction, grows in the +X direction
    // 1 faces in +X direction, grows in the -Z direction
    // 2 faces in -Z direction, grows in the -X direction
    // 3 faces in -X direction, grows in the +Z direction

    // 0 -> cos*x + sin*y, sin*x + cos*y
    // 1 -> 

    function rad(deg) {
        return deg * pi / 180;
    }

    function deg(rad) {
        return rad * 180 / pi;
    }
        
        // Facing right on left edge of map square
    function makeWallLeftFacingRight(col, row, material) {
        faces.push(new Face({
            z: 128+128*row,
            y: 300-64,
            x: 128*col
        }, yaxis, pi/2, material));
    }
        
        // Facing right on left edge of map square
    function makeWallRightFacingLeft(col, row, material) {
        faces.push(new Face({
            z: 128*row,
            y: 300-64,
            x: 128+128*col
        }, yaxis, -pi/2, material));
    }

    function makeWallTopFacingDown(col, row, material) {
        faces.push(new Face({
            z: 128*row,
            y: 300-64,
            x: 128*col
        }, yaxis, 0*pi/2, material));
    }
    
    function makeWallBottomFacingUp(col, row, material) {
        faces.push(new Face({
            z: 128+row*128,
            y: 300-64 + 128,
            x: 128*col
        }, xaxis, -pi, material));
    }
    
    function makeFloor(col, row, material) {
        faces.push(new Face({
            z: 128*row,
            y: 300-64 + 128,
            x: 128*col
        }, xaxis, pi/2, material));
    }
    
    function makeCeiling(col, row, material) {
        faces.push(new Face({
            z: 128+128*row,
            y: 300-64,
            x: 128*col
        }, xaxis, -pi/2, material));
    }
    
    // Facing down on top edge of map square

    function makeRoom(sc, sr, ec, er, wm, fm, cm) {
        var c, r;
        for (r = sr; r <= er; ++r) {
            makeWallLeftFacingRight(sc, r, wm);
            for (c = sc; c <= ec; ++c) {
                if (r === sr)
                    makeWallTopFacingDown(c, r, wm);
                makeFloor(c, r, fm);
                makeCeiling(c, r, cm);
                if (r === er)
                    makeWallBottomFacingUp(c, r, wm);
            }
            makeWallRightFacingLeft(ec, r, wm);
        }
    }
    
    function makeFaces() {
        makeRoom(0, 0, 10, 10, 'brick', 'concrete', 'concrete');
    }
    
    function test() {
        var i,
            timeScale = 4/1,
            len;

        if (input.u) {
            camVel.z += Math.cos(camAng.y) * -timeScale;
            camVel.x -= Math.sin(camAng.y) * -timeScale;
        }
        if (input.d) {
            camVel.z += Math.cos(camAng.y) * timeScale;
            camVel.x -= Math.sin(camAng.y) * timeScale;
        }
        if (input.l) {
            camVel.x += Math.cos(camAng.y) * -timeScale;
            camVel.z += Math.sin(camAng.y) * -timeScale;
        }
        if (input.r) {
            camVel.x += Math.cos(camAng.y) * timeScale;
            camVel.z += Math.sin(camAng.y) * timeScale;
        }

        camVel.x *= 0.5;
        camVel.y *= 0.5;
        camVel.z *= 0.5;
        len = Math.sqrt(camVel.x * camVel.x +
            camVel.y * camVel.y + camVel.z * camVel.z);
        if (len > 10) {
            len = 10/len;
            camVel.x *= len;
            camVel.y *= len;
            camVel.z *= len;
        }

        // Avoid denormals
        camVel.x *= Math.abs(camVel.x) >= 1e-3 ? 1 : 0;
        camVel.y *= Math.abs(camVel.y) >= 1e-3 ? 1 : 0;
        camVel.z *= Math.abs(camVel.z) >= 1e-3 ? 1 : 0;

        camPos.x += camVel.x * timeScale;
        camPos.y += camVel.y * timeScale;
        camPos.z += camVel.z * timeScale;
        
        // Setup camera transform and compensate for weird origin at top left
        ms.reset();
        ms.translate({ x: 400, y: 300, z: 911 });
        ms.rotate(xaxis, camAng.x);
        ms.rotate(yaxis, camAng.y);
        ms.translate({ x: 0, y: -300, z: 0 });
        ms.translate({
            x: -camPos.x,
            y: -camPos.y,
            z: -camPos.z
        });
        
        faces.forEach(function(face) {
            if (face.visible)
                face.reposition(ms);
        });
    }
    
    function matrixToCSS(m) {
        return [
            'matrix3d(',
            m[0][0], ',', m[1][0], ',', m[2][0], ',', m[3][0], ',',
            m[0][1], ',', m[1][1], ',', m[2][1], ',', m[3][1], ',',
            m[0][2], ',', m[1][2], ',', m[2][2], ',', m[3][2], ',',
            m[0][3], ',', m[1][3], ',', m[2][3], ',', m[3][3], ')'
        ].join('');
    }
    
    // Multiply arbitrary matrices
    function matmul(a, b) {
        var d = a.length,
            r, c, v, t,
            p = [],
            pr;
        
        console.assert(d === 4);
        
        for (r = 0; r < d; ++r) {
            pr = [];
            p.push(pr);
            for (c = 0; c < d; ++c) {
                t = 0;
                for (v = 0; v < d; ++v)
                    t += a[r][v] * b[v][c];
                pr.push(t);
            }
        }
        
        return p;
    }
    
    function makeRotateAxis(axis, angleRads) {
        var c, s, t, sv, tv;
        
        s = Math.sin(angleRads);
        c = Math.cos(angleRads);
        
        t = 1.0 - c;
        
        sv = {
            x: axis.x * s,
            y: axis.y * s,
            z: axis.z * s
        };
        tv = {
            x: axis.x * t,
            y: axis.y * t,
            z: axis.z * t
        };
        
        return [
            [
                tv.x * axis.x + c,		// txx + c
                tv.x * axis.y - sv.z,	// txy - sz
                tv.x * axis.z + sv.y,	// txz + sy
                0.0
            ],
            [
                tv.x * axis.y + sv.z,	// txy + sz
                tv.y * axis.y + c,		// tyy + c
                tv.y * axis.z - sv.x,	// tyz - sx
                0.0
            ],
            [
                tv.x * axis.z - sv.y,	// txz - sy
                tv.y * axis.z + sv.x,	// tyz + sx
                tv.z * axis.z + c,		// tzz + c
                0.0
            ],
            [
                0.0, 0.0, 0.0, 1.0
            ]
        ];
    }
    
    function makeTranslate(vec) {
        return [
            [ 1, 0, 0, vec.x ],
            [ 0, 1, 0, vec.y ],
            [ 0, 0, 1, vec.z ],
            [ 0, 0, 0, 1 ]
        ];
    }
    
    function makeIdentity() {
        return [
            [ 1, 0, 0, 0 ],
            [ 0, 1, 0, 0 ],
            [ 0, 0, 1, 0 ],
            [ 0, 0, 0, 1 ]
        ];
    }
    
    function makeMatrixStackClass() {
        MatrixStack.prototype.rotate = function(axis, angle) {
            return this.transform(makeRotateAxis.bind(null, axis, angle));
        };
        MatrixStack.prototype.translate = function(vec) {
            return this.transform(makeTranslate.bind(null, vec));
        };
        MatrixStack.prototype.identity = function(vec) {
            return this.transform(makeTranslate.bind(null, vec));
        };
        MatrixStack.prototype.transform = function(matrixFactory) {
            console.assert(this.stack.length > 0);
            var last = this.stack.length - 1,
                mr = matrixFactory();
            this.stack[last] = matmul(this.stack[last], mr);
            
            return this;
        };
        MatrixStack.prototype.load = function(matrix) {
            console.assert(this.stack.length > 0);
            var stack = this.stack,
                last = stack.length - 1;
            stack[last] = matrix;
            
            return this;
        };
        MatrixStack.prototype.push = function() {
            console.assert(this.stack.length < 1024);
            var clone = xslice(this.stack[this.stack.length-1]);
            this.stack.push(clone);
            
            return this;
        };
        MatrixStack.prototype.pop = function() {
            console.assert(this.stack.length > 0);
            this.stack.pop();
            
            return this;
        };
        MatrixStack.prototype.reset = function() {
            this.stack.splice(0, this.stack.length, makeIdentity());
            console.assert(this.stack.length === 1);
            return this;
        };
        MatrixStack.prototype.css = function() {
            console.assert(this.stack.length > 0);
            return matrixToCSS(this.stack[this.stack.length-1]);
        };
        return MatrixStack;
        function MatrixStack() {
            console.assert(this !== undefined && this !== global, "Use new");
            this.stack = [];
            this.stack.push(makeIdentity());
        }
    }
    
    function mapEditor() {
        var editor = qs('.map-editor'),
            editorContainer = qs('.map-editor-container'),
            cell = qs('.map-square', editor),
            rows = 36,// 54,
            cols = 64,//96,
            rowSize = 16,
            colSize = 16,
            
            // 96*54=5184
            total = rows*cols,
                
            cellDocFrag;
        
        var dragging = false,
            inside = false,
            startCellPos,
            endCellPos,
            dragBox;
        
        updateMap = updateMapArrow;
        
        start();
        
        function start() {
            cell.parentNode.removeChild(cell);

            cellDocFrag = seq(rows).reduce(function(cellDocFrag, rowIndex) {
                return seq(cols).reduce(function(cellDocFrag, colIndex) {
                    var el = cell.cloneNode(),
                        s = cell.style;
                    s.left = (colIndex * colSize) + 'px';
                    s.top = (rowIndex * rowSize) + 'px';
                    //s.backgroundColor = '#CEF';
                    cellDocFrag.appendChild(el);
                    return cellDocFrag;
                }, cellDocFrag);
            }, document.createDocumentFragment());

            editor.appendChild(cellDocFrag);

            editor.addEventListener('mousedown', mouseDownHandler);
            editor.addEventListener('mouseup', mouseUpHandler);
            editor.addEventListener('mousemove', mouseMoveHandler);
            editor.addEventListener('mouseover', mouseOverHandler);
            editor.addEventListener('mouseout', mouseOutHandler);
            
            parseHash();
            
            window.addEventListener('hashchange', function(event) {
                parseHash();
            });
        }

        function parseHash() {
            var hash = location.hash && location.hash.substr(1),
                data;
            
            try {
                data = decodeURIComponent(hash);
            } catch (err) {
                data = 'x';
            }
            
            if (data) {
                deserialize(data);
                scanForFaces();
                sortByDistance();
            }
        }
        
        function escapeCSS(text) {
            return text.replace(/,/g, '\\$&');
        }
        
        function scanForFaces() {
            var i, li, ri, ui, di,  // index
                e, le, re, ue, de,  // element
                t, lt, rt, ut, dt,  // material
                w, lw, rw, uw, dw,  // isWall
                p,
                col, row,
                cells;
            
            // Discard all face objects and remove their elements
            faces.splice(0, faces.length).forEach(function(face) {
                face.element && face.element.parentNode &&
                    face.element.parentNode.removeChild(face.element);
            });
            
            // Create a data structure for each cell
            cells = xmap(editor.childNodes, function(node, index) {
                return {
                    element: node,
                    material: node.getAttribute('data-material') || '',
                    index: index,
                    col: 0,
                    row: 0,
                    adj: {
                        u: null,
                        d: null,
                        l: null,
                        r: null
                    }
                };
            });
            
            // Cross connect rows and columns
            cells.forEach(function(cell, index, cells) {
                cell.adj.u = this.row > 0 ? cells[index-cols] : null;
                cell.adj.d = this.row + 1 < this.rows ? cells[index+cols] : null;
                cell.adj.l = this.col > 0 ? cells[index-1] : null;
                cell.adj.r = this.col + 1 < this.cols ? cells[index+1] : null;
                cell.col = this.col;
                cell.row = this.row;
                return nextCell(this);
            }, { row: 0, col: 0, rows: rows, cols: cols });

            cells.forEach(function(cell, index, cells) {
                var w, lw, rw, uw, dw, t, lt, rt, ut, dt,
                    col = this.col,
                    row = this.row;
                
                // Ignore border cells
                if (!cell.adj.l || 
                    !cell.adj.r ||
                    !cell.adj.u ||
                    !cell.adj.d) {
                    return nextCell(this);
                }
                
                t = cell.material;
                lt = cell.adj.l.material;
                rt = cell.adj.r.material;
                ut = cell.adj.u.material;
                dt = cell.adj.d.material;
                
                w = (t[0] === 'w');
                lw = (lt[0] === 'w');
                rw = (rt[0] === 'w');
                uw = (ut[0] === 'w');
                dw = (dt[0] === 'w');
                
                if (t)
                    p = cell.material.split(/,/);
                
                // if the left is not a wall and this is a wall
                if (w && !lw && lt)
                    makeWallRightFacingLeft(col - 1, row, p[1]);
                if (w && !rw && rt)
                    makeWallLeftFacingRight(col + 1, row, p[1]);
                if (w && !uw && ut)
                    makeWallBottomFacingUp(col, row - 1, p[1]);
                if (w && !dw && dt)
                    makeWallTopFacingDown(col, row + 1, p[1]);

                if (!w && t) {
                    if (p[1])
                        makeFloor(col, row, p[1]);

                    if (p[2])
                        makeCeiling(col, row, p[2]);
                }
                
                return nextCell(this);
            }, { row: 0, col: 0, rows: rows, cols: cols });
            
            console.log(view.childNodes.length, 'faces');
        }
        
        function nextCell(state) {
            if (++state.col >= state.cols) {
                state.col = 0;
                ++state.row;
            }
        }

        function cellIndexOf(element) {
            return xindexOf(editor.childNodes, element);
        }
        
        function cellPosFromIndex(i) {
            return i >= 0 && {
                col: i % cols,
                row: Math.floor(i / cols)
            } || null;
        }

        function cellPos(element) {
            var i = cellIndexOf(element);
            return cellPosFromIndex(i);
        }
        
        function serialize() {
            var row, col, i = 0, result = {}, cell,
                material,
                nextMaterialId = 1,
                materialId,
                materialToId = {};
            
            for (row = 0; row < rows; ++row) {
                for (col = 0; col < cols; ++i, ++col) {
                    cell = editor.childNodes[i];
                    material = cell.getAttribute('data-material') || '';
                    if (!material)
                        continue;
                    if (!Object.prototype.hasOwnProperty.call(
                        materialToId, material)) {
                        materialId = nextMaterialId++;
                        materialToId[material] = materialId;
                    } else {
                        materialId = materialToId[material];
                    }
                    
                    if (!result[row])
                        result[row] = {};
                    
                    result[row][col] = materialId;
                }
            }
            
            result.materials = {};
            
            Object.keys(materialToId).forEach(function(material) {
                var id = this[material];
                result.materials[id] = material;
            }, materialToId);
            
            result.camPos = camPos;
            result.camAng = camAng;
            
            return (JSON.stringify(result)
                .replace(/"/g, "'")
                .replace(/:/g, '~')
                .replace(/,/g, '*'));
        }
        
        function safeParse(serial) {
            try {
                return JSON.parse(serial
                    .replace(/\*/g, ',')
                    .replace(/~/g, ':')
                    .replace(/'/g, '"'));
            } catch (err) {
                return { materials: {} };
            }
        }
        
        function deserialize(serial) {
            var data = safeParse(serial);
            xeach(editor.childNodes, function(node, i) {
                var pos = cellPosFromIndex(i),
                    materialId,
                    material,
                    rowData = data[pos.row],
                    valueElement,
                    value;
                materialId = rowData && rowData[pos.col] || '';
                material = data.materials[materialId] || '';
                node.setAttribute('data-material', material || '');
                valueElement = material && qs(
                    'input[name=brush][data-material="' + 
                    escapeCSS(material || '') + '"]');
                value = valueElement && valueElement.value || '';
                node.style.backgroundColor = value;
            });
            
            if (data.camAng) {
                camAng.x = data.camAng.x;
                camAng.y = data.camAng.y;
                camAng.z = data.camAng.z;
            }
            
            if (data.camPos) {
                camPos.x = data.camPos.x;
                camPos.y = data.camPos.y;
                camPos.z = data.camPos.z;
            }
        }
        
        function mouseDownHandler(event) {
            var target = closestWithClass(event.target, 'map-square');
            if (!target)
                return;
            event.preventDefault();
            
            dragging = true;
            startCellPos = cellPos(target);
        }
        
        function mouseUpHandler(event) {
            var target = closestWithClass(event.target, 'map-square'),
                row,
                col,
                el,
                s,
                value,
                data,
                any = false;

            event.preventDefault();

            endCellPos = cellPos(target);

            value = qs('input[type=radio][name=brush]:checked');
            data = value && value.getAttribute('data-material') || '';
            value = value && value.value || '';

            dragging = false;

            for (row = Math.min(startCellPos.row, endCellPos.row);
                    row <= Math.max(startCellPos.row, endCellPos.row); ++row) {
                for (col = Math.min(startCellPos.col, endCellPos.col); 
                        col <= Math.max(startCellPos.col, endCellPos.col); ++col) {
                    el = editor.childNodes[row * cols + col];
                    el.setAttribute('data-material', data);
                    s = el.style;
                    s.backgroundColor = value;
                    any = true;
                }
            }
            
            if (any) {
                location.hash = '#' + encodeURIComponent(serialize());
                scanForFaces();
            }
        }
        
        function mouseMoveHandler(event) {
            inside = true;
        }
        
        function mouseOverHandler(event) {
            inside = true;
            
        }
        
        function mouseOutHandler(event) {
            inside = false;
        }
        
        var mapArrow,
            editorRect;
        function updateMapArrow() {
            if (!editorRect) {
                editorRect = qs('.map-editor').getBoundingClientRect();
            }
            if (!mapArrow) {
                mapArrow = document.createElement('div');
                mapArrow.classList.add('map-arrow');
                // U+2191 = Up arrow
                mapArrow.appendChild(document.createTextNode('\u2191'));
                document.body.appendChild(mapArrow);
            }
            mapArrow.style.left = (-16 + editorRect.left - 
                editorContainer.scrollLeft + 
                camPos.x * 16 / 128) + 'px';
            mapArrow.style.top = (-0 + editorRect.top - 
                editorContainer.scrollTop +  + 
                camPos.z * 16 / 128) + 'px';
            mapArrow.style.transform = [
                'translate(-50%, -50%)',
                ' rotate(', camAng.y, 'rad)'
            ].join('');
        }
    }

    function closestWithClass(from, className) {
        while (from && !from.classList.contains(className))
            from = from.parentNode;
        return from || null;
    }
    
    function hex2(n) {
        return ('0' + Math.floor(Math.min(Math.max(n, 0), 255)
            ).toString(16)).substr(-2);
    }
    
    function seq(n) {
        for (var i = 0, r = []; i < n && r.push(i); ++i);
        return r;
    }
    
    function emptyElements(/*...arrays...*/) {
        xeach(arguments, function(elements) {
            xeach(elements, function(element) {
                xeach(element.childNodes, function(child) {
                    this.removeChild(child);
                }, element);
            });
        });
    }
    
    function setAttributes(obj, attr) {
        var keys = Object.keys(attr);
        if (obj instanceof Array) {
            return xmap(function(obj) {
                return setAttributes(obj, this);
            }, attr);
        }
        
        return xreduce(keys, function(obj, key) {
            obj.setAttribute(obj, attr[key]);
            return obj;
        }, obj);
    }
    
    function setProperties(obj, props) {
        var keys = Object.keys(props);
        if (obj instanceof Array) {
            return xmap(function(obj) {
                return setAttributes(obj, this);
            }, attr);
        }
        
        return xreduce(keys, function(obj, key) {
            obj.setAttribute(key, attr[key]);
            return obj;
        }, obj);
    }
    
    function removeElement(element) {
        if (element && element.parentNode)
            element.parentNode.removeChild(element);
        return element;
    }
    
    function qs(selector, context) {
        return (context || global.document).querySelector(selector);
    }
    
    function qsa(selector, context) {
        return Array.prototype.slice.call(
            (context || global.document).querySelectorAll(selector));
    }
}(this, console));
