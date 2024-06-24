import P5 from 'p5'

export default function createP5(parentId, w, h, backgroundColor) {

    const sketch = (p) => {
        const size = document.querySelector('.size')
        const color = document.querySelector('.color')
        const deleteButton = document.querySelector('.delete1')

        //색상
        let c = "red";

        //굵기
        let a = 12;
        let lineDot = [];

        p.setup = () => {       
            p.noLoop()
            p.createCanvas(w, h)
            p.background(backgroundColor)
            
        }
        p.draw = () => {
            if (p.mouseIsPressed) {
                p.stroke(c);
                p.strokeWeight(a);
                lineDot.push(p.mouseX,p.mouseY)
                
                if(lineDot.length > 2){
                    p.line(lineDot[0], lineDot[1],lineDot[2],lineDot[3]);
                    lineDot.splice(0, 2);
                }
          }else{
            if(lineDot.length){
                lineDot = []
            }
        }
        p.mouseDragged = () => {
        }
            window.requestAnimationFrame(p.draw);
        }

        size.addEventListener('click', setSize)
        function setSize(e){
            if(!e.target.dataset.size) return
            a = e.target.dataset.size
            size.querySelectorAll('.cButton').forEach(function(button) {
                button.classList.remove('active')
            })
            e.target.classList.add('active')
        }
        color.addEventListener('click', setColor)
        function setColor(e){
            if(!e.target.dataset.color) return
            c = e.target.dataset.color
            color.querySelectorAll('.cButton').forEach(function(button) {
                button.classList.remove('active')
            })
            e.target.classList.add('active')
        }
        deleteButton.addEventListener('click', deleteDrawing)
        function deleteDrawing(e){
            p.clear();
        }
    } 
    return new P5(sketch, parentId)
}