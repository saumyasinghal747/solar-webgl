import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );


//const stars = new THREE.TextureLoader().load("/8k_stars_milky_way.jpg")

const earthTexture = new THREE.TextureLoader().load("/8k_earth_daymap.jpg") ;
const earthNormalTexture = new THREE.TextureLoader().load("/8k_earth_normal_map.tif")
const earthDisplaceTexture = new THREE.TextureLoader().load("/gebco_bathy.5400x2700_8bit.jpg")
const earthSpecTexture = new THREE.TextureLoader().load("/8k_earth_specular_map.tif")

const geometry = new THREE.SphereGeometry(1, 1000, 1000);
const material = new THREE.MeshPhongMaterial( { map: earthTexture, normalMap: earthNormalTexture, displacementMap: earthDisplaceTexture, displacementScale: 0.01, specularMap: earthSpecTexture } );
const earth = new THREE.Mesh( geometry, material );
earth.rotation.set(0.5, 0, 0)

const sun = new THREE.PointLight( 0xffffff, 100 );
sun.position.set(-2, -2, 2)

scene.add( earth, sun );

camera.position.set(0,0,2);
controls.update();
function animate() {
    //earth.rotation.x += 0.000001;
    //earth.rotation.y += 0.001;
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );