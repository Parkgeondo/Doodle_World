import * as THREE from 'three';
import Tree from './tree';
import Stone from './stone';


export default class Environment {
    constructor(info) {

        const { scene, gltfLoader } = info; // info 객체에서 scene 속성을 추출합니다.

        scene.background = new THREE.Color('#142150')
        //fog 설정
        const FogColor = '#142150';
        scene.fog = new THREE.Fog(FogColor, 25, 30);

        // Light 설정
        const ambientLight = new THREE.AmbientLight('#7285C8', 0.68);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight('#7285C8', 0.48);
        directionalLight.castShadow = true;
        directionalLight.position.x = 0.4;
        directionalLight.position.y = 2;
        directionalLight.position.z = 0.2;
        
        scene.add(directionalLight);

        //바닥 생성을 위한 부분
        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load('/images/grass.png');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.x = 10;
        floorTexture.repeat.y = 10;

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


        const tree = new Tree({
            scene,
            x:-4.3,
            y:1.6,
            z:-3,
            scale:0.8
        });
        
        const tree2 = new Tree({
            scene,
            x:-4,
            y:1.6,
            z:-2.0,
            scale:1
        });

        const tree3 = new Tree({
            scene,
            x:-3,
            y:1.6,
            z:4,
            scale:1
        });

        const tree4 = new Tree({
            scene,
            x:-0.2,
            y:1.6,
            z:4,
            scale:0.8
        });

        const tree5 = new Tree({
            scene,
            x:-1,
            y:1.6,
            z:-2.4,
            scale:0.85
        });

        const tree6 = new Tree({
            scene,
            x:-4,
            y:1.6,
            z:0.5,
            scale:0.85
        });

        const tree7 = new Tree({
            scene,
            x:-4.3,
            y:1.6,
            z:1.5,
            scale:0.85
        });

        const tree8 = new Tree({
        scene,
        x:-4,
        y:1.6,
        z:2.5,
        scale:1.2
        });

        const stone = new Stone({
        gltfLoader,
        scene,
        x: -2,
        y: 0.2,
        z: 4.3,
        scale: 0.5,
        modelSrc:'/models/stone.glb'
        });

        const stone2 = new Stone({
        gltfLoader,
        scene,
        x: -2,
        y: 0.2,
        z: -4.3,
        scale: 0.9,
        modelSrc:'/models/stone.glb'
        });
        const stone3 = new Stone({
        gltfLoader,
        scene,
        x: -0.5,
        y: 0.2,
        z: -4.3,
        scale: 0.4,
        modelSrc:'/models/stone.glb'
        });
        const stone4 = new Stone({
        gltfLoader,
        scene,
        x: -7.5,
        y: 0.2,
        z: 1.6,
        scale: 1.4,
        modelSrc:'/models/stone.glb'
        });

    }
}