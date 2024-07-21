import { PaperScope } from "paper";

import { FileImporter } from "./FileImporter";
import { InfoLayer } from "./InfoLayer";
import { AudioInput } from "./AudioInput";

const PAPER = new PaperScope();

export class SonicScribble {
  constructor(canvas) {
    this.transparencyMode = false;
    this.freeze = false;
    this.idle = false;

    this.infoLayer = new InfoLayer();

    // -------

    this.canvas = canvas;
    this.importer = new FileImporter(this);
    this.audioInput = new AudioInput();

    PAPER.setup(this.canvas);
    this.scribbleTool = new PAPER.Tool();
    this.paths = [];
    this.path;

    this.middlePoint = new PAPER.Point(PAPER.view.size.divide(2));
    console.log(this.middlePoint);

    this.scribbleTool.onMouseDown = (e) => this.scribbleToolMouseDown(e);
    this.scribbleTool.onMouseDrag = (e) => this.scribbleToolMouseDrag(e);
    document.addEventListener("keydown", (e) => this.processKeyInput(e));

    this.soundWave = this.setupSoundWave();

    this.frameCount = 0;
  }

  update() {
    // console.log(this.path);
    if (!this.freeze) {
      this.frameCount++;
      this.audioInput.read();
      if (this.audioInput.dataArray) {
        const data = this.audioInput.dataArray;
        if (this.path) {
          const segments = this.path.segments;
          for (
            let i = segments.length - 1;
            i > segments.length - data.length && i >= 0;
            i--
          ) {
            let point = segments[i].point.clone();
            const starVector = point.subtract(this.middlePoint).normalize();
            segments[i].point = point.add(
              starVector.multiply(data[segments.length - 1 - i] * 0.1)
            );
          }
        }
        this.updateSoundWave(data);
      }
    }
  }

  resize(width, height) {}

  setViewMode(value) {
    this.freeze = value;
  }

  setTransparencyMode(value) {
    this.transparencyMode = value;
    this.soundWave.visible = value;
  }

  setIdleMode(value) {
    this.idle = value;
  }

  // --- INPUTS

  scribbleToolMouseDown(e) {
    this.path = new PAPER.Path();
    this.paths.push(this.path);
    this.path.strokeColor = "white";
    this.path.strokeWidth = 5;
    this.path.strokeCap = "round";
    this.path.add(e.point);
  }

  scribbleToolMouseDrag(e) {
    this.path.add(e.point);
  }

  processKeyInput(e) {
    if (e.code.includes("Digit")) {
      //apply filter
    } else if (e.code == "KeyX") {
      this.resetDrawing();
    }
  }

  // --- CUSTOM METHODS

  resetDrawing() {
    // PAPER.project.clear();
    this.paths.forEach((p) => p.remove());
    this.paths = [];
  }

  setupSoundWave() {
    const points = [];
    const height = PAPER.view.size.height / 2;
    const length = PAPER.view.size.width;
    const step = length / 512;
    for (let i = 0; i < length; i++) {
      points.push(new PAPER.Point(step * i, height));
    }
    const soundWave = new PAPER.Path(points);
    soundWave.strokeColor = "#00ff9e";
    return soundWave;
  }

  updateSoundWave(data) {
    const defaultHeight = PAPER.view.size.height / 2;
    const segments = this.soundWave.segments;
    segments.forEach((segment, i) => {
      segment.point.y = defaultHeight + data[i * 2];
    });
  }

  // --- FILE IMPORTS

  importGlTF(url) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        console.log("loaded gltf");
      },
      undefined,
      function (error) {
        console.log("could not load object");
        console.error(error);
        reject();
      }
    );
  }

  importImage(url) {
    this.textureLoader.load(
      url,
      (texture) => {
        console.log("loaded image");
      },
      undefined,
      function (error) {
        console.log("could not load texture");
        console.error(error);
        reject();
      }
    );
  }
}
