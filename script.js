import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  /* TEXT */
  const hedline1 = new SplitText(".headline-1 h2", {
    type: "chars",
    charsClass: "char",
  });

  const title = new SplitText(".tooltip-title h3", {
    type: "lines",
    linesClass: "line",
  });

  const description = new SplitText(".tooltip-description p", {
    type: "lines",
    linesClass: "line",
  });

  hedline1.chars.forEach(
    (char) => (char.innerHTML = `<span>${char.innerHTML}</span>`),
  );

  [...title.lines, ...description.lines].forEach(
    (line) => (line.innerHTML = `<span>${line.innerHTML}</span>`),
  );

  const animationOptions = {
    duration: 1,
    ease: "power3.out",
    stagger: 0.025,
  };

  const tooltipElements = [
    ".tooltip .tooltip-icon svg",
    ".tooltip .tooltip-title .line > span",
    ".tooltip .tooltip-description .line > span",
  ];

  gsap.set(tooltipElements, {
    y: "125%",
  });

  ScrollTrigger.create({
    trigger: ".overview",
    start: "75% bottom",
    onEnter: () => {
      gsap.to(".headline-1 h2 .char > span", {
        y: "0%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025,
      });
    },
    onLeaveBack: () => {
      gsap.to(".headline-1 h2 .char > span", {
        y: "100%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025,
      });
    },
  });

  /* THREE */
  let model;
  let modelSize;
  let currentRotation = 0;

  let tooltipsVisible = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.querySelector(".model-container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(1, 2, 3);
  mainLight.castShadow = true;
  mainLight.shadow.bias = -0.001;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-2, 0, -2);
  scene.add(fillLight);

  function setupModel() {
    if (!model || !modelSize) return;

    const isMobile = window.innerWidth < 1000;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    model.position.set(
      isMobile ? center.x + modelSize.x * 1 : -center.x - modelSize.x * 0.4,
      -center.y + modelSize.y * 0.085,
      -center.z,
    );
    model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(-25);

    const cameraDistance = isMobile ? 2 : 1.25;
    camera.position.set(
      0,
      0,
      Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance,
    );
    camera.lookAt(0, 0, 0);
  }

  const loader = new GLTFLoader();
  loader.load(
    "./models/water-flask.glb",
    (gltf) => {
      model = gltf.scene;

      model.traverse((node) => {
        if (node.isMesh && node.material) {
          Object.assign(node.material, {
            metalness: 0.05,
            roughness: 0.9,
          });
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      modelSize = size;

      scene.add(model);

      setupModel();
    },
    undefined,
    (error) => {
      console.error("Ошибка загрузки модели:", error);
    },
  );

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    setupModel();

    ScrollTrigger.refresh();
  });

  /* SCROLL ANIMATION */
  ScrollTrigger.create({
    trigger: ".overview",
    start: "top top",
    end: `+=${window.innerHeight * 5}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: ({ progress }) => {
      /* HEADLINE 1 */
      const headline1Progress = Math.min(
        Math.max((progress - 0.05) / (0.35 - 0.05), 0),
        1,
      );
      gsap.set(".headline-1", {
        xPercent: -100 * headline1Progress,
      });

      /* MASK */
      const maskProgress = Math.min(
        Math.max((progress - 0.2) / (0.32 - 0.2), 0),
        1,
      );

      gsap.set(".circular-mask", {
        clipPath: `circle(${maskProgress * 100}% at 50% 50%)`,
      });

      /* HEADLINE 2 */
      const headline2Start = 0.15;
      const headline2End = 0.72;

      const headline2Progress = Math.min(
        Math.max(
          (progress - headline2Start) / (headline2End - headline2Start),
          0,
        ),
        1,
      );

      gsap.set(".headline-2", {
        xPercent: 100 - 300 * headline2Progress,
      });

      /* DIVIDER */
      const dividerProgress = Math.min(
        Math.max((progress - 0.45) / (0.65 - 0.45), 0),
        1,
      );

      gsap.set(".tooltip-divider", {
        scaleX: dividerProgress,
      });

      /* TOOLTIPS */

      const shouldShowTooltips = progress >= 0.65;

      if (shouldShowTooltips !== tooltipsVisible) {
        tooltipsVisible = shouldShowTooltips;

        gsap.to(tooltipElements, {
          y: tooltipsVisible ? "0%" : "125%",
          ...animationOptions,
        });
      }

      /* MODEL ROTATION */
      if (model && progress >= 0.05) {
        const rotationProgress = (progress - 0.05) / 0.95;
        const turns = 2;
        const targetRotation = Math.PI * 2 * turns * rotationProgress;
        const rotationDiff = targetRotation - currentRotation;

        if (Math.abs(rotationDiff) > 0.001) {
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff);
          currentRotation = targetRotation;
        }
      }
    },
  });
});
