import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true, antialias: true});


var ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

var bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

var params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0,
    scene: "Scene Only" //"Scene with Glow"
};

var darkMaterial = new THREE.MeshPhongMaterial( { color: "black" } );
var materials = {};

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);


//** TEXTURES */

//const stars = new THREE.TextureLoader().load("/8k_stars_milky_way.jpg")
const earthTexture = new THREE.TextureLoader().load("./8k_earth_daymap.jpg");
const earthNormalTexture = new THREE.TextureLoader().load("./8k_earth_normal_map.tif")
const earthDisplaceTexture = new THREE.TextureLoader().load("./gebco_bathy.5400x2700_8bit.jpg")
const earthSpecTexture = new THREE.TextureLoader().load("./8k_earth_specular_map.tif")
const nightTexture = new THREE.TextureLoader().load("./8k_earth_nightmap.jpg")
const cloudsTexture = new THREE.TextureLoader().load("./8k_earth_clouds.jpg")

const sunTexture = new THREE.TextureLoader().load("./8k_sun.jpg")
const moonTexture = new THREE.TextureLoader().load("./8k_moon.jpg")

//** CONSTANTS (KM) */

const elevationScale = 0.5;
const sunDistance = 150000.000;
const earthRadius = 6.371
const moonRadius = 1.7374
const sunRadius = 696.340


//** EARTH */

const earthGeo = new THREE.SphereGeometry(earthRadius, 1000, 500);
const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture, 
    //normalMap: earthNormalTexture,
    normalScale: new THREE.Vector2(elevationScale, elevationScale), 
    displacementMap: earthDisplaceTexture, 
    displacementScale: elevationScale, 
    specularMap: earthSpecTexture,
    specular: 0xffffff,
    emissiveMap: nightTexture,
    emissive: 0x111111,
    emissiveIntensity: 40,
    shininess: 70,
 });

const earth = new THREE.Mesh(earthGeo, earthMat);
//earth.layers.enable(BLOOM_SCENE)
//earth.receiveShadow = true
//earth.castShadow = true

//** CLOUDS */

const cloudGeo = new THREE.SphereGeometry(earthRadius + elevationScale, 1000, 500)
const cloudMat = new THREE.MeshPhongMaterial({
    alphaMap: cloudsTexture,
    transparent: true,
    side: THREE.DoubleSide
})

const clouds = new THREE.Mesh(cloudGeo, cloudMat)
//clouds.castShadow = true

//** OCEAN */
/* 
const oGeometry = new THREE.SphereGeometry(earthRadius + elevationScale/2, 1000, 500);
const oMaterial = new THREE.MeshPhongMaterial({
    specular: 0x55aaff,
    specularMap: earthSpecTexture,
    color: 0x3399ff,
    shininess: 1,
    refractionRatio: 0.75
})
const ocean = new THREE.Mesh(oGeometry, oMaterial)
ocean.rotation.set(0.5, 0, 0)
ocean.receiveShadow = true */

//** SUN */

const sunGeo = new THREE.SphereGeometry(sunRadius)
const sunMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffff,
    emissiveIntensity: 500000,
    map: sunTexture
})
const sun = new THREE.Mesh(sunGeo, sunMat)
sun.position.set(-sunDistance, -sunDistance, sunDistance)

const sunlight = new THREE.DirectionalLight(0xffffff, 1);
//sunlight.castShadow = true;
sunlight.position.set(-sunDistance, -sunDistance, sunDistance)


scene.add(
    earth,
    //ocean,
    sunlight,
    sun,
    clouds
        //new THREE.AmbientLight()
);

//scene.fog = new THREE.Fog(0xcccccc)

camera.position.set(0, 0, earthRadius*(1+elevationScale+0.5));
controls.update();



const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const outputPass = new OutputPass();
//composer.addPass( outputPass );

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

var finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        //map: null,
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        defines: {
        }
    } ), "baseTexture"
);
finalPass.needsSwap = true;

var finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

window.onresize = function () {

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

    bloomComposer.setSize( width, height );
    finalComposer.setSize( width, height );

    render();

};


function render() {

    switch ( params.scene ) {

        case 'Scene only':
            renderer.render( scene, camera );
            break;
        case 'Glow only':
            renderBloom( false );
            break;
        case 'Scene with Glow':
        default:
            // render scene with bloom
            renderBloom( true );

            // render the entire scene, then render bloom scene on top
            finalComposer.render();
            break;

    }

}


function renderBloom( mask ) {

    if ( mask === true ) {

        scene.traverse( darkenNonBloomed );
        bloomComposer.render();
        scene.traverse( restoreMaterial );

    } else {

        camera.layers.set( BLOOM_SCENE );
        bloomComposer.render();
        camera.layers.set( ENTIRE_SCENE );

    }

}

function darkenNonBloomed( obj ) {

    if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;

    }

}

function restoreMaterial( obj ) {

    if ( materials[ obj.uuid ] ) {

        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];

    }

}

function animate() {
    requestAnimationFrame(animate)
    
    earth.rotation.y += 0.001;
    clouds.rotation.y += 0.001;
    render()
}
requestAnimationFrame(animate)
