class Satellite {
    constructor(radius = 2, speed = 0.001) {
      this.radius = radius;
      this.speed = speed;
      this.angle = 0;
      this.mesh = this.createMesh();
    }
  
    createMesh() {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      return new THREE.Mesh(geometry, material);
    }
  
    update() {
      this.angle += this.speed;
      this.mesh.position.x = this.radius * Math.cos(this.angle);
      this.mesh.position.z = this.radius * Math.sin(this.angle);
    }
}