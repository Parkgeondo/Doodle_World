import example from './ex01.js';


//그림판이 열리는지 닫히는지 상태에 대한 관리
export default function system() {
    //왼쪽 하단 버튼
    const drawHuman = document.querySelector('.drawHuman')
    const drawStuff = document.querySelector('.drawStuff')
    const drawHome = document.querySelector('.drawHome')

    // 뒤로가는 버튼
    const backButton = document.querySelector('.backButton')

    //오른쪽 창
    const drawing = document.querySelector('.drawing')
    const stuff = document.querySelector('.stuff')
    const building = document.querySelector('.building')

    const draw = document.querySelectorAll('.draw')

    const moveStart = document.querySelector('.moveStart')
    const miniBack = document.querySelectorAll('.miniBack')

    //녹음하고 있는지
    let record = false;
    moveStart.addEventListener('click', () => {
        record = true;
        console.log(record)
        if(record){
            drawing.classList.add('leftMove')
            drawStuff.classList.add('leftMove')
            drawHome.classList.add('leftMove')
         }
    })

    let drawMode = false;
    let stuffMode = false;
    let buildingMode = false;

    draw.forEach(function(item){
        item.addEventListener('click', (e) => {
            const data = e.target.dataset.name
            switch(data){
                case 'draw':
                    drawing.classList.remove('leftMove')
                    stuff.classList.add('leftMove')
                    building.classList.add('leftMove')
                    break;
                case 'stuff':
                    drawing.classList.add('leftMove')
                    stuff.classList.remove('leftMove')
                    building.classList.add('leftMove')
                    break;
                case 'building':
                    drawing.classList.add('leftMove')
                    stuff.classList.add('leftMove')
                    building.classList.remove('leftMove')
                    break;
            }
        })
    })

    miniBack.forEach(function(item){
        item.addEventListener('click', function(){
                drawing.classList.add('leftMove')
                drawing.classList.add('leftMove')
                building.classList.add('leftMove')
                drawMode = false;
                buildingMode = false;
                console.log('asdad')
        })
    })

    let nowPage = 1;

    const showBook_block = document.querySelectorAll('.showBook_block')
    const showBooks = document.querySelectorAll('.showBooks')
    const showBook = document.querySelector('.showBook')
    //동화 리스트
    showBook_block.forEach(function(item){
        item.addEventListener('click', function(){
            console.log(item)
        })
   })

   let startPoint = 0;
   let clicked = false;
   let currentPage = 0; // 현재 페이지를 추적하는 변수

   const totalPages = 3; // 전체 페이지 수

   for(let i = 0; i < 3; i++){
        showBooks[i].addEventListener('mousedown', function(e){
            startPoint = e.clientX
            clicked = true;
        })
        showBooks[i].addEventListener('mousemove', function(e){
            if(clicked == true){
                showBook.style.transform = `translateX(${-currentPage * 100}vw) translateX(${e.clientX - startPoint}px)`;
                console.log(currentPage)
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
}