//Global Variabes
let lastTime = 0;
let scene, camera, renderer, earth;
let satellites = [];
let simulationSpeedFactor = 1;

//Constants for mapping to real-world
const EARTH_RADIUS = 6371; //km
const EARTH_ROTATION_SPEED = 7.2921159e-5; // radians per second
const SCENE_SCALE = 1 / 1000; //1 unit in our window = 1000 km


function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000000);
    camera.position.set(0, 0, 4 * EARTH_RADIUS * SCENE_SCALE); //x=0, y=0, z = 4 earth radii away

    // Create renderer
    renderer = new THREE.WebGLRenderer({antialias: true}); //argument for smoother rendering
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Create Earth with texture
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS * SCENE_SCALE, 64, 64);
    const earthTexture = new THREE.TextureLoader().load('assets/earth_texture.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({map: earthTexture});
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    //Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(1, 0, 0).normalize();
    scene.add(sunLight);

    // Add Stars (background)
    addStars();

    // Create and add satellites
    //const sat1 = new Satellite("LEO-1", 7000, 0.001, Math.PI/4, 0, 0, 0, 10, 1000);
    //const sat2 = new Satellite("LEO-2", 7200, 0.001, Math.PI/3, Math.PI/2, 0, 0, 15, 1200);
    //satellites.push(sat1, sat2);
    //satellites.forEach(sat => scene.add(sat.mesh));

    // Initialize speed control
    initSpeedControl();

    // Start animation loop
    lastTime = performance.now(); //higher res than Date.now()
    animate(lastTime);
}


function animate(currentTime) {
    //currentTime is in milliseconds as given by requestAnimationFrame 
    requestAnimationFrame(animate);
    //This function tells the browser that you wish to perform an animation.
    //It requests that the browser call a specified function (here it is animate()) to update an animation before the next repaint.
    //The browser will call this function typically 60 times per second, but it will generally match the display refresh rate of the device.
    //When the browser calls our animate function, it automatically passes a single argument to it.
    //This argument is a DOMHighResTimeStamp, which represents the time when requestAnimationFrame started to execute callback functions.

    // Calculate time passed since last frame
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds
    lastTime = currentTime;
    // Apply simulation speed factor
    const scaledDeltaTime = deltaTime * simulationSpeedFactor;

    // Update satellites
    //satellites.forEach(sat => sat.update(scaledDeltaTime));

    // Rotate Earth
    //In Three.js rotation.y points upwards, x points to the right, z points to the viewer
    earth.rotation.y += EARTH_ROTATION_SPEED * scaledDeltaTime;

   // Update satellites (when we add them later)
   // satellites.forEach(sat => sat.update(scaledDeltaTime));

    // Render the scene
    renderer.render(scene, camera);
}


function initSpeedControl() {
    const slider = document.getElementById('speed-slider');
    const display = document.getElementById('speed-value');

    function formatNumber(num) {
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
        return num.toFixed(0);
    }

    function updateSpeed() {
        const minp = 0;
        const maxp = 100;
        const minv = Math.log(1);
        const maxv = Math.log(86400); // Max speed is now 1 day/s

        const scale = (maxv - minv) / (maxp - minp);
        simulationSpeedFactor = Math.exp(minv + scale * (slider.value - minp));
        
        let displaySpeed;
        if (simulationSpeedFactor < 60) {
            displaySpeed = formatNumber(simulationSpeedFactor) + 'x';
        } else if (simulationSpeedFactor < 3600) {
            displaySpeed = formatNumber(simulationSpeedFactor / 60) + ' min/s';
        } else {
            displaySpeed = formatNumber(simulationSpeedFactor / 3600) + ' h/s';
        }
        display.textContent = displaySpeed;

        // Update tooltip with exact value
        slider.title = simulationSpeedFactor.toFixed(2) + 'x';
    }

    slider.addEventListener('input', updateSpeed);
    slider.addEventListener('change', updateSpeed);

    // Initial update
    updateSpeed();
}

function addStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 1000; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000000 * SCENE_SCALE));
        star.position.set(x, y, z);
        scene.add(star);
    }
}

// Initialize the scene
init();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});