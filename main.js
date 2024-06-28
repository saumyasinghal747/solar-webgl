import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );


//const stars = new THREE.TextureLoader().load("/8k_stars_milky_way.jpg")


//** TEXTURES */

//const stars = new THREE.TextureLoader().load("/8k_stars_milky_way.jpg")
const earthTexture = new THREE.TextureLoader().load("/8k_earth_daymap.jpg");
const earthNormalTexture = new THREE.TextureLoader().load("/8k_earth_normal_map.tif")
const earthDisplaceTexture = new THREE.TextureLoader().load("/gebco_bathy.5400x2700_8bit.jpg")
const earthSpecTexture = new THREE.TextureLoader().load("/8k_earth_specular_map.tif")
const nightTexture = new THREE.TextureLoader().load("/8k_earth_nightmap.jpg")
const cloudsTexture = new THREE.TextureLoader().load("/8k_earth_clouds.jpg")

const sunTexture = new THREE.TextureLoader().load("/8k_sun.jpg")
const moonTexture = new THREE.TextureLoader().load("/8k_moon.jpg")

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
earth.layers.enable(BLOOM_SCENE)
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

const sunlight = new THREE.DirectionalLight(0xffffff, 0.7);
//sunlight.castShadow = true;
sunlight.position.set(-sunDistance, -sunDistance, sunDistance)


scene.add(
    earth,
    //ocean,
    sunlight,
    sun,
    //clouds
        //new THREE.AmbientLight()
);

//scene.fog = new THREE.Fog(0xcccccc)

camera.position.set(0, 0, earthRadius*(1+elevationScale+0.5));
controls.update();
function animate() {
    requestAnimationFrame(animate)
    //earth.rotation.x += 0.000001;
    //earth.rotation.y += 0.001;
	renderer.render( scene, camera );
}
requestAnimationFrame(animate)