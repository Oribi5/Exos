import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

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
    camera.position.z = 5;

    let render = new THREE.WebGL1Renderer({antialias: true});
    render.setClearColor("#e5e5e5");
    render.setSize(width, height);
    
    element.appendChild( render.domElement );

    window.addEventListener('resize', () => {
      let {width, height} = this.getElementDimensions();
      render.setSize(width, height);
      camera.aspect = width/height;

      camera.updateProjectionMatrix();
    });

    let geometry = new THREE.BoxGeometry(1, 1 ,1);
    let material = new THREE.MeshLambertMaterial({color: 0xFFCC00});
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = -2;

    scene.add(mesh);

    let light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    // let angle = 0;

    let animate = function() {

      // angle += 0.05;
      mesh.rotation.y += 0.05;

      requestAnimationFrame(animate);
      render.render(scene, camera);
    }

    animate();
    
  }


}
