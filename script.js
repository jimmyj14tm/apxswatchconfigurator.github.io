const colorMap = {
    'black': '#1a1a1a', 'blue_dark': '#1c2841', 'blue_light': '#7b9cbd', 
    'green': '#4f6c49', 'grey': '#8c8c8c', 'orange': '#f37022', 
    'pink': '#f1bac8', 'purple': '#624a87', 'tan': '#bc9c7c',
    'teal': '#3ebbb2', 'white': '#f5f5f5', 'yellow': '#fad620'
};
const colors = Object.keys(colorMap);

let currentStrap = 0;
let currentFace = 0;

function init() {
    const strapTrack = document.getElementById('strap-track');
    const faceTrack = document.getElementById('face-track');

    // Populate Images into tracks
    colors.forEach((color) => {
        const sImg = document.createElement('img');
        sImg.src = `images/strap_${color}.png`;
        strapTrack.appendChild(sImg);

        const fImg = document.createElement('img');
        fImg.src = `images/face_${color}.png`;
        faceTrack.appendChild(fImg);
    });

    initSwipe('face-zone', 'face-track', 'face');
    initSwipe('strap-zone', 'strap-track', 'strap');
    
    // Initial UI state
    updateVisuals('strap');
    updateVisuals('face');
}

// --- SELECTOR LOGIC ---
function changeColor(type, direction) {
    if (type === 'face') {
        currentFace = (currentFace + direction + colors.length) % colors.length;
    } else {
        currentStrap = (currentStrap + direction + colors.length) % colors.length;
    }
    updateVisuals(type);
}

function updateVisuals(type) {
    const index = type === 'face' ? currentFace : currentStrap;
    const colorKey = colors[index];
    
    // Update Watch Position
    const track = document.getElementById(`${type}-track`);
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    track.style.transform = `translateY(-50%) translateX(-${index * 100}%)`;
    
    // Update Selector UI
    const nameLabel = document.getElementById(`${type}-name`);
    const previewBox = document.getElementById(`${type}-preview`);
    
    nameLabel.innerText = colorKey.replace('_', ' ');
    previewBox.style.backgroundColor = colorMap[colorKey];
}

// --- SWIPE LOGIC (Maintained from original) ---
function initSwipe(zoneId, trackId, type) {
    const zone = document.getElementById(zoneId);
    const track = document.getElementById(trackId);
    let startX = 0, currentX = 0, isDragging = false;
    
    const dragStart = (e) => {
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        const diffPercent = (diff / track.offsetWidth) * 100;
        const baseOffset = type === 'face' ? -(currentFace * 100) : -(currentStrap * 100);
        track.style.transform = `translateY(-50%) translateX(${baseOffset + diffPercent}%)`;
    };
    
    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentX - startX;
        const threshold = track.offsetWidth * 0.15;
        if (Math.abs(diff) > threshold && currentX !== 0) {
            changeColor(type, diff < 0 ? 1 : -1);
        } else {
            updateVisuals(type);
        }
        currentX = 0;
    };

    zone.addEventListener('touchstart', dragStart, {passive: true});
    zone.addEventListener('touchmove', dragMove, {passive: false});
    zone.addEventListener('touchend', dragEnd);
    zone.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
}

function downloadWatch() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Use the dimensions of your viewport/images
    canvas.width = 800; 
    canvas.height = 800;

    const strapColor = colors[currentStrap];
    const faceColor = colors[currentFace];

    const strapImg = new Image();
    strapImg.crossOrigin = "anonymous";
    const faceImg = new Image();
    faceImg.crossOrigin = "anonymous";

    // Load strap first, then face, then trigger download
    strapImg.onload = () => {
        ctx.drawImage(strapImg, 0, 0, canvas.width, canvas.height);
        
        faceImg.onload = () => {
            ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);
            
            // Create a link and trigger the download
            const link = document.createElement('a');
            link.download = `royal-oak-${strapColor}-${faceColor}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        faceImg.src = `images/face_${faceColor}.png`;
    };
    strapImg.src = `images/strap_${strapColor}.png`;
}
window.onload = init;