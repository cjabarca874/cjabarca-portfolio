import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-logo-motion', standalone: true,
  templateUrl: './logo-motion.component.html', styleUrl: './logo-motion.component.scss',
})
export class LogoMotionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('stage', { static: true }) stageRef!: ElementRef<HTMLElement>;
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() available = new EventEmitter<boolean>();
  private cleanup = () => {};
  private update = (_progress: number) => {};
  setProgress(progress: number): void { this.update(progress); }

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const section = this.sectionRef.nativeElement;
      const stage = this.stageRef.nativeElement;
      const video = this.videoRef.nativeElement;
      const canvas = this.canvasRef.nativeElement;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let renderer: THREE.WebGLRenderer | undefined;
      let texture: THREE.VideoTexture | undefined;
      let material: THREE.MeshBasicMaterial | undefined;
      let geometry: THREE.PlaneGeometry | undefined;

      let resize: ResizeObserver | undefined;
      let frame = 0;
      let progress = 0;
      let disposed = false;
      let scene: THREE.Scene;
      let camera: THREE.OrthographicCamera;
      let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        const wasActive = !!renderer;
        resize?.disconnect(); resize = undefined;
        texture?.dispose(); texture = undefined;
        material?.dispose(); material = undefined;
        geometry?.dispose(); geometry = undefined;
        renderer?.dispose(); renderer = undefined;
        section.classList.remove('is-enhanced', 'has-frame');
        if (wasActive && !disposed) this.available.emit(false);
        video.controls = false;
      };
      const render = () => {
        if (!renderer || disposed) return;
        if (video.readyState >= 2 && texture) texture.needsUpdate = true;
        // Fill the viewport without exposing the edges of a floating panel.
        plane.scale.setScalar(1.02 + Math.pow(Math.max(0, (progress - 0.45) / 0.55), 2) * 4);
        renderer.render(scene, camera);
      };
      // Coalesce updates and wait for a seek to finish before starting another.
      const seek = () => {
        frame = 0;
        if (!renderer || video.seeking || !Number.isFinite(video.duration)) return;
        const target = Math.min(1, progress / 0.75) * Math.max(0, video.duration - 0.04);
        if (Math.abs(video.currentTime - target) > 0.035) video.currentTime = target;
        render();
      };
      const scheduleSeek = () => { if (!frame) frame = requestAnimationFrame(seek); };
      this.update = value => { progress = Math.min(1, Math.max(0, value)); render(); scheduleSeek(); };
      const onSeeked = () => {
        if (!renderer) return;
        render();
        if (video.readyState >= 2) section.classList.add('has-frame');
        scheduleSeek();
      };
      const start = () => {
        if (disposed || motion.matches || renderer || !video.videoWidth || !Number.isFinite(video.duration)) return;
        try {
          renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          scene = new THREE.Scene();
          camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
          camera.position.z = 3;
          texture = new THREE.VideoTexture(video);
          texture.colorSpace = THREE.SRGBColorSpace;
          geometry = new THREE.PlaneGeometry(video.videoWidth / video.videoHeight, 1);
          material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide });
          plane = new THREE.Mesh(geometry, material);
          scene.add(plane);
          video.pause();
          video.controls = false;
          section.classList.add('is-enhanced');
          const fit = () => {
            if (!renderer) return;
            const width = stage.clientWidth;
            const height = Math.max(1, stage.clientHeight);
            const aspect = width / height;
            const viewHeight = Math.min(1, (video.videoWidth / video.videoHeight) / aspect);
            camera.left = -viewHeight * aspect / 2;
            camera.right = viewHeight * aspect / 2;
            camera.top = viewHeight / 2;
            camera.bottom = -viewHeight / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            render();
          };
          resize = new ResizeObserver(fit);
          resize.observe(stage);
          fit();
          onSeeked();
          this.available.emit(true);
        } catch {
          stop();
        }
      };
      const onMotionChange = () => {
        stop();
        if (!motion.matches) start();

      };
      const onError = () => { stop(); };
      const onContextLost = (event: Event) => { event.preventDefault(); onError(); };
      video.addEventListener('loadeddata', start);
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
      canvas.addEventListener('webglcontextlost', onContextLost);
      motion.addEventListener('change', onMotionChange);
      if (video.readyState >= 2) start();
      this.cleanup = () => {
        disposed = true;
        this.update = () => {};
        video.removeEventListener('loadeddata', start);
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        motion.removeEventListener('change', onMotionChange);
        stop();
        video.pause();
      };
    });
  }

  ngOnDestroy(): void { this.cleanup(); }
}

