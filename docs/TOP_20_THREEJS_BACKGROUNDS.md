# Top 40 Three.js Hero Background Options

Short reference guide for Three.js backgrounds suitable for hero sections.

**Last Updated:** 2025-01-30

---

## 1. Rotating Particles
**Description:** Thousands of particles rotating in 3D space. Simple, elegant, and performant. Perfect for tech/startup themes.

---

## 2. Particle Swarm (Boids/Flocking)
**Description:** Organic flocking behavior with particles that move like bird flocks. Reacts to mouse movement and forms natural clusters. Dynamic and interactive.

---

## 3. Floating Geometric Shapes
**Description:** Wireframe icosahedrons, octahedrons, or tetrahedrons floating and rotating in space. Clean, modern aesthetic.

---

## 4. Torus Grid with Parallax
**Description:** Grid of torus shapes arranged in a pattern. Scroll-based parallax creates depth. Great for portfolio/projects pages.

---

## 5. Particle Rain
**Description:** Particles falling from top to bottom with slight horizontal drift. Can include glow, trails, or fade effects. Good for tech/data themes.

---

## 6. Starfield
**Description:** Dense field of small particles creating a starry night effect. Can include twinkling animation. Classic space theme.

---

## 7. Wave Grid
**Description:** Grid of geometric shapes animated with sine waves. Creates flowing, organic movement patterns. Smooth and mesmerizing.

---

## 8. Nebula Clouds
**Description:** Large, glowing particles with color gradients creating nebula-like formations. Atmospheric and dreamy. Perfect for creative portfolios.

---

## 9. Connected Particles (Constellation)
**Description:** Particles connected by lines, forming constellation-like patterns. Interactive - lines appear/disappear based on distance. Network/data visualization feel.

---

## 10. Geometric Prisms
**Description:** Rotating triangular prisms or pyramids with glass-like materials. Refractive and reflective surfaces. Premium, sophisticated look.

---

## 11. Particle Explosion
**Description:** Particles radiating outward from center points. Can be continuous or triggered. Dynamic and energetic. Good for action/tech themes.

---

## 12. Liquid Morphing Blobs
**Description:** Smooth, organic blob shapes that morph and flow. Uses metaballs or marching squares algorithm. Fluid and modern aesthetic.

---

## 13. Wireframe Globe
**Description:** 3D wireframe sphere or globe rotating slowly. Can include latitude/longitude lines. Geographic or global themes.

---

## 14. Particle Vortex
**Description:** Particles spiraling inward or outward in a vortex pattern. Hypnotic, swirling motion. Great for abstract/creative sites.

---

## 15. Animated Grid Lines
**Description:** 3D grid lines that pulse, wave, or animate. Can respond to scroll or mouse. Tech/cyber aesthetic.

---

## 16. Particle Trails
**Description:** Particles leaving trails behind as they move. Creates flowing, ribbon-like effects. Dynamic and fluid motion.

---

## 17. Geometric Kaleidoscope
**Description:** Symmetrical geometric patterns that rotate and morph. Creates kaleidoscope-like visual effects. Artistic and mesmerizing.

---

## 18. Particle Fountain
**Description:** Particles rising from bottom like a fountain, then falling back down. Can include gravity and bounce effects. Playful and dynamic.

---

## 19. Shader-Based Noise
**Description:** Procedural noise shader creating organic, flowing patterns. GPU-accelerated, very performant. Abstract and modern.

---

## 20. Particle Orbits
**Description:** Particles orbiting around central points in elliptical paths using proper orbital mechanics (Kepler's laws). Particles move faster when closer to center (periapsis) and slower when farther (apoapsis). Includes 3D inclination for visual depth. Creates realistic solar system-like effects. Scientific or space themes.

---

## 21. DNA Helix
**Description:** Double helix structure with particles spiraling along two intertwined paths. Scientific and elegant. Perfect for biotech/medical themes.

---

## 22. Particle Chains
**Description:** Particles connected in chains that flow and undulate. Creates organic, snake-like movement patterns. Dynamic and fluid.

---

## 23. Magnetic Field Lines
**Description:** Curved field lines representing magnetic dipole fields. Uses Runge-Kutta numerical integration to trace field lines following proper magnetic field equations. Field lines form closed loops from north to south pole, creating elegant, scientifically accurate visualizations. Physics/tech themes.

---

## 24. Plasma Waves
**Description:** Animated wave patterns with glowing particles. Creates plasma-like flowing effects. Energetic and dynamic. Great for tech/energy themes.

---

## 25. Fractal Trees
**Description:** Recursive tree structures that branch and grow. Creates organic, natural patterns. Perfect for nature/growth themes.

---

## 26. Particle Clouds
**Description:** Soft, billowing cloud formations made of particles. Atmospheric and dreamy. Creates gentle, flowing visual effects.

---

## 27. Animated Ribbons
**Description:** Flowing ribbon shapes that twist and turn in 3D space. Elegant and smooth. Perfect for creative/artistic portfolios.

---

## 28. Crystal Formations
**Description:** Geometric crystal structures that grow and morph. Creates sparkling, refractive effects. Premium and sophisticated.

---

## 29. Particle Streams
**Description:** Flowing streams of particles that converge and diverge. Creates river-like or energy flow effects. Dynamic and mesmerizing.

---

## 30. Hexagonal Grid
**Description:** Animated hexagonal grid pattern with particles at vertices. Modern, tech aesthetic. Great for gaming/tech themes.

---

## 31. Particle Waves
**Description:** Wave-based particle motion creating ocean-like or sound wave effects. Smooth and rhythmic. Perfect for audio/water themes.

---

## 32. Spiral Galaxy
**Description:** Galaxy spiral arms with particles following spiral paths. Creates cosmic, astronomical effects. Space/science themes.

---

## 33. Particle Mesh
**Description:** Interconnected mesh of particles forming dynamic networks. Creates web-like or neural network visualizations. Tech/data themes.

---

## 34. Animated Tubes
**Description:** Flowing tube structures that morph and connect. Creates tunnel or pipeline effects. Modern and futuristic.

---

## 35. Particle Fields
**Description:** Field-based particle motion with forces affecting particle movement. Creates physics-based, scientific visualizations.

---

## 36. Geometric Mandala
**Description:** Rotating mandala pattern with symmetrical geometric shapes. Creates meditative, artistic effects. Spiritual/artistic themes.

---

## 37. Particle Rings
**Description:** Concentric particle rings that pulse and expand. Creates ripple or energy wave effects. Dynamic and hypnotic.

---

## 38. Animated Spheres
**Description:** Morphing spheres that grow, shrink, and merge. Creates organic, bubble-like effects. Playful and modern.

---

## 39. Particle Swirls
**Description:** Swirling particle patterns with multiple vortices. Creates abstract, artistic effects. Creative and mesmerizing.

---

## 40. Procedural Terrain
**Description:** 3D terrain generation with height maps and procedural noise. Creates landscape or topographic effects. Nature/exploration themes.

---

## Implementation Notes

- All backgrounds should follow the existing pattern in `js/core/three-hero.js`
- Use `BufferGeometry` and `PointsMaterial` for particle systems (best performance)
- Implement pause/resume functionality for performance optimization
- Disable on mobile devices for better performance
- Use `requestAnimationFrame` for smooth animations
- Consider using spatial grids or instancing for large particle counts

---

**See Also:**
- `docs/HERO_BACKGROUND_OPTIONS.md` - Detailed implementation guides
- `docs/HERO_SECTIONS_DOCUMENTATION.md` - Current implementations

