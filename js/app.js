class Timer {
    constructor() {
        this.timer = null;
        this.startTime = null;
        this.formattedTime = '';
        this.prevSecondsPassed = -1;

        this.timerElement = document.getElementsByClassName('timer')[0];
    }

    startTimer() {
        const self = this;
        this.startTime = new Date();
        this.prevSecondsPassed = -1;
        const waitTime = 200;

        stopTimerIfRunning();

        self.timer = setInterval(calcTimeDifference, waitTime);

        function stopTimerIfRunning() {
            if (self.timer !== null) {
                self.stopTimer();
            }
        }

        function calcTimeDifference() {
            const currentTime = new Date();
            const totalTime = Math.abs(currentTime - self.startTime);
            const secondsPassed = Math.floor(totalTime / 1000);

            if (secondsPassed !== self.prevSecondsPassed) {
                adjustClock(secondsPassed);
            }
        }

        function adjustClock(secondsPassed) {
            self.prevSecondsPassed = secondsPassed;
            formatDigits();
            changeClockTime();

            function formatDigits () {
                const minutesPassed = Math.floor(secondsPassed / 60);
                const remainingSeconds = secondsPassed % 60;
                const formattedMinutes = padDigits(minutesPassed);
                const formattedSeconds = padDigits(remainingSeconds);

                self.formattedTime = `${formattedMinutes}:${formattedSeconds}`;

                function padDigits(num) {
                    let formattedDigits = num.toString();
                    if (formattedDigits.length < 2) {
                        formattedDigits = '0' + formattedDigits;
                    }

                    return formattedDigits;
                }
            }

            function changeClockTime() {
                self.timerElement.innerText = self.formattedTime;
            }
        }
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }
}

class StarManager {
    constructor() {
        this.stars = Array.from(document.getElementsByClassName('fa-star'));
        this.count = this.stars.length;
        this.moveCountTiers = [20, 15, 10];

        this.resetStars();
    }

    resetStars() {
        this.stars.forEach(function(star) {
            star.classList.remove('hidden');
        });

        this.count = this.stars.length;
    }

    checkMoves(numMoves) {
        const self = this;
        const maxStars = self.stars.length;
        for (let starCount = 0; starCount < maxStars; starCount++) {
            const moveAmount = self.moveCountTiers[starCount];
            if (numMoves > moveAmount) {
                checkStarCount(starCount);
                break;
            }
        }

        function checkStarCount(num) {
            if (num < self.count) {
                hideStar();
                self.count = num;
            }

            function hideStar() {
                const starPosition = num;
                self.stars[starPosition].classList.add('hidden');
            }
        }
    }


}

class Model {
    constructor() {
        this.baseCards = ['anchor', 'bicycle', 'bolt', 'bomb', 'cube', 'diamond', 'leaf', 'paper-plane-o'];
        this.cardStack = [...this.baseCards, ...this.baseCards];
        this.flippedCards = [];
        this.numMoves = 0;
        this.starManager = new StarManager();
        this.timer = new Timer();
        this.numMatches = 0;
        this.maxMatches = this.baseCards.length;
    }
}

class ViewModel {
    hasTwoFlipped() {
        return model.flippedCards.length === 2;
    }

    beginNewGame() {
        this.resetNumMoves();
        this.resetNumMatches();
        model.starManager.resetStars();
        this.clearCards();
        this.shuffle(model.cardStack);
        this.layCards();
        this.startTimer();
    }

    resetNumMoves() {
        model.numMoves = 0;
        this.updateMoves();
    }

    resetNumMatches() {
        model.numMatches = 0;
    }

    clearCards() {
        this.clearFlippedCards();
        view.clearCards();
    }

    updateMoves() {
        view.updateMoves(model.numMoves);
    }

    increaseNumMoves() {
        model.numMoves++;
        model.starManager.checkMoves(model.numMoves);
    }

    // Shuffle function from http://stackoverflow.com/a/2450976
    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    layCards() {
        for (let cardType of model.cardStack) {
            view.addNewCard(cardType);
        }
    }

    startTimer() {
        model.timer.startTimer();
    }

    stopTimer() {
        model.timer.stopTimer();
    }

    manageFlippingCards(card, cardFace) {
        const self = this;
        self.flipCard(card, cardFace);
        manageMoves();
        self.checkFlippedCards();

        function manageMoves() {
            if (self.hasTwoFlipped()) {
                self.increaseNumMoves();
                self.updateMoves();
            }
        }
    }

