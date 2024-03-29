import * as THREE from 'three';

// 라이브러리 정리
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { DragControls } from "three/examples/jsm/controls/DragControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { PreventDragClick } from "./PreventDragClick"
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
import gsap from 'gsap'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

import Plane from './plane';
import Dust from './dust';
import House from './House';

import Object from './object';
import createP5 from './sketch';
import createP52 from './sketch2';

// 배경
import Environment from './environment';
import Environment_sea from './environment_sea';
import Environment_night from './environment_night';

export default function example() {

   let dbData = [];

   //파이어 베이스 부분
   const db = firebase.firestore();
   db.collection('storys').get().then((data)=>{
      data.forEach((doc)=>{
         dbData.push(doc.data());
      })
   })

   // three.js 캔버스
   const canvas = document.querySelector('#three-canvas');

   //2D 렌더 기본값
   const labelRenderer = new CSS2DRenderer();
   labelRenderer.setSize(window.innerWidth,window.innerHeight);
   labelRenderer.domElement.style.position = 'absolute';
   labelRenderer.domElement.style.top = '0px';
   labelRenderer.domElement.style.pointerEvents = 'none'
   document.body.appendChild(labelRenderer.domElement);

   // Renderer 설정
   const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true
   });
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFShadowMap;
      

   // 인트로 화면 시작--------------------------------------------------------------------
   const introScene = new THREE.Scene();

   introScene.background = new THREE.Color('#EBE5D9');

   // Camera
   const introCamera = new THREE.PerspectiveCamera(
      68,
      window.innerWidth / window.innerHeight,
      0.3,
      1000
   );

   introCamera.position.x = -2;
   introCamera.position.y = 4.8;
   introCamera.position.z = 6;
   introCamera.lookAt(1,-10,-1)
   introScene.add(introCamera);

   // 인트로 화면 조명 설정
   const introAmbientLight = new THREE.AmbientLight('#F8F4EC', 1.25);
   introScene.add(introAmbientLight);

   const size = 10;

   const directionalLight3 = new THREE.DirectionalLight('white', 0.1);
   directionalLight3.position.x = 0.3;
   directionalLight3.position.y = 4;
   directionalLight3.position.z = -2.3;
   directionalLight3.shadow.mapSize.width = 5120 // default
   directionalLight3.shadow.mapSize.height = 5120 // default
   directionalLight3.shadow.camera.top = -size;
   directionalLight3.shadow.camera.bottom = size;
   directionalLight3.shadow.camera.right = size;
   directionalLight3.shadow.camera.left = -size;

   directionalLight3.castShadow = true;

   introScene.add(directionalLight3);

   
   // 인트로 맵 불러오기
   const gltfLoader =  new GLTFLoader();

   gltfLoader.load( './models/kidapp.glb', function ( gltf ) {
      const kidProp = gltf.scene
      introScene.add(kidProp);
      for(var i=1; i< kidProp.children.length; i++){
         kidProp.children[i].castShadow = true;
      }
      // kidProp.children[24].castShadow = false
      console.log( kidProp.children[0]);
   }, undefined, function ( error ) {
      console.error( error);   
   } ); 
   

   //그림자를 받는 인트로 화면 바닥
   const introPlane = new THREE.PlaneGeometry( 700, 700 );
   const introPlanematerial = new THREE.MeshStandardMaterial( {color: '#EBE5D9'} );
   introPlanematerial.metalness = 0.45;
   introPlanematerial.roughness = 0.65;
   const introPlaneMesh = new THREE.Mesh( introPlane, introPlanematerial );
   introPlaneMesh.receiveShadow = true;
   introScene.add( introPlaneMesh );
   introPlaneMesh.rotation.x = -Math.PI/2;

   //카메라 룩엣을 이용하기 위한 메쉬
   const geometryLook = new THREE.BoxGeometry( 1, 1, 1 );
   const materialLook = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
   const meshLook = new THREE.Mesh( geometryLook, materialLook );
   introScene.add( meshLook );
   meshLook.position.set(1,-10,-1)


   //인트로 화면에서 동화 넘어갈 수 있도록 제작된 박스
   function createClickableBox(scene, position, rotation) {
      const geometry = new THREE.BoxGeometry(4, 4, 4);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.1, visible: false });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      mesh.position.copy(position);
      mesh.rotation.y = rotation;
      mesh.material.transparent = true;
      return mesh;
   }

   //이동하는 박스 넣어두는 배열
   const clickAble = [];

   // 첫 번째 -> 숲
   const meshClickOne1 = createClickableBox(introScene, new THREE.Vector3(7.5, 1.5, -4.6), -Math.PI / 3.2);
   clickAble.push(meshClickOne1);

   // 두 번째 -> 바다
   const meshClickOne2 = createClickableBox(introScene, new THREE.Vector3(10, 1.5, 0.6),  Math.PI / 2);
   clickAble.push(meshClickOne2);

   // 세 번째 -> 밤
   const meshClickOne3 = createClickableBox(introScene, new THREE.Vector3(10.2, 1.5, 6.6), Math.PI / 4);
   clickAble.push(meshClickOne3);


   //인트로 화면의 버튼들
   const introStart = document.querySelector('.introStart')
   const introLookSave = document.querySelector('.introLookSave')

   introStart.addEventListener('click', function(){
      cameraMove({x:2, y: 5, z:3},{x:12, y: -3, z:0});
   });

   introLookSave.addEventListener('click', function(){
      introStep = 'selectStory'
      uiControl(introStep)
      playScene();
      //모든 UI를 없애기
   });

   //스토리 재생 화면
   function playScene(){
      //누른 책의 id를 가져온다.
      //id를 data에 가져온다.
      //그 data를 맵에 씌워온다.
      sceneChange(0);
   }

   // 인트로 화면 끝 이후 그리기 화면 이동--------------------------------------------------------------------


   // 동화책 그리기 Scene 설정
   const scene = new THREE.Scene();

   // selectMap의 변수에 따라서 배경화면을 선택할 수 있도록 제작
   function setupEnvironment(scene, gltfLoader, selectMap) {
      if (selectMap == 0) {
         return new Environment({
            scene: scene,
            gltfLoader: gltfLoader
         });
      } else if(selectMap == 1){
         return new Environment_sea({
            scene: scene,
            gltfLoader: gltfLoader
         });
      } else if(selectMap == 2){
         return new Environment_night({
            scene: scene,
            gltfLoader: gltfLoader
         });
      }
   }


   // 동화책 카메라 설정
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


   // 레이캐스터
   const raycaster = new THREE.Raycaster();
   const raycaster3 = new THREE.Raycaster();

   // 그리기
   const clock = new THREE.Clock();

   //동화를 녹화하고 있는지
   let record = false;

   //'그림을 다 그렸어요' 버튼
   const moveStart = document.querySelector('.moveStart')

   //UI 상단에 그림 단계 알려주는 UI
   const recordRap = document.querySelector('.recordRap')
   
   //그림 단계 이전 이후로 넘어가는 UI
   const recordNext = document.querySelector('.recordNext')
   const recordPrev = document.querySelector('.recordPrev')

   //낙서를 그리는 부분
   const drawButton = document.querySelector('.drawButton')
   const drawButton_emotion = document.querySelector('.drawButton_emotion')

   //마지막 동화 이름을 지어주는 UI
   const tutorial = document.querySelector('.tutorial')

   //멀티 플레이 UI
   const withButton = document.querySelector('.with')
   const playWith = document.querySelector('.playWith')
   const code = document.querySelector('.code')


   withButton.addEventListener('click',() => {
      playWith.classList.remove('displayNone')
      namemake.classList.remove('displayNone')
   })

   playWith.addEventListener('click',() => {
      playWith.classList.add('displayNone')
      code.classList.remove('displayNone')
   })

   const namemake = document.querySelector('.namemake')
   const dot = document.querySelectorAll('.dot')


   // 다음으로 버튼을 클릭하면 단계가 올라간다
   recordNext.addEventListener('click',() => {


      state++;

      if(state <= 4){
         for (let i = 0; i < planes.length; i++){
            totalData[i].phase[state].splice(0);
         }
      }

      if(state <= 4){
         rememberInitialPosition2();
         for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            scene.remove(circle);
         }
         for (let i = 0; i < mesh3s.length; i++) {
            const lineMesh = mesh3s[i];
            scene.remove(lineMesh);
         }
         putblock(true);
      }


      if(state == 6){
         tutorial.classList.remove('displayNone')
         namemake.classList.remove('displayNone')
         saveAsImage();
      }
      feedbackTopUi();
      
      if(state <= 4){
         for (let i = 0; i < planes.length; i++){
            emotions[i].handleEmotionClick('none', false);
         }
      }
   })

   recordPrev.addEventListener('click',() => {
      state--

      if(state < 0){
         state = 0
      }

      const tl = []
      // 각 종이캐릭터를 첫번째 배열로 이동시키기
      for (let i = 0; i < planes.length; i++){
         tl.push(gsap.timeline());
         tl[i].to(planes[i].mesh.position, { duration: 0.5, x:totalData[i].phase[state][0].x ,y:totalData[i].phase[state][0].y ,z:totalData[i].phase[state][0].z });
      }

      for (let i = 0; i < planes.length; i++){
         totalData[i].phase[state].splice(1);
      }

      if(state <= 4){
         for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            scene.remove(circle);
         }
         for (let i = 0; i < mesh3s.length; i++) {
            const lineMesh = mesh3s[i];
            scene.remove(lineMesh);
         }
      }
      putblock(false);
      feedbackTopUi();
   })


   //다음단계나 이전단계로 돌아갈때, 상단의 단계를 시각화하는 버튼
   function feedbackTopUi() {
      if(state <= 5){
         dot.forEach(function(number){
            number.innerHTML = ""
         })
         for (let i = 0; i < state; i++) {
            dot[i].innerHTML = "<div></div>";
         }
      }
      if(state == 5){
         recordNext.classList.add('animation-shake')
         recordNext.classList.add('recordDone')
      }else{
         recordNext.classList.remove('animation-shake')
         recordNext.classList.remove('recordDone')
      }
      console.log(state, totalData)
   }

   // 현재화면 캡쳐
   function saveAsImage() {
      var imgData, imgNode;
      try {
          var strMime = "image/jpeg";
          imgData = renderer.domElement.toDataURL(strMime);
      } catch (e) {
          console.log(e);
          return;
      }
      const canvasImage = document.getElementById('canvasImage');
      canvasImage.style.backgroundImage = `url(${imgData})`
  }

  const emotions = [];


  function createEmotion(id, x,y,z){

      const img1 = document.createElement('img');
      const img2 = document.createElement('img');
      const img3 = document.createElement('img');
      const img4 = document.createElement('img');
      const img5 = document.createElement('img');
      const img6 = document.createElement('img');

      const img_default = document.createElement('img');

      img1.src = './images/emotion/emotion_smile.png';
      img2.src = './images/emotion/emotion_angry.png';
      img3.src = './images/emotion/emotion_sad.png';
      img4.src = './images/emotion/emotion_shock.png';
      img5.src = './images/emotion/emotion_just.png';
      img6.src = './images/emotion/emotion_none.png';

      img1.addEventListener('click', () => handleEmotionClick('smile'));
      img2.addEventListener('click', () => handleEmotionClick('angry'));
      img3.addEventListener('click', () => handleEmotionClick('sad'));
      img4.addEventListener('click', () => handleEmotionClick('shock'));
      img5.addEventListener('click', () => handleEmotionClick('just'));
      img6.addEventListener('click', () => handleEmotionClick('none'));

      img_default.src = './images/emotion/emotion_none.png';

      const imgContainer = document.createElement('div');

      const open = document.createElement('div');

      const imgContainer_inner = document.createElement('div');

      imgContainer.appendChild(imgContainer_inner);
      imgContainer.appendChild(open);

      imgContainer_inner.appendChild(img1);
      imgContainer_inner.appendChild(img2);
      imgContainer_inner.appendChild(img3);
      imgContainer_inner.appendChild(img4);
      imgContainer_inner.appendChild(img5);
      imgContainer_inner.appendChild(img6);

      open.appendChild(img_default);

      imgContainer.className = 'emotion';
      imgContainer_inner.className = 'emotion_inner';
      open.className = 'emotion_inner_defult';

      const cImgLabel = new CSS2DObject(imgContainer);

      cImgLabel.position.set(x,y,z);

      scene.add(cImgLabel);

      open.style.pointerEvents = 'auto'
      imgContainer.style.pointerEvents = 'auto'

      const editEmotion = document.querySelector('.editEmotion')

   
      //edit mode none <-> edit
      let mode = 'none';

      //edit mode none <-> edit
      let emotion = 'none';


        //이걸 사용했을때, 말풍선이 보일 수 있도록
      editEmotion.addEventListener('click', () => {
         if(mode == 'edit'){
            mode = 'none'
         }else if(mode == 'none'){
            mode = 'edit'
         }else if(mode == 'selectEmotion'){
            mode = 'none'
         }else if(mode == 'selected'){
            mode = 'none'
         }
         UIControl(mode)
      })

      open.addEventListener('click', () => {
         mode = 'selectEmotion';
         UIControl(mode)
      })

      function UIControl(mode){
         const imgContainer_inner_All = document.querySelectorAll('.emotion_inner')
         const open_All = document.querySelectorAll('.emotion_inner_defult')

         console.log(mode)

         if(mode == 'edit'){
            imgContainer_inner.classList.remove('animation_emotion');
            open.classList.add('animation_emotion');
         }else if(mode =='none'){
            imgContainer_inner.classList.remove('animation_emotion');
            open.classList.remove('animation_emotion');
         }else if(mode =='selectEmotion'){
            imgContainer_inner_All.forEach((container) => {
               container.classList.remove('animation_emotion');
            })
            open_All.forEach((container) => {
               container.classList.add('animation_emotion');
            })
            imgContainer_inner.classList.add('animation_emotion');
            open.classList.remove('animation_emotion');
         }else if(mode =='selected'){
            imgContainer_inner.classList.remove('animation_emotion');
            open.classList.add('animation_emotion');
         }
      }

      function handleEmotionClick(emotionType, show) {
         emotion = emotionType;
         //각 위치에 맞는 감정을 넣기
         for (let i = 0; i < planes.length; i++){
            totalData[i].emotions[state] = emotion;
         }
         //각 위치에 맞는 감정을 이미지로 표현
         const text = `./images/emotion/emotion_${emotion}.png`
         img_default.src = text;
         if(mode =='selectEmotion'){
            mode = 'selected';
            UIControl(mode);
         }
       }

       const emotionObject = {
         id,
         cImgLabel,
         emotion,
         handleEmotionClick
      }

      emotions.push(emotionObject);
   }


   // 그림을 다 그렸어요 버튼
   moveStart.addEventListener('click', () => {
      feedbackTopUi();
      record = true;
      if(record){
      drawButton.classList.add('drawButton_move')
      drawButton_emotion.classList.remove('drawButton_move')
      drawMode = false;

      //카메라가 중심점을 보는 코드
      orbitControls.enabled = false;

      gsap.timeline()
         .to(camera.position, { duration: 1.8, x: 4.5, y: 4, z: 0,
         onUpdate:function(){
            camera.lookAt( new THREE.Vector3(0,0,0));
         }})
      }

      recordRap.classList.add('moveStart_move')
      moveStart.classList.remove('moveStart_move')
      rememberInitialPosition();

      //이미지들을 totalData에 저장
      for (let i = 0; i < planes.length; i++){
         // totalData[i].img = null;
         totalData[i].img = planes[i].mesh.children[0].material.map.source.data.currentSrc
      }

      //이걸 사용했을때, 말풍선이 생성할 수 있도록
      for (let i = 0; i < planes.length; i++){
         createEmotion(i, planes[i].mesh.position.x,planes[i].mesh.position.y+1.8, planes[i].mesh.position.z)
     }

     //0단계 감정 생성
     for (let i = 0; i < planes.length; i++){
         emotions[i].handleEmotionClick('none');
      }
   })

   //말풍선의 위치를 추적
   function updateEmotionsPositions() {
      emotions.forEach((emotion) => {
         const plane = planes[emotion.id];
         if(plane){
            const { x, y, z } = plane.mesh.position;
            emotion.cImgLabel.position.set(x, y + 1.8, z);
         }
      })
   }


   let drawMode = false;

   const intro = document.querySelector('.intro')
   const backButton = document.querySelector('.backButton')
   const interfaceCss = document.querySelector('.interface')

   //동화 리스트

   const showAll = document.querySelector('.showAll')
   const carousel = document.querySelector('.carousel')

   showAll.addEventListener('click', function(){
      carousel.classList.add('carousel_move')
   })


   //사용되는 카메라 변수 저장
   let viewScene = introScene;
   let viewCamera = introCamera;

   //현재 누른 인트로의 단계는 무엇인지
   let introStep = 'intro';

   //현제 단계에 따라서 인트로 UI 변경
   function uiControl(step){
      if(step == 'selectMap'){
         intro.classList.add('introDown')
         backButton.classList.add('introBackButton')
      }else if(step == 'intro'){
         intro.classList.remove('introDown')
         backButton.classList.remove('introBackButton')
         showAll.classList.remove('showAll_move')
      }else if(step == 'selectStory'){
         showAll.classList.add('showAll_move')
         cameraMove({x:-0.6, y: 5, z:-4.9},{x:-0.6, y: 0, z:-14});
      }
   }

   //홈버튼 누르면 뒤로 감
   backButton.addEventListener('click', () => {
      if(introStep == 'intomap'){
         sceneChange(3)
         cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
         introStep = 'intro';
         uiControl(introStep)
      } else if(introStep == 'selectMap'){
         //다시 카메라가 뒤로 백, UI 위로 나와야함
         cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
         introStep = 'intro';
         uiControl(introStep)
      }
      introStep = 'intro';
   })

   //동화에 이름 붙이기 버튼 누르면 처음으로 돌아가고
   //데이터를 파이어베이스에 저장
   //저장된 데이터를 재생하기


   //카메라 변환
   function cameraMove(move, look){
      introStep = 'selectMap'
      uiControl(introStep)

      gsap.timeline()
         .to(introCamera.position, { duration: 1.8, x: move.x, y: move.y, z: move.z,
         onUpdate:function(){
            introCamera.lookAt( new THREE.Vector3(2,0,0));
         }})
      gsap.timeline()
      .to(meshLook.position, {
         duration: 1.8, x: look.x, y: look.y, z: look.z,
         onUpdate:function(){
            introCamera.lookAt(meshLook.position);
         }
      });
   }

   let environment;
   
   //화면 전환 함수
   function sceneChange(_number){

      // intro.classList.add('displayNone')
      if (_number === 0) {
         environment = setupEnvironment(scene, gltfLoader, 0); // 숲속 설정
         introScene.clear();
         viewScene = scene;
         viewCamera = camera;
         withButton.classList.add('displayNone')
         interfaceCss.classList.add('displayBlock')
         interfaceCss.classList.remove('displayNone')
      } else if (_number === 1) {
         environment = setupEnvironment(scene, gltfLoader, 1); // 바다 설정
         introScene.clear();
         viewScene = scene;
         viewCamera = camera;
         withButton.classList.add('displayNone')
         interfaceCss.classList.add('displayBlock')
         interfaceCss.classList.remove('displayNone')
      } else if (_number === 2) {
         environment = setupEnvironment(scene, gltfLoader, 2); // 밤 설정
         introScene.clear();
         viewScene = scene;
         viewCamera = camera;
         withButton.classList.add('displayNone')
         interfaceCss.classList.add('displayBlock')
         interfaceCss.classList.remove('displayNone')
      } else if (_number === 3) {
         // 메인화면
         viewScene = introScene;
         viewCamera = introCamera;
         withButton.classList.remove('displayNone')
         interfaceCss.classList.add('displayNone')
         interfaceCss.classList.remove('displayBlock')
         scene.clear();
      }
      
   }

  
   
   //동화의 이름 붙이기
   const titleButton = document.querySelector('.titleButton')
   const namearea = document.querySelector('.namearea')
   titleButton.addEventListener('click', () => {
      const title = namearea.value;

      db.collection('storys').doc(title).set({totalData}
      )
      .then(() => {
         console.log("Document successfully written!");
      })
      .catch((error) => {
         console.error("Error writing document: ", error);
      });
   })

   //유연하게 창 크기 설정
   function setSize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      introCamera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      introCamera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(introScene, introCamera);

      labelRenderer.setSize(this.window.innerWidth, this.window.innerHeight);
   }

   window.addEventListener('resize', setSize);

   // Controls 설정
   const orbitControls = new OrbitControls(camera, renderer.domElement)

   // p5.js 캔버스
   const canvas2 = document.querySelector('#p5-container')
   const canvas3 = document.querySelector('#p5-container2')

   //p5 파일 설정
   createP5('p5-container', 450, 450, '#FFFFFF00');
   createP52('p5-container2', 450, 450, '#FFFFFF00');

   const sendButton = document.querySelector('.sendButton')
   const sendButton2 = document.querySelector('.sendButton2')

   //생성한 판의 텍스쳐로더
   const textureLoader2 = new THREE.TextureLoader();

   // 드래그할 오브젝트를 저장하는 변수***
   let draggableObject;

   // 플랜들
   const planes = [];
   const objects = [];

   const pointer = new THREE.Vector2();

   // 랜덤 함수
   function getRandomInt(max) {
      return (Math.random()-0.5) * max;
    }

   // 버튼
   sendButton.addEventListener('click', () => {
   // 캔버스에서 그림 가져오기
      const dataURL = canvas2.children[0].toDataURL('image/png')
      let imageObj = new Image();
      imageObj.src = dataURL;

      const plane = new Plane({
         textureLoader2,
         scene,
         imageSrc: dataURL,
         x:getRandomInt(4),
         y:0,
         z:getRandomInt(4),
         scale:0.5,
         record
      });
      
      planes.push(plane);

      console.log(plane);

      const set = planes.length - 1
      draggableObject = planes[set].mesh
      // console.log(draggableObject,set,planes,planes[set])
      //이게 된다
   })


   // 물건 버튼
   sendButton2.addEventListener('click', () => {
   // 캔버스에서 그림 가져오기
      const dataURL = canvas3.children[0].toDataURL('image/png')
      let imageObj = new Image();
      imageObj.src = dataURL;

      const object = new Object({
         textureLoader2,
         scene,
         imageSrc: dataURL,
         x:getRandomInt(4),
         y:0,
         z:getRandomInt(4),
         scale:0.5,
         record
      });
      
      objects.push(object);

      const set = objects.length - 1
      draggableObject = objects[set].mesh
   })

   const houses = [];
   const buildingBox = document.querySelectorAll('.buildingBox')

   // 건물 가져오기
   buildingBox.forEach(function(item){
      item.addEventListener('click', (e) => {
      console.log(e.target.dataset.name)
         const house = new House({
            textureLoader2,
            scene,
            // imageSrc: dataURL,
            x:getRandomInt(4),
            y:0,
            z:getRandomInt(4),
            rotation: getRandomInt(4),
            scale:0.5,
            record,
            modelSrc:`./models/${e.target.dataset.name}.glb`
         })

         houses.push(house);

         const set = houses.length - 1;
         draggableObject = houses[set].mesh;
      })
   })

   // 마우스가 움직일때
   canvas.addEventListener('mousemove', onPointerMove);

   // 마우스를 눌렀을때
   // canvas.addEventListener('click', onPointerDown);
   
   // 마우스 더블 클릭
   canvas.addEventListener('dblclick', rotateBuilding);

   function rotateBuilding(){
      console.log('asdsad')
    }

   // 손으로 조작 방식
   canvas.addEventListener('mousedown', onPointerDown);
   canvas.addEventListener('mouseup', onPointerUp);

   // 더블클릭했을때
   canvas.addEventListener('dbclick', rotateBuilding);

   // orbitControls.enabled = false;

   // 해당 단계별 변수
   let state = 0;

   //대략적인 위치 알려주는 도형
   const geometry = new THREE.RingGeometry( 0.4, 0.5, 32 );
   let material;
   let color = '#F4F4CC'
   material = new THREE.MeshBasicMaterial( { color: color} ); 
   const circle = new THREE.Mesh( geometry, material );
   scene.add( circle );
   circle.rotation.x = -Math.PI/2;
   circle.position.y = 0.01
   circle.visible = false;

   //위치 보여주기&숨기기
   function visibleOrnone (){
      if(draggableObject){
         if(draggableObject == planes[0]){
            color = '#8ed158';
            console.log('true')
            }else{
            color = '#F4F4CC';
         }
         circle.visible = true;
      }else{
         circle.visible = false;
      }
   }


   // 마우스를 눌렀을때
   function onPointerDown(event){
      pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
      raycaster.setFromCamera( pointer, camera );
      raycaster3.setFromCamera( pointer, introCamera );
      const intersects = raycaster.intersectObjects(scene.children, true)
      const intersects3 = raycaster3.intersectObjects(introScene.children, true)

      // 레이캐스터의 맨 첫번째 순서에 plane이 감지되면 그 물체를 draggableObject에 넣는다
      if (intersects.length && intersects[0].object.isDraggable) {
      // state가 5가 되면 선택이 되지 않도록
         if(state !== 5){
            draggableObject = intersects[0].object.parent;
            draggableObject.children[0].dragging = true;
         }
      }

   if (draggableObject) {
      console.log(draggableObject.children[0].subject, "를 붙잡았다", planes)   
      orbitControls.enabled = false;      
      visibleOrnone ();
      playanimationStart();
   }else{
      console.log("아무것도 못 잡았다")
   }

   //인트로용 레이캐스터 
   //클릭한 물체의 아이디를 확인해서 각 화면으로 이동 
   if(intersects3.length && introStep == 'selectMap'){
      let number;
      if(intersects3[0].object.id == clickAble[0].id){
         number = 0;
         sceneChange(number);
         introStep = 'intomap'
      }else if(intersects3[0].object.id == clickAble[1].id){
         number = 1;
         sceneChange(number);tialPosition
         introStep = 'intomap'
      }else if(intersects3[0].object.id == clickAble[2].id){
         number = 2;
         sceneChange(number);
         introStep = 'intomap'
      }
   }
}

