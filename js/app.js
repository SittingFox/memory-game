/*
 * Create a list that holds all of your cards
 */
class Model {
    constructor() {
        this.baseCards = ['anchor', 'bicycle', 'bolt', 'bomb', 'cube', 'diamond', 'leaf', 'paper-plane-o'];
        this.cardStack = [...this.baseCards, ...this.baseCards];
        this.flippedCards = [];
    }
}

/*
* Display the cards on the page
*   - shuffle the list of cards using the provided "shuffle" method below
*   - loop through each card and create its HTML
*   - add each card's HTML to the page
*/

class ViewModel {
    hasTwoFlipped() {
        return model.flippedCards.length === 2;
    }

    beginNewGame() {
        view.clearCards();
        this.shuffle(model.cardStack);
        this.layCards();
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

    manageFlippingCards(card, cardFace) {
        this.flipCard(card, cardFace);
        this.checkFlippedCards();
    }

    checkFlippedCards() {
        let self = this;
        if (self.hasTwoFlipped()) {
            checkBothCards();
        }

        function checkBothCards() {
            let lastCard = model.flippedCards[0];
            let currentCard = model.flippedCards[1];
            if (lastCard.face === currentCard.face) {
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
        const self = this;
        view.makeCardFaceUp(card);
        storeFlippedCard();

        function storeFlippedCard() {
            let flippedCard = {
                face: cardFace,
                element: card
            };

            model.flippedCards.push(flippedCard);
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

        function setFlippedToMatch(card) {
            view.lockMatchingCard(card.element);
        }
    }

    changeFlippedCards(changeEffect) {
        model.flippedCards.forEach(changeEffect);
        model.flippedCards = [];
    }

    resetCard(card) {
        view.makeCardFaceDown(card.element);
    }
}

class View {
    constructor() {
        this.playingField = document.getElementsByClassName('deck')[0];
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
            card.addEventListener('click', flipOnClick);

            return card;

            function flipOnClick() {
                if (!viewModel.isFlipped(card)) {
                    viewModel.manageFlippingCards(card, cardType);
                }
            }
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
}

const model = new Model();
const viewModel = new ViewModel();
const view = new View();


/*
* set up the event listener for a card. If a card is clicked:
*  - display the card's symbol (put this functionality in another function that you call from this one)
*  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
*  - if the list already has another card, check to see if the two cards match
*    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
*    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
*    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
*    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
*/

viewModel.beginNewGame();