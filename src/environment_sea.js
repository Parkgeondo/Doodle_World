import * as THREE from 'three';
import Stone from './stone';


export default class Environment_sea {
    constructor(info) {
        
        const { scene, gltfLoader } = info; // info 객체에서 scene 속성을 추출합니다.
        scene.background = new THREE.Color('#91e7ff')
        //fog 설정
        const FogColor = '#91e7ff';
        scene.fog = new THREE.Fog(FogColor, 4, 20);

        // Light 설정
        const ambientLight = new THREE.AmbientLight('white', 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight('#fff7db', 0.48);
        directionalLight.castShadow = true;
        directionalLight.position.x = 0.4;
        directionalLight.position.y = 2;
        directionalLight.position.z = 0.2;
        
        scene.add(directionalLight);

        //바닥 생성을 위한 부분
        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load('/images/sand.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.x = 80;
        floorTexture.repeat.y = 80;

        // 바닥 반복해서 깔아주는 설정
        const meshes = [];
        const floorMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({
                map: floorTexture
            })
        );
        

        floorMesh.name = 'floor';
        floorMesh.rotation.x = -Math.PI/2;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);
        meshes.push(floorMesh);

        const stone2 = new Stone({
        gltfLoader,
        scene,
        x: -2,
        y: 0.2,
        z: -4.3,
        scale: 0.9,
        modelSrc:'/models/stone_sea.glb'
        });

        const coral1 = new Stone({
        gltfLoader,
        scene,
        x: -0.5,
        y: 0.2,
        z: -4.3,
        scale: 0.8,
        modelSrc:'/models/coral.glb'
        });

        const coral2 = new Stone({
        gltfLoader,
        scene,
        x: -0.5,
        y: 0.1,
        z: -3.8,
        scale: 0.5,
        modelSrc:'/models/coral.glb'
        });

        const coral3 = new Stone({
        gltfLoader,
        scene,
        x: -5.0,
        y: -0.1,
        z: 3,
        scale: 1.5,
        modelSrc:'/models/coral2.glb'
        });
       
        const coral4 = new Stone({
        gltfLoader,
        scene,
        x: .0,
        y: -0.1,
        z: 5,
        scale: 0.7,
        modelSrc:'/models/coral3.glb'
        });

        const stone4 = new Stone({
        gltfLoader,
        scene,
        x: -7.5,
        y: 0.2,
        z: 1.6,
        scale: 0.8,
        modelSrc:'/models/stone_sea2.glb'
        });
        
        const stone5 = new Stone({
        gltfLoader,
        scene,
        x: -7.3,
        y: 0.2,
        z: 4.1,
        scale: 1.3,
        modelSrc:'/models/stone_sea.glb'
        });

        const stone6 = new Stone({
        gltfLoader,
        scene,
        x: -1.0,
        y: 0.2,
        z: 6.5,
        scale: 0.8,
        modelSrc:'/models/stone_sea.glb'
        });
        
        const stone7 = new Stone({
        gltfLoader,
        scene,
        x: 0,
        y: -1.2,
        z: 4.3,
        scale: 0.8,
        modelSrc:'/models/stone_sea.glb'
        });
        
        const stone8 = new Stone({
        gltfLoader,
        scene,
        x: -3,
        y: -1.2,
        z: -3.0,
        scale: 0.8,
        modelSrc:'/models/stone_sea.glb'
        });

    }

    
        // const Hou = new House({
        //    gltfLoader,
        //    scene,
        //    x:-9,
        //    y:0.6,
        //    z:4.3,
        //    scale: 1.8,
        //    modelSrc:'/models/stone.glb'
        // });
        // const Hou2 = new House({
        //    gltfLoader,
        //    scene,
        //    x:-6,
        //    y: 0.4,
        //    z: 4.3,
        //    scale: 0.8,
        //    modelSrc:'/models/stone.glb'
        // });

        
        // const plane2 = new Plane({
        //    textureLoader2,
        //       scene,
        //       // geometry: planeGeometry,
        //       imageSrc: './images/pig.png',
        //       // imageSrc: dataURL,
        //       x:0,
        //       y:0,
        //       z:0,
        //       scale:0.5
        //    });
}