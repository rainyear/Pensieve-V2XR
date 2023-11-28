// https://github.com/aframevr/aframe/blob/master/src/components/hand-tracking-controls.js

const JOINTS_LEN = 25;
const INDEX_TIP_INDEX = 9;
const THUMB_TIP_INDEX = 4;

AFRAME.registerComponent("xrhand-pin-ui", {
  schema: {
    hand: { default: "right", oneOf: ["left", "right"] },
  },
  init: function () {
    this.el.setAttribute("hand-tracking-controls", {
      hand: this.data.hand,
    });
    this.handTrackingComponent = this.el.components["hand-tracking-controls"];

    this.indexTipPosition = new THREE.Vector3();

    this.hasPoses = false;
    this.jointPoses = new Float32Array(16 * JOINTS_LEN);
    this.jointRadii = new Float32Array(JOINTS_LEN);
    this.indexSpere = this.addSphere();
  },

  tick: function () {
    var sceneEl = this.el.sceneEl;
    var controller =
      this.el.components["tracked-controls"] &&
      this.el.components["tracked-controls"].controller;
    var frame = sceneEl.frame;
    var trackedControlsWebXR = this.el.components["tracked-controls-webxr"];
    var referenceSpace = this.handTrackingComponent.referenceSpace;
    if (!controller || !frame || !referenceSpace || !trackedControlsWebXR) {
      console.log("missing webxr infos");
      return;
    }
    if (controller.hand) {
      this.detectGesture();
    }
  },
  addSphere: function () {
    var sphere = document.createElement("a-sphere");
    sphere.setAttribute("radius", 0.01);
    sphere.setAttribute("color", "red");
    sphere.setAttribute("position", [100, 100, 100]);
    this.el.appendChild(sphere);
    return sphere;
  },
  updateSphere: function (position) {
    this.indexSpere.setAttribute("position", position);
  },
  detectGesture: function () {
    this.detectLookingAtHand();
  },
  detectLookingAtHand: function () {
    if (!this.handTrackingComponent.hasPoses) {
      console.log("no poses");
      return;
    }

    var jointPose = new THREE.Matrix4();
    var indexTipPosition = this.handTrackingComponent.indexTipPosition;
    var thumbTipPosition = new THREE.Vector3();

    indexTipPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        INDEX_TIP_INDEX * 16
      )
    );
    thumbTipPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        THUMB_TIP_INDEX * 16
      )
    );

    this.updateSphere(thumbTipPosition);
  },
});
