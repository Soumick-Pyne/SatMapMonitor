const SCENE_SCALE = 1 / 1000; // 1 unit in our window = 1000 km

class Satellite {
  constructor(name, a, e, i, Ω, ω, ν, area, mass) {
      this.name = name;
      this.a = a;     // Semi-major axis (km)
      this.e = e;     // Eccentricity
      this.i = i;     // Inclination (radians)
      this.Ω = Ω;     // Right Ascension of the Ascending Node (radians)
      this.ω = ω;     // Argument of Perigee (radians)
      this.ν = ν;     // True Anomaly (radians)
      this.area = area; // Cross-sectional area (m^2)
      this.mass = mass; // Mass of the satellite (kg)
      
      this.position = new THREE.Vector3();
      this.velocity = new THREE.Vector3();
      this.mesh = this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(5 * SCENE_SCALE, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
  }

  updateState(state, dt) {
      // This method will be used by our numerical integrator
      const [a, e, i, Ω, ω, ν] = state;
      
      const µ = 398600.4418; // Earth's standard gravitational parameter (km^3/s^2)
      const J2 = 1.08262668e-3;
      const RE = 6378.137; // Earth's radius in km

      // J2 perturbation
      const p = a * (1 - e * e);
      const cosI = Math.cos(i);
      const J2Effect = 1.5 * J2 * Math.pow(RE / p, 2);
      
      const n = Math.sqrt(µ / Math.pow(a, 3));
      const dΩdt = -J2Effect * n * cosI;
      const dωdt = J2Effect * n * (2 - 2.5 * Math.pow(Math.sin(i), 2));
      const dνdt = n * (1 + J2Effect * Math.sqrt(1 - e * e) * (1.5 * Math.pow(cosI, 2) - 0.5));

      // Atmospheric drag (simple model)
      const h = a - RE;  // Height above Earth's surface
      const ρ = 1e-13 * Math.exp(-(h - 200) / 60);  // Approximate density at height h
      const v = Math.sqrt(µ / a);  // Circular orbit velocity
      const dragAccel = -0.5 * ρ * Math.pow(v, 2) * this.area / this.mass;
      const dadt = 2 * a * dragAccel / µ;

      return [
          dadt,
          0,  // de/dt = 0 (simplified)
          0,  // di/dt = 0 (simplified)
          dΩdt,
          dωdt,
          dνdt
      ];
  }

  rk4Step(state, dt) {
      const k1 = this.updateState(state, dt);
      const k2 = this.updateState(state.map((x, i) => x + k1[i] * dt / 2), dt);
      const k3 = this.updateState(state.map((x, i) => x + k2[i] * dt / 2), dt);
      const k4 = this.updateState(state.map((x, i) => x + k3[i] * dt), dt);

      return state.map((x, i) => x + (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) * dt / 6);
  }

  update(dt) {
      [this.a, this.e, this.i, this.Ω, this.ω, this.ν] = this.rk4Step([this.a, this.e, this.i, this.Ω, this.ω, this.ν], dt);

      // Calculate position and velocity
      const µ = 398600.4418;
      const p = this.a * (1 - this.e * this.e);
      const r = p / (1 + this.e * Math.cos(this.ν));

      const x = r * (Math.cos(this.Ω) * Math.cos(this.ω + this.ν) - Math.sin(this.Ω) * Math.sin(this.ω + this.ν) * Math.cos(this.i));
      const y = r * (Math.sin(this.Ω) * Math.cos(this.ω + this.ν) + Math.cos(this.Ω) * Math.sin(this.ω + this.ν) * Math.cos(this.i));
      const z = r * Math.sin(this.ω + this.ν) * Math.sin(this.i);

      this.position.set(x * SCENE_SCALE, z * SCENE_SCALE, -y * SCENE_SCALE);
      this.mesh.position.copy(this.position);
  }
}