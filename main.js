// JavaScript extracted from index.html

document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const header = document.getElementById('header');
    const nameEl = document.getElementById('name');
    const initialsEl = document.getElementById('initials');
    const navCards = document.getElementById('nav-cards');
    const cardsSection = document.getElementById('cards-section');
    const cards = document.querySelectorAll('.card');
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeModal = document.getElementById('close-modal');
    const takeALookBtn = document.getElementById('take-a-look');
    const viewWorkBtn = document.getElementById('view-work');

    // Info modal functionality
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeInfoModal = document.getElementById('close-modal');

    // Info modal event listeners
    if (infoBtn && infoModal) {
        infoBtn.addEventListener('click', function() {
            infoModal.classList.remove('hidden');
        });
    }

    if (closeInfoModal && infoModal) {
        closeInfoModal.addEventListener('click', function() {
            infoModal.classList.add('hidden');
        });
    }

    if (infoModal) {
        infoModal.addEventListener('click', function(e) {
            if (e.target === infoModal) {
                infoModal.classList.add('hidden');
            }
        });
    }

    // Scroll to iframe when clicking the view work button
    if (viewWorkBtn) {
        viewWorkBtn.addEventListener('click', function() {
            const iframeSection = document.querySelector('iframe');
            if (iframeSection) iframeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // "Take a Look" scroll functionality
    if (takeALookBtn) {
        takeALookBtn.addEventListener('click', function() {
            if (cardsSection) cardsSection.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
    }

    function setupAnimatedName() {
        const nameText = "Albert Vargas";
        if (!nameEl) return;
        nameEl.innerHTML = '';
        for(let i = 0; i < nameText.length; i++) {
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.setAttribute('data-letter', nameText[i]);
            letter.textContent = nameText[i];
            nameEl.appendChild(letter);
        }
        setTimeout(() => {
            nameEl.classList.add('initialized');
        }, 300);
    }

    function resetNameAnimation() {
        if (!nameEl) return;
        nameEl.classList.remove('initialized');
        setTimeout(() => {
            nameEl.classList.add('initialized');
        }, 100);
    }

    setupAnimatedName();

    function createNavCards() {
        if (!cards || cards.length === 0 || !navCards) return; // Guard clause
        cards.forEach(card => {
            const cardId = card.id;
            const title = card.querySelector('h3')?.textContent.trim() || '';
            const iconClone = card.querySelector('h3 i')?.cloneNode(true);
            if (!iconClone) return;
            const navCard = document.createElement('div');
            navCard.className = `nav-icon ${cardId.replace('-card', '')}`;
            navCard.dataset.target = cardId;
            navCard.setAttribute('title', title);
            navCard.appendChild(iconClone);
            const srText = document.createElement('span');
            srText.className = 'sr-only';
            srText.textContent = title;
            navCard.appendChild(srText);
            navCards.appendChild(navCard);
            navCard.addEventListener('click', function() {
                const targetCard = document.getElementById(this.dataset.target);
                if (targetCard) toggleCard(targetCard);
                document.querySelectorAll('.nav-icon').forEach(nc => {
                    nc.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }

    function toggleCard(card) {
        if (!card) return;
        cards.forEach(c => {
            if (c !== card && c.classList.contains('active')) {
                c.classList.remove('active');
                const cIcon = c.querySelector('.fas.fa-chevron-down');
                if (cIcon) cIcon.style.transform = 'rotate(0deg)';
            }
        });
        card.classList.toggle('active');
        const icon = card.querySelector('.fas.fa-chevron-down');
        if (icon) {
            if (card.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
                const navIcon = document.querySelector(`.nav-icon[data-target="${card.id}"]`);
                if (navIcon) {
                    document.querySelectorAll('.nav-icon').forEach(nc => {
                        nc.classList.remove('active');
                    });
                    navIcon.classList.add('active');
                }
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        }
    }

    if (cards && cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', function() {
                toggleCard(this);
            });
        });
    }

    let lastScrollPosition = 0;
    if (header && nameEl && initialsEl && navCards) { // Guard clause for scroll elements
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const cardsSectionTop = cardsSection?.offsetTop || 0;
            if (scrollPosition > cardsSectionTop - 100) {
                header.classList.add('sticky', 'top-0', 'z-40', 'sticky-header');
                nameEl.classList.add('hidden');
                initialsEl.classList.remove('hidden');
                navCards.classList.remove('hidden'); // Ensure navCards is defined
            } else {
                header.classList.remove('sticky', 'top-0', 'z-40', 'sticky-header');
                nameEl.classList.remove('hidden');
                initialsEl.classList.add('hidden');
                navCards.classList.add('hidden'); // Ensure navCards is defined
                if (scrollPosition < lastScrollPosition) resetNameAnimation();
            }
            lastScrollPosition = scrollPosition;
        });
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            if (contactModal) contactModal.classList.remove('hidden');
        });
    }
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (contactModal) contactModal.classList.add('hidden');
        });
    }
    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === contactModal) contactModal.classList.add('hidden');
        });
    }
    createNavCards();
}); 