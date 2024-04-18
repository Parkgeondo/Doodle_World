import * as THREE from 'three';

// 라이브러리 정리
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { DragControls } from "three/examples/jsm/controls/DragControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { PreventDragClick } from "./PreventDragClick"
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
import gsap from 'gsap'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

//추가 오브젝트
import Object from './object';
import Plane from './plane';
import House from './House';

//p5.js 캔버스
import createP5 from './sketch';
import createP52 from './sketch2';

// 배경
import Environment from './environment';
import Environment_sea from './environment_sea';
import Environment_night from './environment_night';

//UI 시스템

export default function example() {

   //파이어 베이스 데이터 저장하는 변수
   let dbData = [];

   //카드를 나열할때, 카드칸의 갯수를 생성할때 사용하는 변수
   let cardContainer = null;

   //동화카드 저장된 캐러셀
   const showBook = document.querySelector('.showBook');
  
   //파이어 베이스 부분
   const db = firebase.firestore();
   db.collection('storys').get().then((data)=>{
      //데이터 받아오기
      data.forEach((doc)=>{
         dbData.push(doc.data());
      })
      cardContainer = Math.floor(dbData.length / 5 + 1);

      //만약 데이터가 없다면, 대신 없다고 글쓰기
      if(dbData.length == 0){
         const showBooks = document.createElement( "div" );
         showBooks.className = 'nonData';
         showBooks.innerHTML = '동화책이 아직 없어요!';
         showBook.append(showBooks);
      }else{
         for(let i = 0; i < cardContainer; i++){
            const showBooks = document.createElement( "div" );
            showBooks.className = 'showBooks';
            showBook.append(showBooks);
            const cards = document.createElement( "div" );
            cards.className = 'cards';
            showBooks.append(cards);
         }

         //dbData를 시간순서대로 정렬/time이 높은 순에서 낮은 순으로 연결
         dbData.sort((a, b) => b.totalData.time - a.totalData.time); 

         for(let i = 0; i < dbData.length; i++){
            const number = Math.floor(i / 5);
            const card = `<div class="card" data-id=${dbData[i].totalData.id}>
               <img class="thum" data-id=${dbData[i].totalData.id} src="${dbData[i].totalData.thum}" alt="" draggable="false">
               <div class="title" data-id=${dbData[i].totalData.id}>${dbData[i].totalData.title}</div>
               <div class="time" data-id=${dbData[i].totalData.id}>12초</div>
               <img class="trash" data-id=${dbData[i].totalData.id}src="./images/UI/trash.png" alt="">
            </div>`
            showBook.children[number].children[0].innerHTML += card;
         }
      }
 
      //동화책 보여주는 카드를 모드 선택
      const cards = document.querySelectorAll('.card');

      cards.forEach(card => {
         detectDrag(card);
         card.querySelectorAll('.thum, .title, .time, .trash').forEach(child => {
            detectDrag(child);
         })
      })

      //드래그 감지
      function detectDrag(object){
         let startPoint = 0;
         object.addEventListener('mousedown', (e) => {
            startPoint = e.clientX
         })

         object.addEventListener('mouseup', (e) => {
            const distance = e.clientX - startPoint;
            if(Math.abs(distance) < 10){
               e.stopPropagation();
               const clickedCardId = e.target.dataset.id;
               clickCard(clickedCardId);
            }else{return}
         })
      }

   //카드 모음의 한 페이지
   const showBooks = document.querySelectorAll('.showBooks')
   //카드 네비게이터
   const showBook_info = document.querySelector('.showBook_info')

   
   let startPoint = 0;
   let clicked = false;
   let currentPage = 0; // 현재 페이지를 추적하는 변수

   // 전체 페이지 수 - 데이터의 갯수에 따라서 생성
   const totalPages = cardContainer = Math.floor(dbData.length / 5 + 1);

   for(let i = 0; i < totalPages; i++){
      const showBook_block = document.createElement('div');
      showBook_block.className = 'showBook_block';
      showBook_info.append(showBook_block)
   }

   const showBook_block = document.querySelectorAll('.showBook_block');
   showBook_block[0].className = 'showBook_block showBook_block_seleted';

   //동화책이 없으면 작동X
   if(showBooks.length !== 0){
      for(let i = 0; i < totalPages; i++){
         showBooks[i].addEventListener('mousedown', function(e){
         startPoint = e.clientX
         clicked = true;
      })
      showBooks[i].addEventListener('mousemove', function(e){
         if(clicked == true){
            showBook.style.transform = `translateX(${-currentPage * 100}vw) translateX(${e.clientX - startPoint}px)`;
         }
      })
      showBooks[i].addEventListener('mouseup', function(e){
         clicked = false;
         const distance = e.clientX - startPoint;
         if (distance < -500) {
               currentPage = (currentPage + 1) % totalPages;
         } else if (distance > 500) {
               currentPage = (currentPage - 1 + totalPages) % totalPages;
         }
        showBook.style.transition = 'all 0.5s';
        showBook.style.transform = `translateX(${-currentPage * 100}vw)`;
      setTimeout(()=>{
         showBook.style.transition = `none`
      },500)
      showBook_block[i].classList.remove('showBook_block_seleted')
      showBook_block[currentPage].classList.add('showBook_block_seleted')
      })
    }
   }else{}
   })

   //현재 카드의 뭐시기
   let selectData = null;

   //클릭한 카드의 데이터를 가져오고 화면 이동
   function clickCard(clickedCardId){
   //드래그에 이벤트 클릭방지
      for(let i = 0; i < dbData.length; i++){
         if(clickedCardId == dbData[i].totalData.id){
            selectData = dbData[i];
         }
      }
      createPlane(selectData);
      playScene(selectData);
      introStep = 'intomap'
      bookPlay = true;
      uiControl(introStep);
   }


   //2D 렌더 UI 기본값
   const labelRenderer = new CSS2DRenderer();
   labelRenderer.setSize(window.innerWidth,window.innerHeight);
   labelRenderer.domElement.style.position = 'absolute';
   labelRenderer.domElement.style.top = '0px';
   labelRenderer.domElement.style.pointerEvents = 'none'
   document.body.appendChild(labelRenderer.domElement);


   // 3D three.js 캔버스
   const canvas = document.querySelector('#three-canvas');

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

   //동화책 배경선택으로
   introStart.addEventListener('click', function(){
      introStep = 'selectMap'
      uiControl(introStep)
      cameraMove({x:2, y: 5, z:3},{x:12, y: -3, z:0});
   });

   //동화책 저장선택
   introLookSave.addEventListener('click', function(){
      introStep = 'selectStory'
      uiControl(introStep)
      cameraMove({x:-0.6, y: 5, z:-4.9},{x:-0.6, y: 0, z:-14});
   });


   // 인트로 화면 끝 이후 그리기 화면 이동--------------------------------------------------------------------

   //동화책 배경 변수
   let selectedMap = null;

   // 동화책 그리기 Scene 설정
   const scene = new THREE.Scene();

   // selectMap의 변수에 따라서 배경화면을 선택할 수 있도록 제작
   function setupEnvironment(scene, gltfLoader, selectMap) {
      if (selectMap == 0) {
         selectedMap = 0;
         return new Environment({
            scene: scene,
            gltfLoader: gltfLoader
         });
      } else if(selectMap == 1){
         selectedMap = 1;
         return new Environment_sea({
            scene: scene,
            gltfLoader: gltfLoader
         });
      } else if(selectMap == 2){
         selectedMap = 2;
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

   //'동화를 움직여요' 버튼
   const playNext = document.querySelector('.playNext')
   const playPrev = document.querySelector('.playPrev')
   const playRap = document.querySelector('.playRap')

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

   //플레이, 없애기
   const controlButton = document.querySelector('.controlButton')
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

   function playScene(selectData){
      sceneChange(selectData.totalData.scene);
      introStep = 'into'
      uiControl();
   }
   
   function seeEmotion(){
      for (let i = 0; i < planes.length; i++){
         createEmotion(i, planes[i].mesh.position.x,planes[i].mesh.position.y+1.8, planes[i].mesh.position.z)
      }
   }

   let playPhase = 0;

   //동화재생
   //아마 각 장면마다 움직일 수 있도록 재생하게 만드는게 좋지않을까?
   playNext.addEventListener('click', function(e){
      playPhase++;

      seeEmotion();
      let tl = [];
      let planeData = [];

      //plane의 갯수
      //버튼을 누를때마가 특정 변수가 올라가고
      for (const key in selectData.totalData.positionData) {
         const i = parseInt(key, 10);
         planeData[i] = [];
         tl.push(gsap.timeline());

         if(playPhase <= 4){
            for (let e = 0; e < selectData.totalData.positionData[i].phase[playPhase].length; e++){
               planeData[i].push(selectData.totalData.positionData[i].phase[playPhase][e])
            }
         }else if(playPhase >= 5){
            playPhase = 5;
         }
         
         for (let e = 0; e < planeData[i].length; e++){
            if(e < 5){
               tl[i].to(planes[i].mesh.position, { duration: 1.5, x:planeData[i][e].x,y:planeData[i][e].y ,z:planeData[i][e].z});
            }
         }
         let nIntervId;
         const result = planes[i];
         result.actions[0].stop();
         result.actions[3].play();

         console.log('애니메이션이 시작됐습니다.');

         nIntervId = setInterval(Dust, 100);
         tl[i].play()
         .then(() => {
            // 애니메이션이 끝날 때 실행할 코드 작성
            console.log('애니메이션이 끝났습니다.');
            result.actions[3].stop();
            result.actions[0].play();
            clearInterval(nIntervId);
         })
      }
      for (let i = 0; i < planes.length; i++){
         if(playPhase <= 4){
            const emotion = selectData.totalData.positionData[i].emotions[playPhase]
            emotions[i].handleEmotionClick(emotion);
         }
      }
      feedbackTopUi(playPhase);
   })


   // 다음으로 버튼을 클릭하면 단계가 올라간다
   // 동화책 제작시 다음으로 가기 버튼
   recordNext.addEventListener('click',() => {
      state++;
      if(state <= 4){
         for (let i = 0; i < planes.length; i++){
            totalData.positionData[i].phase[state].splice(0);
         }
      }

      if(state <= 4){
         rememberInitialPosition3();
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
      feedbackTopUi(state);
      
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
         tl[i].to(planes[i].mesh.position, { duration: 0.5, x:totalData.positionData[i].phase[state][0].x ,y:totalData.positionData[i].phase[state][0].y ,z:totalData.positionData[i].phase[state][0].z });
      }

      for (let i = 0; i < planes.length; i++){
         totalData.positionData[i].phase[state].splice(1);
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
   function feedbackTopUi(state) {
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
   }

   // 현재화면 캡쳐
   function saveAsImage() {
      let imgData;
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

      //imgContainer가 감정을 담는 컨테이너
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
      if(bookPlay){
         open.className = 'emotion_inner_defult animation_emotion';
      }else{
         open.className = 'emotion_inner_defult';
      }

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
         emotionControl(mode, imgContainer);
      })

      open.addEventListener('click', () => {
         mode = 'selectEmotion';
         emotionControl(mode, imgContainer);
      })

      function handleEmotionClick(emotionType) {
         emotion = emotionType;
         //각 위치에 맞는 감정을 넣기
         if(!bookPlay){
            totalData.positionData[emotionObject.id].emotions[state] = emotion;
            //여기 추가
         }
         //각 위치에 맞는 감정을 이미지로 표현
         const text = `./images/emotion/emotion_${emotion}.png`
         img_default.src = text;
         if(mode =='selectEmotion'){
            mode = 'selected';
            emotionControl(mode, imgContainer);
         }
       }

       const emotionObject = {
         id,
         cImgLabel,
         emotion,
         handleEmotionClick
      }
      emotions.push(emotionObject);
      return imgContainer;
   }

   // mode = UI 컨트롤, imgContainer_inner = 감정 선택하는 말풍선, open = 감정 표시하는 말풍선, imgContainer = 전체 말풍선
   function emotionControl(mode, imgContainer){
      const imgContainer_inner_All = document.querySelectorAll('.emotion_inner')
      const open_All = document.querySelectorAll('.emotion_inner_defult')

      const imgContainer_inner = imgContainer.querySelector('.emotion_inner');
      const open = imgContainer.querySelector('.emotion_inner_defult');

      if(mode == 'edit'){
         open.classList.add('animation_emotion');
         imgContainer_inner.classList.remove('animation_emotion');
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

   // 그림을 다 그렸어요 버튼
   moveStart.addEventListener('click', () => {
      saveBackground();
      feedbackTopUi();

      //녹화 시작 상태 on
      record = true;
      if(record){
         drawButton.classList.add('drawButton_move')
         drawButton_emotion.classList.remove('drawButton_move')

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
         totalData.positionData[i].img = planes[i].mesh.children[0].material.map.source.data.currentSrc
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

   // 배경요소 및 건물들을 데이터에 저장
   function saveBackground(){
      //모델링의 아이디와 각 모델링의 모델링 데이터
      for (let i = 0; i < houses.length; i++){
         const positionCopy = {...houses[i].mesh.position}
         totalData.background.houses[i] = {position : positionCopy, model : houses[i].modelSrc}
      }
      for (let i = 0; i < objects.length; i++){
         const positionCopy = {...objects[i].mesh.position}
         totalData.background.objects[i] = {position : positionCopy , img : objects[i].mesh.children[0].material.map.source.data.currentSrc}
      }
   }

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

   const intro = document.querySelector('.intro')
   const backButton = document.querySelector('.backButton')

   //그림그리는 버튼 모음
   const interfaceCss = document.querySelector('.interface')

   //동화 리스트
   const showAll = document.querySelector('.showAll')
   const carousel = document.querySelector('.carousel')

   //사용되는 카메라 변수 저장
   let viewScene = introScene;
   let viewCamera = introCamera;

   //현재 누른 인트로의 단계는 무엇인지
   let introStep = 'intro';
  
   //현재 누른 인트로의 단계는 무엇인지
   let bookPlay = false;

   

   //현재 단계에 따라서 인트로 UI 변경
   function uiControl(step){
      if(step == 'selectMap'){
         //selecMap은 동화책의 배경을 선택할 수 있도록 카메라를 움직인 상태
         //intro는 처음 인트로의 재생과 저장버튼
         intro.classList.add('introDown')
         //backButton는 집버튼
         backButton.classList.add('introBackButton')
      }else if(step == 'intro'){
         //intro은 맨 처음 메인메뉴 상태
         withButton.classList.remove('displayNone')

         //modal 다시 없애기
         tutorial.classList.add('displayNone')
         namemake.classList.add('displayNone')

         //저장된 이야기가 재생중인지
         bookPlay = false;
         //record 동화를 녹화하고 있는지
         record = false;
         
         //drawButton은 그림 그리는 버튼 모아둔 부분
         drawButton.classList.remove('displayNone')
         //drawButton_emotion 감정 버튼
         drawButton_emotion.classList.add('drawButton_move')
         //recordRap 녹화 다음과 이전 버튼 
         recordRap.classList.remove('moveStart_move')

         //interfaceCss 맨 위 단계 UI 
         interfaceCss.classList.remove('displayBlock')
         interfaceCss.classList.add('displayNone')

         //저장된 동화책 목록
         carousel.classList.remove('carousel_move')

         //intro는 처음 인트로의 재생과 저장버튼 - 다시 위로 올림
         intro.classList.remove('introDown')
         backButton.classList.remove('introBackButton')

         //저장된 동화 여는 버튼
         showAll.classList.remove('showAll_move')

         //저장된 동화에서 다음으로 재생하는 버튼
         playRap.classList.remove('moveStart_move')

         //planes와 objects모두 초기화
         planes = [];
         objects = [];
      }else if(step == 'selectStory'){
         //selectStory는 저장된 동화책 선택 화면
         backButton.classList.add('introBackButton')
         intro.classList.add('introDown')
         showAll.classList.add('showAll_move')
      }else if(step == 'selectStory_detail'){
         carousel.classList.add('carousel_move')
         showAll.classList.remove('showAll_move')
      }else if(step == 'intomap'){
         //intomap은 현재 동화책을 선택하여, 배경이 어떻든 동화책 제작 화면으로 들어간 상태
         if(bookPlay == true){
            playRap.classList.add('moveStart_move')
            interfaceCss.classList.add('displayBlock')
            interfaceCss.classList.remove('displayNone')
            drawButton.classList.add('displayNone')
            drawButton.classList.remove('displayBlock')
            controlButton.classList.add('displayNone')
            controlButton.classList.remove('displayBlock')
         }else{
            interfaceCss.classList.add('displayBlock')
            interfaceCss.classList.remove('displayNone')

            //저장열기가 아니라 동화책 만들기 단계일 경우
            controlButton.classList.remove('displayNone')
         }
         carousel.classList.remove('carousel_move')
         withButton.classList.add('displayNone')
      }
   }
   //동화 리스트 올려주기
   showAll.addEventListener('click', function(){
      introStep = 'selectStory_detail';
      uiControl(introStep)
   })

   //홈버튼 누르면 뒤로 감
   backButton.addEventListener('click', () => {
      //동화책에서 인트로로
      if(introStep == 'intomap'){

         //녹화 시작 다시 false로
         record = false;
         //state => 0으로 리셋
         //카메라?
         //UI도?
         state = 0;
         feedbackTopUi(state);
         // drawButton.classList.add('drawButton_move')
         // drawButton_emotion.classList.remove('drawButton_move')
         sceneChange(3)
         bookPlay = false;
         cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
         introStep = 'intro';
         uiControl(introStep)
      } else if(introStep == 'selectMap'){
         cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
         introStep = 'intro';
         uiControl(introStep)
      }else if(introStep == 'selectStory'){
         cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
         introStep = 'intro';
         uiControl(introStep)
      }else if(introStep == 'selectStory_detail'){
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
         viewScene = scene;
         viewCamera = camera;
         uiControl(introStep);
      } else if (_number === 1) {
         environment = setupEnvironment(scene, gltfLoader, 1); // 바다 설정
         viewScene = scene;
         viewCamera = camera;
         uiControl(introStep);
      } else if (_number === 2) {
         environment = setupEnvironment(scene, gltfLoader, 2); // 밤 설정
         viewScene = scene;
         viewCamera = camera;
         uiControl(introStep);
      } else if (_number === 3) {
         // 메인화면
         viewScene = introScene;
         viewCamera = introCamera;
         uiControl(introStep);
         scene.clear();
      }
   }

   function getRandom(min, max)
   {
      return Math.floor(Math.random() * (max - min + 1) + min);
   }
   
   //동화의 이름 붙이기 & 이미지
   const titleButton = document.querySelector('.titleButton')
   const namearea = document.querySelector('.namearea')
   titleButton.addEventListener('click', () => {
      const title = namearea.value;
      const canvasImage = document.getElementById('canvasImage');

      const computedStyle = window.getComputedStyle(canvasImage);
      const backgroundImage = computedStyle.getPropertyValue('background-image');

      const imageUrl = backgroundImage.slice(4, -1).replace(/["']/g, "");

      totalData.thum = imageUrl;
      totalData.title = title;
      totalData.id = getRandom(1, 1000);
      const createTime = Date.now();
      totalData.time = createTime;
      totalData.scene = selectedMap;

      db.collection('storys').doc(title).set({totalData}
      )
      .then(() => {
         console.log("Document successfully written!");
         location.reload(true);
      })
      .catch((error) => {
         console.error("Error writing document: ", error);
      });

      sceneChange(3)
      cameraMove({x:-2, y: 4.8, z:6},{x:1, y: -10, z:-1})
      introStep = 'intro';
      uiControl(introStep);
      //녹화 시작 다시 false로
      record = false;
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
   let planes = [];
   let objects = [];

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
         record,
         id:planes.length
      });
      planes.push(plane);
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

      // const set = objects.length - 1
      // draggableObject = objects[set].mesh;
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
            rotation: 1,
            scale:0.5,
            record,
            modelSrc:`./models/${e.target.dataset.name}.glb`
         })

         houses.push(house);

         // const set = houses.length - 1;
         // draggableObject = houses[set].mesh;
      })
   })

   // 마우스가 움직일때
   canvas.addEventListener('mousemove', onPointerMove);

   // 마우스를 눌렀을때
   // canvas.addEventListener('click', onPointerDown);

   // 손으로 조작 방식
   canvas.addEventListener('mousedown', onPointerDown);
   canvas.addEventListener('mouseup', onPointerUp);

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

   //원으로 잡은 오브젝트의 위치 보여주기&숨기기
   function visibleOrnone (){
      if(draggableObject){
         if(draggableObject == planes[0]){
            color = '#8ed158';
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
         if(record == true){
               if(intersects[0].object.subject == 'plane'){
                  draggableObject = intersects[0].object.parent;
                  draggableObject.children[0].dragging = true;
               }else{}
         }else{
            draggableObject = intersects[0].object.parent;
            draggableObject.children[0].dragging = true;
         }
      }
      }
   if (draggableObject) {
      orbitControls.enabled = false;      
      visibleOrnone ();
      playanimationStart();
   }else{
      console.log("아무것도 못 잡았다")
   }

   //인트로용 레이캐스터 
   //클릭한 물체의 아이디를 확인해서 각 배경에 맞는 화면으로 이동 
   if(intersects3.length && introStep == 'selectMap'){
      let number;
      if(intersects3[0].object.id == clickAble[0].id){
         number = 0;
         introStep = 'intomap'
         sceneChange(number);
         //여기에 그림그리는 버튼이런거 추가해야함
      }else if(intersects3[0].object.id == clickAble[1].id){
         number = 1;
         introStep = 'intomap'
         sceneChange(number);
      }else if(intersects3[0].object.id == clickAble[2].id){
         number = 2;
         introStep = 'intomap'
         sceneChange(number);
      }
   }
}

// 마우스를 땠을때
function onPointerUp(event){
   if (draggableObject) {
      if(record){
            //draggableObject가 플랜일때만 작동
            if(draggableObject.children[0].subject == 'plane'){
               rememberInitialPosition2();
               makeLine();
            }else{}
      }else{}
      draggableObject.children[0].dragging = false;
      visibleOrnone(); 
      playanimationEnd();
      draggableObject = undefined;
   }
   orbitControls.enabled = true;
}

 function onPointerMove(event){
   dragObject();
   visibleOrnone ();
   if(draggableObject){
      playanimationStart();
   }else{}
   pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY/ window.innerHeight) * 2 + 1);
 }

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
      // result.actions[0].stop();
      // result.actions[1].play();
      result.mesh.position.y = 1.000;
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
      // result.actions[1].stop();
      // result.actions[4].play();
      result.mesh.position.y = 0.001;
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
            if(planes.length > 0 || houses.length > 0 || objects.length > 0){
            // 만약 그리는 상황이라면 plane만 움직일수 있도록
               draggableObject.position.x = obj3d.point.x;
               draggableObject.position.y = 0.001;
               draggableObject.position.z = obj3d.point.z;
               circle.position.copy(draggableObject.position)
               //(녹화가 되고 있고 드래그 오브젝트가 plane아이디를 가지고 있는 상황에)
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
      const totalData = {
         thum:null,
         positionData:[],
         background:{
            houses:[],
            objects:[]
         }
      }

      function rememberInitialPosition(){
            for (let i = 0; i < planes.length; i++){
               //현재 플랜의 수에 따라서 빈칸을 만들어준다.
               totalData.positionData[i] = {
                  id: i,
                  phase:{
                     0:[],
                     1:[],
                     2:[],
                     3:[],
                     4:[]
                  },
                  img:null,
                  title:null,
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
               totalData.positionData[i].phase[state].push(position2);
            }
         putblock(true);
      }

      const mesh3s = [];

      //클릭한 플랜트들의 위치를 저장
      function rememberInitialPosition2(){
         const position = planes[draggableObject.children[0].planeId].mesh.position;
         delete position._gsap;
         const position2 = {...position}
         totalData.positionData[draggableObject.children[0].planeId].phase[state].push(position2)
         putblock(true);
      }

      //다음 단계로 넘어갈때마다 모든 플랜트들의 위치를 저장
      function rememberInitialPosition3(){
         for (let i = 0; i < planes.length; i++){
            const position = planes[i].mesh.position;
            delete position._gsap;
            const position2 = {...position}
            totalData.positionData[i].phase[state].push(position2)
         }
         putblock(true);
      }

      function makeLine(){
      //   for (let i = 0; i < planes.length; i++){
            const planeId = draggableObject.children[0].planeId;
            const data1 = totalData.positionData[planeId].phase[state][(totalData.positionData[planeId].phase[state].length-2)]
            const data2 = totalData.positionData[planeId].phase[state][totalData.positionData[planeId].phase[state].length-1]
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

            if (planeId == 0) {
                  lienMaterial.color = new THREE.Color(203/255, 253/255, 171/255);
               } else if (planeId == 1) {
                  lienMaterial.color = new THREE.Color(163/255, 236/255, 207/255);
               } else if (planeId == 2) {
                  lienMaterial.color = new THREE.Color(166/255, 235/255, 243/255);
            }

            lienMaterials.push(lienMaterial);

            const mesh3 = new THREE.Mesh(line, lienMaterial);
            scene.add(mesh3);
            mesh3s.push(mesh3);
         // }
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
               const boxX = totalData.positionData[i].phase[state][totalData.positionData[i].phase[state].length - 1].x;
               const boxY = totalData.positionData[i].phase[state][totalData.positionData[i].phase[state].length - 1].y;
               const boxZ = totalData.positionData[i].phase[state][totalData.positionData[i].phase[state].length - 1].z;
               circle.position.set(boxX,boxY,boxZ);
               circles.push(circle);
            }else if(!firstOrNot){
               const boxX = totalData.positionData[i].phase[state][0].x;
               const boxY = totalData.positionData[i].phase[state][0].y;
               const boxZ = totalData.positionData[i].phase[state][0].z;
               circle.position.set(boxX,boxY,boxZ);
               circles.push(circle);
            }
         }
      }

      //오른쪽 플레이 버튼, 누르면 현재 저장된 위치를 따라서 이동할 수 있도록 한다.
      const play = document.querySelector('.play')
      play.addEventListener('click',() => {      
         const timelines = [];
         for (let i = 0; i < planes.length; i++){
            let nIntervId;
            timelines.push(gsap.timeline());
               for (let e = 0; e < totalData.positionData[i].phase[state].length; e++){
                  timelines[i].to(planes[i].mesh.position, { duration: 1.0, x:totalData.positionData[i].phase[state][e].x ,y:totalData.positionData[i].phase[state][e].y ,z:totalData.positionData[i].phase[state][e].z });
               }
            //각 palne마다 애니메이션을 재생
            const result = planes[i];
            result.actions[0].stop();
            result.actions[3].play();
            console.log('애니메이션이 시작됐습니다.');
            nIntervId = setInterval(Dust, 100);
            timelines[i].play()
            .then(() => {
               // 애니메이션이 끝날 때 실행할 코드 작성
               console.log('애니메이션이 끝났습니다.');
               for (let e = 0; e < totalData.positionData[i].phase[state].length; e++){
                  delete totalData.positionData[i].phase[state][e]._gsap;
               }
               console.log(totalData);
               result.actions[3].stop();
               result.actions[0].play();
               clearInterval(nIntervId);
             })
         }
      })

      //오른쪽 리턴버튼, 누르면 리셋되고 처음 위치로 돌아간다. //현재 state 삭제 기능 추가
      const reuse = document.querySelector('.reuse')
      reuse.addEventListener('click',() => {

         const tl = []
         for (let i = 0; i < planes.length; i++){
               tl.push(gsap.timeline());
               tl[i].to(planes[i].mesh.position, { duration: 0.5, x:totalData.positionData[i].phase[state][0].x ,y:totalData.positionData[i].phase[state][0].y ,z:totalData.positionData[i].phase[state][0].z });
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
            totalData.positionData[i].phase[state].splice(1);
         }
      })

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
   
      function createPlane(data){
         for(const key in data.totalData.positionData){
            const plane = new Plane({
               textureLoader2,
               scene,
               imageSrc: data.totalData.positionData[key].img,
               // x:0,
               x:data.totalData.positionData[key].phase[0][0].x,
               y:data.totalData.positionData[key].phase[0][0].y,
               z:data.totalData.positionData[key].phase[0][0].z,
               scale:0.5,
               record
            });
            planes.push(plane);
         }

         for(const key in data.totalData.background.houses){
            const house = new House({
               textureLoader2,
               scene,
               x:data.totalData.background.houses[key].position.x,
               y:data.totalData.background.houses[key].position.y,
               z:data.totalData.background.houses[key].position.z,
               rotation: 1,
               scale:0.5,
               record,
               modelSrc:data.totalData.background.houses[key].model
            });
            houses.push(house);
         }
         for(const key in data.totalData.background.objects){
            const object = new Object({
               textureLoader2,
               scene,
               imageSrc: data.totalData.background.objects[key].img,
               x:data.totalData.background.objects[key].position.x,
               y:data.totalData.background.objects[key].position.y,
               z:data.totalData.background.objects[key].position.z,
               scale:0.5,
               record
            });
            objects.push(object);
         }
      }


      //반복적으로 렌더링 해주기
      function draw() {
         labelRenderer.render(scene, camera);
         //만약 그림이 하나라도 있으면, 그림을 완성하기 버튼이 나타난다. play에선 x
         if(planes.length > 0 && !record && !bookPlay){
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
   
   // const preventDragClick = new PreventDragClick(canvas);
   
   

   draw();
}