const colorMap = {
    'blue_dark': '#1c2841', 'blue_light': '#7b9cbd', 'green': '#4f6c49',
    'pink': '#f1bac8', 'yellow': '#fad620', 'orange': '#f37022',
    'teal': '#3ebbb2', 'purple': '#624a87', 'tan': '#bc9c7c',
    'black': '#1a1a1a', 'white': '#f5f5f5', 'grey': '#8c8c8c'
};
const colors = Object.keys(colorMap);

let currentStrap = 0;
let currentFace = 0;

function init() {
    const strapTrack = document.getElementById('strap-track');
    const faceTrack = document.getElementById('face-track');
    const strapSwatches = document.getElementById('strap-swatches');
    const faceSwatches = document.getElementById('face-swatches');

    colors.forEach((color, index) => {
        // 1. Populate Images
        const sImg = document.createElement('img');
        sImg.src = `images/strap_${color}.png`;
        strapTrack.appendChild(sImg);

        const fImg = document.createElement('img');
        fImg.src = `images/face_${color}.png`;
        faceTrack.appendChild(fImg);

        // 2. Populate UI Swatches
        const sDot = document.createElement('div');
        sDot.className = `color-swatch ${index === 0 ? 'active' : ''}`;
        sDot.style.backgroundColor = colorMap[color];
        sDot.onclick = () => jumpTo('strap', index);
        strapSwatches.appendChild(sDot);

        const fDot = document.createElement('div');
        fDot.className = `color-swatch ${index === 0 ? 'active' : ''}`;
        fDot.style.backgroundColor = colorMap[color];
        fDot.onclick = () => jumpTo('face', index);
        faceSwatches.appendChild(fDot);
    });

    // Initialize Swipe Handlers
    initSwipe('face-zone', 'face-track', 'face');
    initSwipe('strap-zone', 'strap-track', 'strap');
}

// --- SWIPE LOGIC ---
function initSwipe(zoneId, trackId, type) {
    const zone = document.getElementById(zoneId);
    const track = document.getElementById(trackId);
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const dragStart = (e) => {
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none'; // Snap instantly to finger
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Only prevent default if scrolling horizontally to avoid breaking page scroll
        if (Math.abs(diff) > 10) e.preventDefault(); 
        
        const diffPercent = (diff / track.offsetWidth) * 100;
        const baseOffset = type === 'face' ? -(currentFace * 100) : -(currentStrap * 100);
        
        track.style.transform = `translateY(-50%) translateX(${baseOffset + diffPercent}%)`;
    };
    
    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        const threshold = track.offsetWidth * 0.15; // Requires 15% drag to trigger slide
        
        if (Math.abs(diff) > threshold && currentX !== 0) {
            if (diff < 0) { // Swiped Left -> Next
                if (type === 'face') currentFace = Math.min(currentFace + 1, colors.length - 1);
                else currentStrap = Math.min(currentStrap + 1, colors.length - 1);
            } else { // Swiped Right -> Prev
                if (type === 'face') currentFace = Math.max(currentFace - 1, 0);
                else currentStrap = Math.max(currentStrap - 1, 0);
            }
        }
        
        // Reset currentX to prevent bug on next tap
        currentX = 0; 
        updateVisuals(type);
    };

    // Attach Mobile + Desktop events
    zone.addEventListener('touchstart', dragStart, {passive: true});
    zone.addEventListener('touchmove', dragMove, {passive: false});
    zone.addEventListener('touchend', dragEnd);
    
    zone.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove); // Window captures fast mouse exits
    window.addEventListener('mouseup', dragEnd);
}

// --- VISUAL UPDATES ---
function jumpTo(type, index) {
    if (type === 'face') currentFace = index;
    else currentStrap = index;
    updateVisuals(type);
}

function updateVisuals(type) {
    const track = document.getElementById(`${type}-track`);
    const index = type === 'face' ? currentFace : currentStrap;
    
    // Smooth slide animation
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    track.style.transform = `translateY(-50%) translateX(-${index * 100}%)`;
    
    // Update Dots
    const swatches = document.getElementById(`${type}-swatches`).children;
    for(let i = 0; i < swatches.length; i++) {
        if (i === index) swatches[i].classList.add('active');
        else swatches[i].classList.remove('active');
    }
}

window.onload = init;