import {
    MeshBasicMaterial,
    AnimationMixer,
    DoubleSide,
    Mesh,
    Vector2,
    LoopOnce
} from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export default class Plane {
    constructor(info) {
        // const texture = info.textureLoader2.load(info.imageSrc)
        // texture.rotation = Math.PI/2;
        // texture.center = new Vector2(0.5, 0.5);
        // texture.repeat.x = - 1;

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            info.modelSrc,
            gltf => {

                this.modelSrc = info.modelSrc;
                this.x = info.x;
                this.y = info.y;
                this.z = info.z;
                this.scale = info.scale;

                this.mesh = gltf.scene.children[0];

                this.mesh.position.set(this.x, this.y, this.z);
                this.mesh.scale.set(this.scale, this.scale, this.scale);

                this.rotationratio = info.rotation * Math.PI / 2

                this.mesh.rotation.set(0, this.rotationratio, 0);

                info.scene.add(this.mesh)

                this.mesh.animation = gltf.animations;
                this.mixer = new AnimationMixer(this.mesh)
                this.actions = [];
                this.actions[0] = this.mixer.clipAction(this.mesh.animation[0]);
                this.actions[2] = this.mixer.clipAction(this.mesh.animation[2]);
                
                this.actions[1] = this.mixer.clipAction(this.mesh.animation[1]);
                this.actions[3] = this.mixer.clipAction(this.mesh.animation[3]);

                // 떨어지는 애니메이션
                this.actions[2].play();
                this.actions[2].loop = LoopOnce;

                // 숨쉬는 애니메이션
                // this.actions[0].play();

                this.mesh.castShadow = true;

                this.mesh.children[0].dragging = false;
                this.mesh.children[0].isDraggable = true;
                this.mesh.children[0].subject = 'house';
                
                console.log(this.mesh)
            }
        )
        
    }
}

