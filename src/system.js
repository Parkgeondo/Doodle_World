//그림판이 열리는지 닫히는지 상태에 대한 관리
export default function system() {

    // 뒤로가는 버튼
    const backButton = document.querySelector('.backButton')

    //오른쪽 창
    const drawing = document.querySelector('.drawing')
    const stuff = document.querySelector('.stuff')
    const building = document.querySelector('.building')

    const draw = document.querySelectorAll('.draw')

    const moveStart = document.querySelector('.moveStart')
    const miniBack = document.querySelectorAll('.miniBack')

    const tutorial = document.querySelectorAll('.tutorial')
    const namemake = document.querySelector('.namemake')

    //녹음하고 있는지
    let record = false;
    moveStart.addEventListener('click', () => {
        record = true;
        console.log(record)
        if(record){
            drawing.classList.add('leftMove')
            stuff.classList.add('leftMove')
            building.classList.add('leftMove')
         }
    })

    let drawMode = false;
    let stuffMode = false;
    let buildingMode = false;

    backButton.addEventListener('click', (e) => {
        drawing.classList.add('leftMove')
        stuff.classList.add('leftMove')
        building.classList.add('leftMove')
    })

    draw.forEach(function(item){
        item.addEventListener('click', (e) => {
            console.log('work?')
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
                stuff.classList.add('leftMove')
                building.classList.add('leftMove')
                drawMode = false;
                buildingMode = false;
                tutorial.forEach(function(item){
                    item.classList.add('displayNone')
                    namemake.classList.add('displayNone')
                })
        })
    })

}