    checkFlippedCards() {
        let self = this;
        if (self.hasTwoFlipped()) {
            checkBothCards();
        }

        function checkBothCards() {
            let lastCard = model.flippedCards[0];
            let currentCard = model.flippedCards[1];
            if (lastCard.type === currentCard.type) {
                self.markCardsMatching();
            } else {
                self.unflipCards();
            }
        }
    }

    isFlipped(card) {
        return view.isCardFlipped(card);
    }

    flipCard(card, cardFace) {
        view.makeCardFaceUp(card);
        storeFlippedCard();

        function storeFlippedCard() {
            model.flippedCards.push(card);
        }
    }

    unflipCards() {
        const self = this;
        const waitTime = 500;
        setTimeout(resetFlippedCards, waitTime);

        function resetFlippedCards() {
            self.changeFlippedCards(self.resetCard);
         }
}

    markCardsMatching() {
        this.changeFlippedCards(setFlippedToMatch);
        this.calcMatching();

        function setFlippedToMatch(card) {
            view.lockMatchingCard(card);
        }
    }

    calcMatching() {
        model.numMatches++;
        if (model.numMatches === model.maxMatches) {
            this.victory();
        }
    }

    victory() {
        this.stopTimer();
        view.openVictoryModal();
    }

    changeFlippedCards(changeEffect) {
        model.flippedCards.forEach(changeEffect);
        this.clearFlippedCards();
    }

    clearFlippedCards() {
        model.flippedCards = [];
    }

    resetCard(card) {
        view.makeCardFaceDown(card);
    }
}

class View {
    constructor() {
        const self = this;
        self.playingField = document.getElementsByClassName('deck')[0];
        self.movesAmount = document.getElementsByClassName('moves')[0];
        self.restartButton = document.getElementsByClassName('restart')[0];

        initListeners();

        function initListeners() {
            initPlayingField();
            initRestart();

            function initPlayingField() {
                self.playingField.addEventListener('click', flipCardsOnClick);
            }

            function initRestart() {
                self.restartButton.addEventListener('click', self.openRestartModal.bind(self));
            }

            function flipCardsOnClick(event) {
                let clickedElement = event.target;
                let cardElementName = 'LI';

                if (clickedElement.nodeName === cardElementName) {
                    self.flipOnClick(clickedElement);
                }
            }
        }
    }

    flipOnClick(card) {
        if (canFlipCard()) {
            viewModel.manageFlippingCards(card, card.type);
        }

        function canFlipCard() {
            return !viewModel.isFlipped(card) && !viewModel.hasTwoFlipped();
        }
    }

    updateMoves(numMoves) {
        this.movesAmount.innerHTML = numMoves;
    }

    clearCards() {
        removeAllChildNodes(this.playingField);

        function removeAllChildNodes(element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.lastChild);
            }
        }
    }

    addNewCard(cardType) {
        const newCard = createCard(cardType);
        const cardFace = createCardFace(cardType);

        newCard.appendChild(cardFace);
        this.playingField.appendChild(newCard);

        function createCardFace(card) {
            const cardFace = document.createElement('span');
            const cardDesign = 'fa-' + cardType;
            cardFace.classList.add('fa', cardDesign);

            return cardFace;
        }

        function createCard(cardType) {
            const card = document.createElement('li');
            card.classList.add('card');
            card.type = cardType;

            return card;
       }
    }

    makeCardFaceDown(element) {
        const cardClass = 'card';
        element.className = cardClass;
    }

    lockMatchingCard(element) {
        const matchClass = 'match';

        this.makeCardFaceDown(element);
        element.classList.add(matchClass);
    }

    makeCardFaceUp(card) {
        card.classList.add('open', 'show');
    }

    isCardFlipped(card) {
        const cardClass = 'card';
        return card.className !== cardClass;
    }

    newGameModal(modalSettings) {
        modalSettings.callback = viewModel.beginNewGame.bind(viewModel);
        this.modal(modalSettings);
    }

    modal(modalSettings) {
        swal({
            title: modalSettings.title,
            text: modalSettings.text,
            type: modalSettings.type,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                modalSettings.callback();
            }
        });
    }

    openRestartModal() {
        const modalSettings = {
            title: 'Restart the game?',
            type: 'warning'
        };

        this.newGameModal(modalSettings);
    }

    openVictoryModal() {
        const modalSettings = {
            title: 'Restart the game?',
            text: `You won in ${model.numMoves} moves, earning you ${model.starManager.count} stars! It took you ${model.timer.formattedTime}.`,
            type: 'success'
        };

        this.newGameModal(modalSettings);
    }
}

const model = new Model();
const viewModel = new ViewModel();
const view = new View();

viewModel.beginNewGame();