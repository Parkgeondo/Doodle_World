import {
    MeshBasicMaterial,
    AnimationMixer,
    DoubleSide,
    Mesh,
    Vector2,
    LoopOnce
} from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export default class Dust {
    constructor(info) {

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            '/models/cha.glb',
            gltf => {
            const material = new MeshBasicMaterial({
                map: texture,
                side: DoubleSide,
                transparent: true,
            })
                this.x = info.x;
                this.y = info.y;
                this.z = info.z;
                this.scale = info.scale;

                this.mesh = gltf.scene.children[0];

                //그린 그림을 텍스쳐로 적용
                this.mesh.children[0].material = material;

                this.mesh.position.set(this.x, this.y, this.z);
                this.mesh.scale.set(this.scale, this.scale, this.scale);

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
                this.actions[0].play();

                this.mesh.children[0].dragging = false;
                this.mesh.children[0].isDraggable = true;
                this.mesh.children[0].subject = 'plane';
                
                console.log(this.mesh)
            }
        )
    }
}