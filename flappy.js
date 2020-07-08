function novoElemento(tagName, className) {   //funcao para criar elemento e aplicar uma classe
    const elem = document.createElement(tagName) 
    elem.className = className
    return elem
}

function Barreira(reversa = false) { //funcao para criar as barreiras, de baixo e de cima
    this.elemento = novoElemento('div', 'barreira') //elemento = DOM a ser inserido na pagina

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda) //appendchild metodo para adicionar. verificar se vai ser inserido primeiro o corpo ou borda
    this.elemento.appendChild(reversa ? borda : corpo) //se for reversa primeiro aplica borda e depois corpo

    this.setAltura = altura => corpo.style.height = `${altura}px` //setando altura da barreira que vai precisar de um processo aleatorio em cima da templeate string
}   
//teste
// const b = new Barreira(true) // ou false para criar a barreira reversa
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {  //funcao para criar o par de barreiras
    this.elemento = novoElemento('div', 'par-de-barreiras')  //criando novo elemento div com classe par de barreiras

    this.superior = new Barreira(true) //instanciando novas barreiras atraves da chamada Barreira
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento) //utilizando dentro da funcao construtora o "elemento" que sera criado na dom
    this.elemento.appendChild(this.inferior.elemento) //adicionado os dois elementos dentro da div

    this.sortearAbertura = () => {  //funcao para realizar a abertura das barreiras de modo dinamico / funcao esta publica por ter o this
        const alturaSuperior = Math.random() * (altura - abertura) //abertura fixa, sera alterado apenas altura de um dos lados
        const alturaInferior = altura - abertura - alturaSuperior //resultado altura do jogo, -abertura -altura superior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) //Quero saber em que posicao o par de barreira se encontra no momento
    this.setX = x => this.elemento.style.left = `${x}px` //setar x para alterar a posicao em pixel para o left. assim rodar animacao
    this.getLargura = () => this.elemento.clientWidth //pegar a largura do elemento

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {//dimensoes do jogo, abertura entre barreira e espaco entre multiplas barreiras / 
//notificarponto identifica sempre que a barreira cruza o centro do jogo, para contabilizar um ponto da pontuacao do jogo e chamar a funcao callback
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 //de quanto em quanto pixels sera animado as barreiras
    this.animar = () => { //funcao por dar um passo na animacao
        this.pares.forEach(par => {  //pegando o valor de x atual e setando para um novo
            par.setX(par.getX() - deslocamento) //funcao do movimento

            //quando o elemento sair da area do jogo, tem que ser sorteada novamente.
            if (par.getX() < -par.getLargura()) {  //x é left = 0 , quando x negativo, menor que a largura do par de barreira
                par.setX(par.getX() + espaco * this.pares.length) //x muda de posicao, ppara o final
                par.sortearAbertura()
            }

            const meio = largura / 2   //calculo para saber se cruzou o meio
            const cruzouOMeio = par.getX() + deslocamento >= meio //
            && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
            //cruzouOMeio && notificarPonto()   / outra forma da expressao. caso positivo executa funcao notificar ponto
            // caso negativo nao faz nada
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if (!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)  
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(passaro.elemento)
    areaDoJogo.appendChild(progresso.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        },20)
    }
}

new FlappyBird().start()