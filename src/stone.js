import {
    gltfLoader
} from 'three';

export default class Stone {
    constructor(info) {

        this.x = info.x;
        this.y = info.y;
        this.z = info.z;
        this.scale = info.scale;

        info.gltfLoader.load(
            info.modelSrc,
            glb => {
                this.mesh = glb.scene.children[0];
                this.mesh.position.set(this.x, this.y, this.z);
                this.mesh.scale.set(this.scale, this.scale, this.scale);
                info.scene.add(this.mesh)
                this.mesh.castShadow = true;
            }
        )
    }
}