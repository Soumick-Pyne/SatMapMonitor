let scene, camera, renderer, earth;

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Create Earth with texture
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const texture = new THREE.TextureLoader().load('assets/earth_texture.jpg');
    const material = new THREE.MeshPhongMaterial({ map: texture });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Add directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    // Add Stars
    addStars();

    //Add Satellite
    satellite = new Satellite(2);
    scene.add(satellite.mesh);

    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.005;
    satellite.update();
    renderer.render(scene, camera);
}

function addStars() {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 1000; i++) {
      const star = new THREE.Mesh(geometry, material);
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
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