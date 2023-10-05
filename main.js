/*
/* Base */

const canvas = document.querySelector('canvas.webgl');

/* Scene */

const scene = new THREE.Scene();

/* Overlay */

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
});

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/* Loaders */

const loadingBar = document.querySelector('.loading-bar');
const body =  document.querySelector('body');
const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            });
            loadingBar.classList.add('ended');
            body.classList.add('loaded');
            loadingBar.style.transform = '';
        }, 500);
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBar.style.transform = `scale(${progressRatio})`;
    },
    () => {
        console.error('error');
    }
);

/* GTFL Loader */

let donut = null;

const gltfLoader = new THREE.GLTFLoader(loadingManager);
gltfLoader.load(
    './assets/donut/scene.gltf',
    (gltf) => {
        console.log('Donut loaded successfully:', gltf);
        donut = gltf.scene;

        donut.position.x = 1.5;
        donut.rotation.x = Math.PI * 0.2;
        donut.rotation.z = Math.PI * 0.15;

        const radius = 8.5;
        donut.scale.set(radius, radius, radius);
        scene.add(donut);

        // Adicione aqui a inicialização do posicionamento e rotação
        gsap.set(donut.rotation, { z: transformDonut[currentSection].rotationZ });
        gsap.set(donut.position, { x: transformDonut[currentSection].positionX });
    }
);

/* Scroll */

const transformDonut = [
    {
        rotationZ: 0.45,
        positionX: 1.5
    }, {
        rotationZ: -0.45,
        positionX: -1.5
    }, {
        rotationZ: 0.0314,
        positionX: 0
    }
];

let scrollY = window.scrollY;
let currentSection = 0;

function updateDonutPosition() {
    if (donut) {
        gsap.to(
            donut.rotation, {
                duration: 1.5,
                ease: 'power2.inOut',
                z: transformDonut[currentSection].rotationZ
            }
        );
        gsap.to(
            donut.position, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: transformDonut[currentSection].positionX
            }
        );
    }
}

// Função para verificar a seção atual com base no scroll
function updateCurrentSection() {
    const newSection = Math.round(scrollY / window.innerHeight);
    
    if (newSection !== currentSection) {
        currentSection = newSection;
        updateDonutPosition();
    }
}

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    updateCurrentSection();
});

/* On Reload */

window.onbeforeunload = function() {
    window.scrollTo(0,0);
};

/* Sizes */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/* Camera */

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

/* Light */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1,2,0);
scene.add(directionalLight);

/* Renderer */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* Animate */

const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;

    if (donut) {
        donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1;
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();