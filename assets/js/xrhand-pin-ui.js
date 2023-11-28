// https://github.com/aframevr/aframe/blob/master/src/components/hand-tracking-controls.js

const JOINTS_LEN = 25;
const INDEX_TIP_INDEX = 9;
const THUMB_TIP_INDEX = 4;
const WRIST_INDEX = 0;

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
    this.thumbTipPosition = new THREE.Vector3();
    this.wristRotation = new THREE.Quaternion();

    this.hasPoses = false;
    this.jointPoses = new Float32Array(16 * JOINTS_LEN);
    this.jointRadii = new Float32Array(JOINTS_LEN);
    this.addSphere();
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
    this.indexSphere = document.createElement("a-sphere");
    this.indexSphere.setAttribute("radius", 0.01);
    this.indexSphere.setAttribute("color", "red");
    this.indexSphere.setAttribute("position", [100, 100, 100]);
    this.el.appendChild(this.indexSphere);

    this.thumbSphere = document.createElement("a-sphere");
    this.thumbSphere.setAttribute("radius", 0.01);
    this.thumbSphere.setAttribute("color", "green");
    this.thumbSphere.setAttribute("position", [100, 100, 100]);
    this.el.appendChild(this.thumbSphere);

    this.fingerLine = document.createElement("a-entity");
    this.fingerLine.setAttribute("line", {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: 0, z: 0 },
      color: "green",
    });
    this.el.appendChild(this.fingerLine);
  },
  updateSphere: function () {
    this.indexSphere.setAttribute("position", this.indexTipPosition);
    this.thumbSphere.setAttribute("position", this.thumbTipPosition);
    this.fingerLine.setAttribute("line", {
      start: this.indexTipPosition,
      end: this.thumbTipPosition,
    });
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
    // var indexTipPosition = this.handTrackingComponent.indexTipPosition;
    // var thumbTipPosition = this.thumbTipPosition;

    this.wristRotation.setFromRotationMatrix(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        WRIST_INDEX * 16
      )
    );

    this.indexTipPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        INDEX_TIP_INDEX * 16
      )
    );
    this.thumbTipPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        THUMB_TIP_INDEX * 16
      )
    );

    this.updateSphere();
  },
});
