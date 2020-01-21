var PrimitiveTexture= (
    function () {
        var vertexShader;
        var fragmentShader;
        var materialShader;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            materialShader = getMS();
            url = options.url

            var postionsTemp = [];
            //纹理坐标
           var stsTemp = [0,0,1,0,1,1,0,1];
          // var stsTemp = [1,1,0,1,0,0,1,0];
            //索引数组
            var indicesTesm = [0,1,2,0,2,3];

            for (var i = 0; i < options.Cartesians.length; i++) {
                postionsTemp.push(options.Cartesians[i].x);
                postionsTemp.push(options.Cartesians[i].y);
                postionsTemp.push(options.Cartesians[i].z);
            }
            console.log("pos:"+postionsTemp)

            this.positionArr = new Float32Array(postionsTemp);
            this.sts = new Uint8Array(stsTemp);
            this.indiceArr = new Uint16Array(indicesTesm);

            //通过坐标数组，索引数组，纹理坐标数组创建多边形
            this.geometry = CreateGeometry(this.positionArr, this.sts, this.indiceArr);
            this.appearance = CreateAppearence(fragmentShader, vertexShader,materialShader,url);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this.geometry
                }),
                appearance: this.appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, sts, indices) {
            let sess= new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: sts
            })

            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    st:sess
                },
                indices: indices,//索引指标，指示创建三角形的顺序
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs,ms,url) {
            return new Cesium.Appearance({
                material: new Cesium.Material({
                    fabric: {
                        uniforms: {
                            image: url
                        },
                        source: ms
                    }
                }),
                aboveGround: true,
                faceForward: true,
                flat: true,
                translucent: false,
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
                    depthTest: { enabled: true },
                    depthMask: true,
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec2 st;\
            attribute float batchId;\
            varying vec2 v_st;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_st=st;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
            }\
            ";
        }
        function getFS() {
            return "varying vec2 v_st;\
            void main()\
            {\
                czm_materialInput materialInput;\
                czm_material material=czm_getMaterial(materialInput,v_st);\
                vec4 color=vec4(material.diffuse + material.emission,material.alpha);\
                if(color.x==1.0&&color.y==1.0&&color.z==1.0&&color.w==1.0) color=vec4(vec3(0.0,0.0,0.0),0.0);\
                gl_FragColor =color;\
            }\
            ";
        }
        function getMS() {
            return "czm_material czm_getMaterial(czm_materialInput materialInput,vec2 v_st)\
            {\
                vec4 color = texture2D(image, v_st);\
                czm_material material = czm_getDefaultMaterial(materialInput);\
                material.diffuse= color.rgb;\
                material.alpha=color.a;\
                return material;\
            }\
            ";
        }

        return _;
    })()
export {PrimitiveTexture}
