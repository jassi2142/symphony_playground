document.addEventListener('DOMContentLoaded', () => {
    // Platform Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    document.body.classList.add(isMobile ? 'is-mobile' : 'is-desktop');
    
    const setOrientation = () => {
        if(window.innerWidth > window.innerHeight) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    };
    window.addEventListener('resize', setOrientation);
    setOrientation();

    const pals = document.querySelectorAll('#sidebar .pal');
    const meadow = document.getElementById('meadow');
    const trashMonster = document.getElementById('trash-monster');
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnReset = document.getElementById('btn-reset');
    
    const tabs = document.querySelectorAll('.category-tab');
    const tempoSlider = document.getElementById('tempo-slider');
    const paceSlider = document.getElementById('pace-slider');

    let isPlaying = false;
    
    // Sliders
    tempoSlider.addEventListener('input', (e) => {
        if(window.setTempo) window.setTempo(parseInt(e.target.value));
    });
    paceSlider.addEventListener('input', (e) => {
        if(window.setPace) window.setPace(parseFloat(e.target.value));
    });

    // Categories UI
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.getAttribute('data-category');
            
            pals.forEach(pal => {
                if(pal.parentElement && pal.parentElement.classList.contains('sidebar-inner')) {
                    if(pal.classList.contains('category-' + cat)) {
                        pal.classList.remove('hidden');
                    } else {
                        pal.classList.add('hidden');
                    }
                }
            });
        });
    });

    // Scroll Wheel Resize
    meadow.addEventListener('wheel', e => {
        const pal = e.target.closest('.pal');
        if(pal) {
            e.preventDefault();
            let scale = parseFloat(pal.getAttribute('data-scale') || '1');
            scale -= e.deltaY * 0.002;
            scale = Math.max(0.4, Math.min(scale, 3.0));
            pal.setAttribute('data-scale', scale.toFixed(2));
            pal.style.transform = `scale(${scale})`;
        }
    }, {passive: false});

    // Audio Unlock
    document.body.addEventListener('pointerdown', () => {
        if(window.audioCtx && window.audioCtx.state === 'suspended') {
            window.audioCtx.resume();
        }
    }, { once: true });

    // Controls
    btnPlay.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        btnPlay.style.transform = 'scale(0.9)';
        setTimeout(() => btnPlay.style.transform = 'none', 100);
        
        const getMeadowTypes = () => {
            const els = Array.from(meadow.children);
            els.sort((a,b) => parseFloat(a.style.left) - parseFloat(b.style.left));
            return els.map(el => {
                return {
                    type: el.getAttribute('data-type'),
                    element: el,
                    scale: parseFloat(el.getAttribute('data-scale') || '1')
                };
            });
        };
        
        if(window.startPlayback) {
            window.startPlayback(getMeadowTypes);
        }
    }
});

    btnStop.addEventListener('click', () => {
        isPlaying = false;
        btnStop.style.transform = 'scale(0.9)';
        setTimeout(() => btnStop.style.transform = '', 150);
        
        const meadowPals = meadow.querySelectorAll('.pal');
        meadowPals.forEach(p => p.classList.remove('bouncing'));

        if(window.stopPlayback) window.stopPlayback();
    });

    btnReset.addEventListener('click', () => {
        isPlaying = false;
        btnReset.style.transform = 'scale(0.9) rotate(360deg)';
        setTimeout(() => btnReset.style.transform = '', 300);
        
        if(window.stopPlayback) window.stopPlayback();

        const meadowPals = meadow.querySelectorAll('.pal');
        meadowPals.forEach(p => {
            p.animate([
                { transform: 'scale(1.2)', opacity: 1 },
                { transform: 'scale(0) rotate(180deg)', opacity: 0 }
            ], { duration: 400 }).onfinish = () => {
                p.remove();
            };
        });
    });

    // Drag Drop Core
    let activeDragElement = null;
    let dragOffsetX = 0; let dragOffsetY = 0; let isCloning = false;

    pals.forEach(pal => {
        pal.ondragstart = () => false;
        let startX, startY;

        pal.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            startX = e.clientX; startY = e.clientY;

            const rect = pal.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            activeDragElement = pal.cloneNode(true);
            activeDragElement.classList.add('dragging');
            activeDragElement.classList.remove('hidden'); 
            activeDragElement.style.position = 'fixed';
            activeDragElement.style.zIndex = '1000';
            activeDragElement.style.pointerEvents = 'none';
            activeDragElement.style.left = `${e.clientX - dragOffsetX}px`;
            activeDragElement.style.top = `${e.clientY - dragOffsetY}px`;
            activeDragElement.style.margin = '0';
            
            document.body.appendChild(activeDragElement);
            isCloning = true;
        });

        pal.addEventListener('click', e => {
            if (!startX) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx < 5 && dy < 5 && !isPlaying) {
                triggerSound(pal);
                pal.animate([
                    { transform: 'scale(1) translateY(0)' },
                    { transform: 'scale(1.1) translateY(-15px)' },
                    { transform: 'scale(1) translateY(0)' }
                ], { duration: 300 });
            }
        });
    });

    document.addEventListener('pointermove', (e) => {
        if (!activeDragElement) return;
        
        activeDragElement.style.left = `${e.clientX - dragOffsetX}px`;
        activeDragElement.style.top = `${e.clientY - dragOffsetY}px`;

        if (!isCloning) {
            const trashRect = trashMonster.getBoundingClientRect();
            if (e.clientX > trashRect.left && e.clientX < trashRect.right &&
                e.clientY > trashRect.top && e.clientY < trashRect.bottom) {
                trashMonster.classList.add('drag-over');
            } else {
                trashMonster.classList.remove('drag-over');
            }
        }
    });

    document.addEventListener('pointerup', (e) => {
        if (!activeDragElement) return;

        const trashRect = trashMonster.getBoundingClientRect();
        const overTrash = !isCloning && (
            e.clientX > trashRect.left && e.clientX < trashRect.right &&
            e.clientY > trashRect.top && e.clientY < trashRect.bottom
        );

        const meadowRect = meadow.getBoundingClientRect();
        const overMeadow = (
            e.clientX > meadowRect.left && e.clientX < meadowRect.right &&
            e.clientY > meadowRect.top && e.clientY < meadowRect.bottom
        );

        if (overTrash) {
            trashMonster.classList.remove('drag-over');
            const target = activeDragElement;
            activeDragElement = null;
            if(window.SoundEngine) window.SoundEngine.playTrash();
            target.style.pointerEvents = 'none';
            target.animate([
                { transform: 'scale(1.2)', opacity: 1 },
                { transform: 'scale(0)', opacity: 0 }
            ], { duration: 300 }).onfinish = () => target.remove();
        } else if (overMeadow) {
            const leftInMeadow = e.clientX - dragOffsetX - meadowRect.left;
            const topInMeadow = e.clientY - dragOffsetY - meadowRect.top;

            const droppedPal = activeDragElement;
            activeDragElement = null;

            droppedPal.remove();
            droppedPal.style.position = 'absolute';
            droppedPal.style.left = `${leftInMeadow}px`;
            droppedPal.style.top = `${topInMeadow}px`;
            droppedPal.style.pointerEvents = 'auto';
            droppedPal.style.zIndex = '10';
            meadow.appendChild(droppedPal);

            if (isCloning) {
                setupMeadowPal(droppedPal);
                if(window.SoundEngine) window.SoundEngine.playDrop();
                droppedPal.animate([
                    { transform: 'scale(0)' },
                    { transform: 'scale(1.4)' },
                    { transform: 'scale(1.2)' }
                ], { duration: 400, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });
                if (isPlaying) droppedPal.classList.add('bouncing');
            } else {
                droppedPal.style.transform = 'scale(1.2)';
            }
        } else {
            activeDragElement.remove();
            activeDragElement = null;
        }
        trashMonster.classList.remove('drag-over');
    });

    function setupMeadowPal(pal) {
        pal.ondragstart = () => false;
        let startX, startY;

        pal.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            const rect = pal.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;

            activeDragElement = pal;
            isCloning = false;
            
            activeDragElement.style.position = 'fixed';
            activeDragElement.style.zIndex = '1000';
            activeDragElement.style.pointerEvents = 'none';
            activeDragElement.style.left = `${e.clientX - dragOffsetX}px`;
            activeDragElement.style.top = `${e.clientY - dragOffsetY}px`;
            activeDragElement.style.margin = '0';
            activeDragElement.style.transform = 'scale(1.2)';
            
            document.body.appendChild(activeDragElement);
            startX = e.clientX; startY = e.clientY;
        });
        
        pal.addEventListener('click', e => {
            if (!startX) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx < 5 && dy < 5 && !isPlaying) {
                triggerSound(pal);
                pal.animate([
                    { transform: 'scale(1.2) translateY(0)' },
                    { transform: 'scale(1.2) translateY(-30px)' },
                    { transform: 'scale(1.2) translateY(0)' }
                ], { duration: 300 });
            }
        });
    }

    function triggerSound(pal) {
        if(!window.SoundEngine) return;
        const type = pal.getAttribute('data-type');
        if(type === 'woodpecker') window.SoundEngine.playWoodpecker();
        else if(type === 'elephant') window.SoundEngine.playElephant();
        else if(type === 'cloud') window.SoundEngine.playCloud();
        else if(type === 'frog') window.SoundEngine.playFrog();
        else if(type === 'star') window.SoundEngine.playStar();
        else if(type === 'cat') window.SoundEngine.playCat();
        else if(type === 'bee') window.SoundEngine.playBee();
        else if(type === 'monkey') window.SoundEngine.playMonkey();
        else if(type === 'owl') window.SoundEngine.playOwl();
        else if(type === 'duck') window.SoundEngine.playDuck();
        else if(type === 'cricket') window.SoundEngine.playCricket();
        else if(type === 'trumpet') window.SoundEngine.playTrumpet();
        else if(type === 'guitar') window.SoundEngine.playGuitar();
        else if(type === 'drum') window.SoundEngine.playDrum();
        else if(type === 'bongo') window.SoundEngine.playBongo();
        else if(type === 'flute') window.SoundEngine.playFlute();
        else if(type === 'accordion') window.SoundEngine.playAccordion();
        else if(type === 'whistle') window.SoundEngine.playWhistle();
        else if(type === 'bass') window.SoundEngine.playBass();
        else if(type === 'maracas') window.SoundEngine.playMaracas();
        else if(type === 'rain') window.SoundEngine.playRain();
        else if(type === 'wind') window.SoundEngine.playWind();
        else if(type === 'thunder') window.SoundEngine.playThunder();
        else if(type === 'campfire') window.SoundEngine.playCampfire();
        else if(type === 'ocean') window.SoundEngine.playOcean();
        else if(type === 'songbird') window.SoundEngine.playSongbird();
    }

    // PRESET SYMPHONIES
    const presets = {
    jungle: ['monkey', 'bongo', 'flute', 'rain', 'frog'],
    night: ['owl', 'cricket', 'cloud', 'star', 'wind'],
    rock: ['guitar', 'bass', 'drum', 'trumpet', 'cat']
};

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const meadow = document.getElementById('meadow');
        meadow.innerHTML = ''; // Clear the meadow for the new setup
        
        const presetKey = btn.getAttribute('data-preset');
        const items = presets[presetKey];
        
        items.forEach((type, index) => {
            // Find the original pal in the sidebar
            const originalPal = document.querySelector(`#sidebar .pal[data-type="${type}"]`);
            if(!originalPal) return;
            
            const clone = originalPal.cloneNode(true);
            clone.classList.remove('hidden');
            clone.style.position = 'absolute';
            
            // Scatter them evenly horizontally with slight random vertical variation
            const left = 15 + (index * 16) + (Math.random() * 5);
            const top = 30 + (Math.random() * 40);
            
            clone.style.left = left + '%';
            clone.style.top = top + '%';
            
            clone.style.pointerEvents = 'auto'; 
            clone.style.zIndex = '10';
            setupMeadowPal(clone);
            
            meadow.appendChild(clone);
        });
        
        // Auto-play the symphony to instantly demonstrate it!
        if(!isPlaying) {
            document.getElementById('btn-play').click();
        }
    });
});

// NEW FEATURES
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-night');
    if (document.body.classList.contains('theme-night')) {
        themeToggle.textContent = '☀️ Day Mode';
        themeToggle.style.background = '#F1C40F';
    } else {
        themeToggle.textContent = '🌙 Night Mode';
        themeToggle.style.background = '#2C3E50';
    }
});

const btnRecord = document.getElementById('btn-record');
btnRecord.addEventListener('click', () => {
    if (window.SoundEngine.isRecording) {
        window.SoundEngine.stopRecording();
        btnRecord.classList.remove('recording');
    } else {
        window.SoundEngine.startRecording();
        btnRecord.classList.add('recording');
        
        setTimeout(() => {
            if(window.SoundEngine.isRecording) {
                window.SoundEngine.stopRecording();
                btnRecord.classList.remove('recording');
            }
        }, 15000);
    }
});

});
