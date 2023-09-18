import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { DragControls } from "three/examples/jsm/controls/DragControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { PreventDragClick } from "./PreventDragClick"
import Plane from './plane';
import createP5 from './sketch';
import Tree from './tree';
import Stone from './stone';
import House from './House';


export default function example() {
    

   //바닥 생성을 위한 부분
   const textureLoader = new THREE.TextureLoader();
   const floorTexture = textureLoader.load('/images/grass.png');
   floorTexture.wrapS = THREE.RepeatWrapping;
   floorTexture.wrapT = THREE.RepeatWrapping;
   floorTexture.repeat.x = 10;
   floorTexture.repeat.y = 10;


   // three.js 캔버스
   const canvas = document.querySelector('#three-canvas');

   // Renderer 설정
   const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
   });
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFShadowMap;


   // Scene 설정
   const scene = new THREE.Scene();
   scene.background = new THREE.Color('#B8F8FB')

   
   //fog 설정
   const FogColor = '#B8F8FB';
   scene.fog = new THREE.Fog(FogColor, 25, 30);


   // Camera 설정
   const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
   );
   camera.position.x = 4;
   camera.position.y = 1;
   camera.position.z = 0;
   scene.add(camera);




   
   // Light 설정
   const ambientLight = new THREE.AmbientLight('white', 0.4);
   scene.add(ambientLight);

   const directionalLight = new THREE.DirectionalLight('white', 0.8);
   directionalLight.castShadow = true;
   directionalLight.position.x = 0;
   directionalLight.position.y = 2;
   directionalLight.position.z = 0;
   scene.add(directionalLight);


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


   // 레이캐스터
   const raycaster = new THREE.Raycaster();
   


   // 그리기
   const clock = new THREE.Clock();

   //반복적으로 렌더링 해주기
   function draw() {
      const delta = clock.getDelta();
      renderer.render(scene, camera);
      renderer.setAnimationLoop(draw);
   }

   //유연하게 창 크기 설정
   function setSize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
   }

   window.addEventListener('resize', setSize);

   // Controls 설정
   const orbitControls = new OrbitControls(camera, renderer.domElement)

   // p5.js 캔버스
   const canvas2 = document.querySelector('#p5-container')
   

   //p5 파일 설정
   createP5('p5-container', 452, 460, '#FFFFFF00');

   const sendButton = document.querySelector('.sendButton')


   //현재 생성한 판의 드롭변수, true면 움직이고 false면 움직이지 않는다.
   let drop = false;

   //생성한 판의 텍스쳐로더
   const textureLoader2 = new THREE.TextureLoader();


   // 플랜들
   const planes = [];
   const planeGeometry = new THREE.PlaneGeometry(1, 1);

   // 버튼
   sendButton.addEventListener('click', () => {
      const dataURL = canvas2.children[0].toDataURL('image/png')
      let imageObj = new Image();
      imageObj.src = dataURL;

      const plane = new Plane({
		textureLoader2,
         scene,
         geometry: planeGeometry,
         imageSrc: dataURL,
         x:0,
         y:0,
         z:0
      });
      planes.push(plane);

      drop = true;
   })



   document.addEventListener('mousemove', onPointerMove);
   document.addEventListener('click', onPointerDown);

   // orbitControls.enabled = false;

   let destinationPoint = new THREE.Vector3(0,0,0)

   function onPointerMove(event){
      // if(!drop){
      //    return
      // }

      // pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
      // raycaster.setFromCamera( pointer, camera );
      // const intersects = raycaster.intersectObjects(scene.children)
      // for(const item of intersects){

      //    if(item.object.name === 'floor'){
      //       destinationPoint.x = item.point.x;
      //       destinationPoint.y = 0.5;
      //       destinationPoint.z = item.point.z;

      //       if(planes.length > 0){

      //          const set = planes.length - 1

      //          planes[set].mesh.position.x = destinationPoint.x;
      //          planes[set].mesh.position.y = destinationPoint.y;
      //          planes[set].mesh.position.z = destinationPoint.z;
      //       }
      //    }
      // }
   }

   function onPointerDown(){
      if(preventDragClick.mouseMoved) return;
      // drop = false;
      // onPointerMove
   }


   // 해당 단계별 변수
   let state = 0;


   // 드래그할 오브젝트를 저장하는 변수
   let draggableObject;

   const pointer = new THREE.Vector2();

   // 클릭했을때...
   function onPointerDown(event){
      if (draggableObject) {
      draggableObject = undefined;
      console.log('이쪽에 내려놓음')
      return;
   }
      pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
      raycaster.setFromCamera( pointer, camera );
      const intersects = raycaster.intersectObjects(scene.children, true)
   if (intersects.length && intersects[0].object.isDraggable) {
      draggableObject = intersects[0].object;
   }
   if (draggableObject) {
      console.log(draggableObject, "를 붙잡았다")
   }else{
      console.log("아무것도 못 잡았다")
   }
}

 function onPointerMove(event){
   dragObject();
   pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
 }

function dragObject() {
   // 만약 draggableObject에 뭔가 오브젝트가 들어 있으면 실행
   if (draggableObject) {
   raycaster.setFromCamera(pointer, camera);
   const intersects = raycaster.intersectObjects(scene.children);
   // intersects에는 카메라로부터 나온 레이캐스터가 닿은 모든게 배열형태로 담긴다
   // intersects에 아무것도 안담기면, 작동안함
     if (intersects.length) {

   // 레이캐스터에서 감지한 오브젝트 중에 'floor'라는 데이터 이름을 가졌다면 레이캐스터가 닿은 위치를 destinationPoint에 담음
       for (let obj3d of intersects) {
         if(obj3d.object.name === 'floor'){
   // 만약 생성한 오브젝트 planes가 하나라도 있다면 작동함
            if(planes.length > 0){
               if (!obj3d.object.isDraggable) {
                  draggableObject.position.x = obj3d.point.x;
                  draggableObject.position.y = 0.5; //plane의 높이 반
                  draggableObject.position.z = obj3d.point.z;
                  break;
            }
            }
         }
         // if (!obj3d.object.isDraggable) {
         //   draggableObject.position.x = obj3d.point.x;
         //   draggableObject.position.z = obj3d.point.z;
         //   break;
         // }
       }
     }
   }else{
      console.log('잡은게 없다')
   }
 };


   const gltfLoader =  new GLTFLoader()

   const plane2 = new Plane({
		textureLoader2,
         scene,
         geometry: planeGeometry,
         imageSrc: './images/pig.png',
         // imageSrc: dataURL,
         x:0,
         y:0.5,
         z:0
      });

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
         scene,
         x:-2,
         y:0,
         z:0,
         scale:0.85
      });

      const stone2 = new Stone({
         scene,
         x:1,
         y:0,
         z:4,
         scale:1.2
      });
      
      const stone3 = new Stone({
         scene,
         x:-2.5,
         y:0,
         z:-0.8,
         scale:1.2
      });
      


   
   
   const preventDragClick = new PreventDragClick(canvas);

   draw();
}