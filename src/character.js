import {
    MeshBasicMaterial,
    DoubleSide,
    Mesh
} from 'three';

export default class Plane {
    constructor(info) {
        const texture = info.textureLoader2.load(info.imageSrc)
        const material = new MeshBasicMaterial({
            map: texture,
            side: DoubleSide,
            transparent: true,
        })

        this.x = info.x;
        this.y = info.y;
        this.z = info.z;

        this.mesh = new Mesh(info.geometry, material);

        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = 1.8;
        this.mesh.isDraggable = true;

        

        info.scene.add(this.mesh);
    }
}