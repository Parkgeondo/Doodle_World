import {
    MeshStandardMaterial,
    ConeGeometry,
    CylinderGeometry,
    Mesh,
    Group,
} from 'three';

export default class Tree {
    constructor(info) {
        const geometry = new ConeGeometry( 0.3, 0.6, 6, 1. );
        const material = new MeshStandardMaterial( {color: '#69B943'} );

        const cylinderGeometry = new CylinderGeometry( 0.1, 0.1, 1, 6 );
        const material2 = new MeshStandardMaterial( {color: '#B5A788'} );


        this.scale = info.scale;

        this.x = info.x;
        this.y = info.y;
        this.z = info.z;

        this.mesh = new Mesh(geometry, material);
        this.mesh2 = new Mesh(geometry, material);
        this.mesh3 = new Mesh(geometry, material);
        this.cylinder = new Mesh(cylinderGeometry, material2);

        this.mesh.position.set(0, this.y, 0);
        this.mesh2.position.set(0, this.y - 0.2, 0);
        this.mesh3.position.set(0, this.y - 0.6, 0);
        this.cylinder.position.set(0, this.y - 1.2, 0);


        this.mesh.scale.set(0.8,0.8,0.8,);
        this.mesh2.scale.set(1.2,1.2,1.2,);
        this.mesh3.scale.set(1.8,1.8,1.8,);
        this.mesh.castShadow = true;
        this.mesh2.castShadow = true;
        this.mesh3.castShadow = true;
        this.cylinder.castShadow = true;

        const group = new Group();
        group.add( this.mesh );
        group.add( this.mesh2 );
        group.add( this.mesh3 );
        group.add( this.cylinder );

        group.scale.set(this.scale,this.scale,this.scale);
        group.position.set(this.x,0,this.z);

        // info.scene.add(this.mesh);
        // info.scene.add(this.mesh2);
        // info.scene.add(this.mesh3);
        info.scene.add(group);
    }
}