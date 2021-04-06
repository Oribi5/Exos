import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { OrbitControls } from 'three-orbit-controls'

@Component({
  selector: 'sketch',
  templateUrl: './sketch.component.html',
  styleUrls: ['./sketch.component.css']
})
export class SketchComponent implements OnInit {

  canvas: any;

  angle: number;

  constructor() {
    this.angle = 0;
  }

  getElement() {
    return document.querySelector("#sketch-holder") as any;
  }

  getElementDimensions() {
    let element = this.getElement();
    return { width: element.offsetWidth, height: element.offsetHeight }
  }

  ngOnInit(): void {

    let element = this.getElement();

    let width = element.offsetWidth,
      height = element.offsetHeight;

    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.position.z = 50;

    let render = new THREE.WebGL1Renderer({antialias: true});
    // render.setClearColor("#00ff00");
    render.setSize(width, height);
    
    element.appendChild( render.domElement );

    // const controls = new OrbitControls( camera, render.domElement );

    window.addEventListener('resize', () => {
      let {width, height} = this.getElementDimensions();
      render.setSize(width, height);
      camera.aspect = width/height;

      camera.updateProjectionMatrix();
    });

    const loader = new OBJLoader();

    let geometry = new THREE.BoxGeometry(10, 10 ,10);
    let material = new THREE.MeshLambertMaterial({color: 0xffffff});
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = -2;

    scene.add(mesh);

    let keyLight = new THREE.DirectionalLight(new THREE.Color('hwl(30, 100%, 75%'), 1.0);
    keyLight.position.set(-100, 0, 100);

    let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%'), 0.75);
    fillLight.position.set(100, 0, 100);

    let backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

    // let angle = 0;

    let animate = function() {

      // angle += 0.05;
      mesh.rotation.y += 0.02;

      requestAnimationFrame(animate);
      render.render(scene, camera);
    }

    animate();

    loader.load(
      // resource URL
      './assets/model/Final Asm - Forearm SubAsm-1 Spine-1.obj',
      // called when resource is loaded
      function ( object ) {
        console.log("Load complete");
        // object.traverse(function(child) {
        //   if (child instanceof THREE.Mesh) {
        //       child.material.color = 0xffb830;
        //   }
        // });
        // object.position.set(0, 0, -53);
        // object.materia
        scene.add( object );

      },
      // called when loading is in progresses
      ( xhr ) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
      // called when loading has errors
      ( error ) => console.log( 'An error happened' )
    );
    
  }


}