// 마우스를 땠을때
function onPointerUp(event){
   if (draggableObject) {
      draggableObject.children[0].dragging = false;
      visibleOrnone (); 
      playanimationEnd();
      draggableObject = undefined;
      console.log('이쪽에 내려놓음')
      rememberInitialPosition2();
      makeLine();
   }
   orbitControls.enabled = true;
}

 function onPointerMove(event){
   dragObject();
   visibleOrnone ();
   pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
 }


 //
function playanimationStart() {
   if(draggableObject.children[0].subject == 'plane'){
      const result = planes.find(element => element.mesh.id === draggableObject.id)
      result.actions[0].stop();
      result.actions[1].play();
   }else if(draggableObject.children[0].subject == 'house'){
      const result = houses.find(element => element.mesh.id === draggableObject.id)
      result.actions[0].stop();
      result.actions[1].play();
   }else if(draggableObject.children[0].subject == 'object'){
      const result = objects.find(element => element.mesh.id === draggableObject.id)
      result.actions[0].stop();
      result.actions[1].play();
   }
}

function playanimationEnd() {
   if(draggableObject.children[0].subject == 'plane'){
      const result = planes.find(element => element.mesh.id === draggableObject.id)
      result.actions[1].stop();
      result.actions[0].play();
   }else if(draggableObject.children[0].subject == 'house'){
      const result = houses.find(element => element.mesh.id === draggableObject.id)
      result.actions[1].stop();
      result.actions[0].play();
   }else if(draggableObject.children[0].subject == 'object'){
      const result = objects.find(element => element.mesh.id === draggableObject.id)
      result.actions[1].stop();
      result.actions[4].play();
   }
}

//오브젝트를 움직이는 함수
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
         // 만약 생성한 오브젝트 planes이랑 하우스가 하나라도 있다면 작동함
            if(planes.length > 0 || houses.length > 0){
                  draggableObject.position.x = obj3d.point.x;
                  draggableObject.position.y = 0.001;
                  draggableObject.position.z = obj3d.point.z;
                  circle.position.copy(draggableObject.position)
            }
         }
       }
     }
   }else{
   }
 };

      let lienMaterials = []; // lienMaterial을 배열로 관리하기 위한 변수
      let lienMaterial;


      //다 그렸어요 버튼을 누르면 처음 위치를 아래 배열에 저장한다.
      const totalData = {}

      function rememberInitialPosition(){
            for (let i = 0; i < planes.length; i++){
               //현재 플랜의 수에 따라서 빈칸을 만들어준다.
               totalData[i] = {
                  id: i,
                  phase:{
                     0:[],
                     1:[],
                     2:[],
                     3:[],
                     4:[]
                  },
                  img:null,
                  emotions:{
                     0:null,
                     1:null,
                     2:null,
                     3:null,
                     4:null,
                  }
               };
               const position = planes[i].mesh.position
               const position2 = {...position}
               totalData[i].phase[state].push(position2);
            }
         putblock(true);
      }

      const mesh3s = [];

      function rememberInitialPosition2(){
         for (let i = 0; i < planes.length; i++){
            const position = planes[i].mesh.position
            const position2 = {...position}
            totalData[i].phase[state].push(position2)
         }
         putblock(true);
      }

      function makeLine(){
        for (let i = 0; i < planes.length; i++){
            const data1 = totalData[i].phase[state][(totalData[i].phase[state].length-2)]
            const data2 = totalData[i].phase[state][(totalData[i].phase[state].length-1)]
            console.log(data1.x)
            const geometry = new THREE.BufferGeometry().setFromPoints(
               [
                  new THREE.Vector3(data1.x,data1.y,data1.z),
                  new THREE.Vector3(data2.x,data2.y,data2.z)
               ]
            );
            const line = new MeshLine();
            line.setGeometry(geometry);

            lienMaterial = new MeshLineMaterial({
               dashArray: 0.3,
               lineWidth: 0.12,
               transparent: true,
               dashArray: 0.07,
               dashOffset: 0,
               dashRatio: 0.35,
               color: '#73A651'
            });

            if (i == 0) {
                  lienMaterial.color = new THREE.Color(203/255, 253/255, 171/255);
               } else if (i == 1) {
                  lienMaterial.color = new THREE.Color(163/255, 236/255, 207/255);
               } else if (i == 2) {
                  lienMaterial.color = new THREE.Color(166/255, 235/255, 243/255);
            }

            lienMaterials.push(lienMaterial);

            const mesh3 = new THREE.Mesh(line, lienMaterial);
            scene.add(mesh3);
            mesh3s.push(mesh3);
         }
      }

      const circles = [];

      //현재 있던 위치에 토글을 배치
      function putblock(firstOrNot){
         for (let i = 0; i < planes.length; i++){
            const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
            let material = new THREE.MeshLambertMaterial( { color: '#558833'} ); 
            if(i == 0){
               material = new THREE.MeshLambertMaterial( { color: '#558833'} ); 
            }else if(i == 1){
               material = new THREE.MeshLambertMaterial( { color: '#338866'} ); 
            }else if(i == 2){
               material = new THREE.MeshLambertMaterial( { color: '#338088'} ); 
            }

            const circle = new THREE.Mesh( geometry, material );
            scene.add( circle );

            if(firstOrNot){
               const boxX = totalData[i].phase[state][totalData[i].phase[state].length - 1].x;
               const boxY = totalData[i].phase[state][totalData[i].phase[state].length - 1].y;
               const boxZ = totalData[i].phase[state][totalData[i].phase[state].length - 1].z;
               circle.position.set(boxX,boxY,boxZ);
               circles.push(circle);
            }else if(!firstOrNot){
               const boxX = totalData[i].phase[state][0].x;
               const boxY = totalData[i].phase[state][0].y;
               const boxZ = totalData[i].phase[state][0].z;
               circle.position.set(boxX,boxY,boxZ);
               circles.push(circle);
            }
         }
      }
      

      //오른쪽 플레이 버튼, 누르면 현재 저장된 위치를 따라서 이동할 수 있도록 한다.
      const play = document.querySelector('.play')
      play.addEventListener('click',() => {
            const planeData = dbData[0].totalData;
            for (const key in planeData) {
               makePlane(key, planeData)
            }

            // movePlane(planeData);
         }
      )

      //오른쪽 리턴버튼, 누르면 리셋되고 처음 위치로 돌아간다. //현재 state 삭제 기능 추가
      const reuse = document.querySelector('.reuse')
      reuse.addEventListener('click',() => {

         const tl = []
         for (let i = 0; i < planes.length; i++){
               tl.push(gsap.timeline());
               tl[i].to(planes[i].mesh.position, { duration: 0.5, x:totalData[i].phase[state][0].x ,y:totalData[i].phase[state][0].y ,z:totalData[i].phase[state][0].z });
         }
         
         for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            scene.remove(circle);
         }
         for (let i = 0; i < mesh3s.length; i++) {
            const lineMesh = mesh3s[i];
            scene.remove(lineMesh);
         }

         putblock(false);

         //여기에는 처음으로 돌아가기
         for (let i = 0; i < planes.length; i++){
            totalData[i].phase[state].splice(1);
         }
      })
      
      //동화 재생시 플랜들 생성
      function makePlane(key, data){
         // console.log(data[key].img, data[key].phase[0][0].x)
         const plane = new Plane({
            textureLoader2,
            scene,
            imageSrc: data[key].img,
            x:data[key].phase[0][0].x,
            y:data[key].phase[0][0].y,
            z:data[key].phase[0][0].z,
            scale:0.5,
            record
         });
         planes.push(plane);
         const set = planes.length - 1
         draggableObject = planes[set].mesh;
         console.log(plane)
      }

      //데이터 받아서 plane움직이기
      function movePlane(data){

         let initialPositionRemove = [];
         let initialPositionRemove2 = [];

         for (const key in data) {
            const i = parseInt(key, 10)
            initialPositionRemove[i] = [];
            initialPositionRemove2[i] = [];
            for (let e = 0; e <= 4; e++){
               for (let t = 0; t <= [data[i].phase[e].length-1]; t++){
                  initialPositionRemove2[i].push(data[i].phase[e][t])
               }
            }
            initialPositionRemove[i].push(removeDuplicates(initialPositionRemove2[i]))
            // console.log(initialPositionRemove, initialPositionRemove2)
            console.log(planes[i])
         }

         const timelines = [];
         for (let i = 0; i < initialPositionRemove.length; i++){

            let nIntervId;
            timelines.push(gsap.timeline());
               // for (let e = 0; e < initialPositionRemove[i].length; e++){
               //    timelines[i].to(planes[i].mesh.position, { duration: 1.0, x:initialPositionRemove[i][e].x ,y:initialPositionRemove[i][e].y ,z:initialPositionRemove[i][e].z });
               // }

               // for (let e = 0; e < totalData[i].phase[state].length; e++){
               //    timelines[i].to(planes[i].mesh.position, { duration: 1.0, x:totalData[i].phase[state][e].x ,y:totalData[i].phase[state][e].y ,z:totalData[i].phase[state][e].z });
               // }

            // 각 palne마다 애니메이션을 재생
            // const result = planes[i];
            // result.actions[0].stop();
            // result.actions[3].play();
               
            console.log('애니메이션이 시작됐습니다.');
            nIntervId = setInterval(Dust, 100);
            timelines[i].play()
            .then(() => {
               // 애니메이션이 끝날 때 실행할 코드 작성
               console.log('애니메이션이 끝났습니다.');
               // result.actions[3].stop();
               // result.actions[0].play();
               clearInterval(nIntervId);
             })
         }
      }

      //먼지
      let dusts = [];
      function Dust(){
         for (let i = 0; i < planes.length; i++){
            const geometry = new THREE.SphereGeometry(0.1, 18, 18);
            let material = new THREE.MeshLambertMaterial({
               color: '#f4f5eb',
               opacity: 0.5, // 투명도 값을 설정 (0부터 1까지의 값)
               transparent: true, // 투명한 재질을 사용함을 설정
             });
            const dust = new THREE.Mesh( geometry, material );
            const position = planes[i].mesh.position
            const position2 = {...position}

            const randomX = (Math.random() - 0.5) * 2; // -1에서 1 사이의 값
            const randomY = (Math.random() - 0.5) * 2; // -1에서 1 사이의 값
            const randomZ = (Math.random() - 0.5) * 2; // -1에서 1 사이의 값

            dust.position.x = position.x + randomX/12;
            dust.position.y = position.y + randomY/12;
            dust.position.z = position.z + randomZ/12;

            scene.add(dust);
            dusts.push(dust)
         }
      }      


      //반복적으로 렌더링 해주기
      function draw() {

         labelRenderer.render(scene, camera);

         //만약 그림이 하나라도 있으면, 그림을 완성하기 버튼이 나타난다
         if(planes.length > 0 && !record){
            moveStart.classList.add('moveStart_move')
         }else if(planes.length == 0){
            moveStart.classList.remove('moveStart_move')
         }
      
         const delta = clock.getDelta();

         for (let i = 0; i < planes.length; i++){
            if(planes[i].mixer){
               planes[i].mixer.update(delta);
            }
         }
         for (let i = 0; i < houses.length; i++){
            if(houses[i].mixer){
               houses[i].mixer.update(delta);
            }
         }
         for (let i = 0; i < objects.length; i++){
            if(objects[i].mixer){
               objects[i].mixer.update(delta);
            }
         }

         for (let i = 0; i < dusts.length; i++) {
            if (dusts[i]) {
               dusts[i].position.y += 0.01;
               dusts[i].scale.x -= 0.02;
               dusts[i].scale.y -= 0.02;
               dusts[i].scale.z -= 0.02;
               if(dusts[i].scale.x <= 0){
                  scene.remove(dusts[i]);
               }
            }
         }

         // 감정상태가 따라다닐 수 있도록
         updateEmotionsPositions();

         // 모든 lienMaterial에 대해 dashOffset 값을 변경
         for (let i = 0; i < lienMaterials.length; i++) {
            if (lienMaterials[i]) {
               lienMaterials[i].dashOffset -= 0.001;
            }
         }
         renderer.render(viewScene, viewCamera);
         renderer.setAnimationLoop(draw);
   }
   
   const preventDragClick = new PreventDragClick(canvas);

   function removeDuplicates(initialPosition) {
      const initialPositionNew = [];
      let prevElement = null;
      
      for (const position of initialPosition) {
        if (
          !prevElement ||
          position.x !== prevElement.x ||
          position.y !== prevElement.y ||
          position.z !== prevElement.z
        ) {
          initialPositionNew.push(position);
        }
        prevElement = position;
      }
    
      return initialPositionNew;
    }
   
   draw();
}