$(document).ready(function () {
    const vocabulary = [
        { fr: 'toujours', uk: ['завжди'], display: 'завжди' },
        { fr: 'bonjour', uk: ['привіт', 'добрий день'], display: 'привіт / добрий день' },
        { fr: 'merci', uk: ['дякую', 'спасибі'], display: 'дякую' },
        { fr: 'maison', uk: ['дім', 'будинок'], display: 'дім / будинок' },
        { fr: 'soleil', uk: ['сонце'], display: 'сонце' },
        { fr: 'eau', uk: ['вода'], display: 'вода' },
        { fr: 'livre', uk: ['книга', 'книжка'], display: 'книга' },
        { fr: 'ami', uk: ['друг'], display: 'друг' },
        { fr: 'temps', uk: ['час', 'погода'], display: 'час' },
        { fr: 'nuit', uk: ['ніч'], display: 'ніч' }
    ];

    let shuffledWords = [];
    let currentIndex = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;

    function shuffleArray(arr) {
        const copy = arr.map(item => ({
            ...item,
            status: null, 
            userAnswer: ''
        }));
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function initQuiz() {
        shuffledWords = shuffleArray(vocabulary);
        currentIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        answeredCount = 0;

        $('#correctCount').text('0');
        $('#wrongCount').text('0');
        $('#resultModal').fadeOut(200);

        renderCard();
    }

    function renderCard() {
        const current = shuffledWords[currentIndex];
        const $card = $('#wordCard');
        const $input = $('#translationInput');
        const $feedback = $('#feedbackMsg');

        $('#frenchWord').text(current.fr);
        $('#stepCounter').text(`${currentIndex + 1}/${shuffledWords.length}`);
        $('#validationError').text('');
        $input.removeClass('input-error');
        $card.removeClass('card-correct card-wrong');
        $feedback.removeClass('success error').text('');

        $('#prevBtn').prop('disabled', currentIndex === 0);
        $('#nextBtn').prop('disabled', currentIndex === shuffledWords.length - 1);

        if (current.status !== null) {
            $input.val(current.userAnswer).prop('disabled', true);
            if (current.status === 'correct') {
                $card.addClass('card-correct');
                $feedback.addClass('success').text('Вірно!');
            } else {
                $card.addClass('card-wrong');
                $feedback.addClass('error').text(`Правильно: ${current.display}`);
            }
        } else {
            $input.val('').prop('disabled', false).focus();
        }
    }

    function checkAnswer() {
        const current = shuffledWords[currentIndex];
        if (current.status !== null) return; 

        const $input = $('#translationInput');
        const rawValue = $input.val().trim();

        if (rawValue === '') {
            $('#validationError').text('Введіть переклад перед перевіркою.');
            $input.addClass('input-error').focus();
            return;
        }

        const validPattern = /^[а-яіїєґА-ЯІЇЄҐ\s'-]+$/;
        if (!validPattern.test(rawValue)) {
            $('#validationError').text('Використовуйте лише українські літери.');
            $input.addClass('input-error').focus();
            return;
        }

        $('#validationError').text('');
        $input.removeClass('input-error');

        const normalized = rawValue.toLowerCase();
        current.userAnswer = rawValue;
        answeredCount++;

        if (current.uk.includes(normalized)) {
            current.status = 'correct';
            correctCount++;
            $('#correctCount').text(correctCount);
        } else {
            current.status = 'wrong';
            wrongCount++;
            $('#wrongCount').text(wrongCount);
        }

        renderCard();

        if (answeredCount === shuffledWords.length) {
            setTimeout(showResultModal, 800);
        } else {
            setTimeout(function () {
                const nextUnanswered = shuffledWords.findIndex((w, idx) => idx > currentIndex && w.status === null);
                if (nextUnanswered !== -1) {
                    currentIndex = nextUnanswered;
                    renderCard();
                } else {
                    const firstUnanswered = shuffledWords.findIndex(w => w.status === null);
                    if (firstUnanswered !== -1) {
                        currentIndex = firstUnanswered;
                        renderCard();
                    }
                }
            }, 900);
        }
    }

    function showResultModal() {
        const total = shuffledWords.length;
        const percent = Math.round((correctCount / total) * 100);
        let level = '';
        let desc = '';

        if (percent >= 90) {
            level = 'C1 — Просунутий';
            desc = 'Чудовий результат! Ви бездоганно володієте цими словами.';
        } else if (percent >= 70) {
            level = 'B1 — Середній';
            desc = 'Гарний рівень знань, залишилося підтягнути кілька слів.';
        } else if (percent >= 40) {
            level = 'A2 — Базовий';
            desc = 'Непоганий початок, але варто ще раз зазирнути у словник.';
        } else {
            level = 'A1 — Початківець';
            desc = 'Перегляньте слова у словнику та спробуйте пройти тест знову.';
        }

        $('#finalScore').text(`${correctCount}/${total} (${percent}%)`);
        $('#levelBadge').text(level);
        $('#levelDescription').text(desc);
        $('#resultModal').css('display', 'flex').hide().fadeIn(250);
    }

    function populateDictionary() {
        const $list = $('#dictList');
        $list.empty();
        vocabulary.forEach(item => {
            $list.append(`
                <li>
                    <span class="dict-fr">${item.fr}</span>
                    <span class="dict-uk">${item.display}</span>
                </li>
            `);
        });
    }

    $('#wordCard').on('click', checkAnswer);

    $('#translationInput').on('keypress', function (e) {
        if (e.which === 13) {
            checkAnswer();
        }
    });

    $('#prevBtn').on('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            renderCard();
        }
    });

    $('#nextBtn').on('click', function () {
        if (currentIndex < shuffledWords.length - 1) {
            currentIndex++;
            renderCard();
        }
    });

    $('#dictBtn').on('click', function () {
        $('#dictModal').css('display', 'flex').hide().fadeIn(200);
    });

    $('.close-modal').on('click', function () {
        const targetId = $(this).data('close');
        $('#' + targetId).fadeOut(200);
    });

    $('#dictModal').on('click', function (e) {
        if ($(e.target).is('#dictModal')) {
            $(this).fadeOut(200);
        }
    });

    $('#restartBtn').on('click', initQuiz);

    populateDictionary();
    initQuiz();
});