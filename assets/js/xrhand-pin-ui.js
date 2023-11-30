// https://github.com/aframevr/aframe/blob/master/src/components/hand-tracking-controls.js

const JOINTS_LEN = 25;
const INDEX_TIP_INDEX = 9;
const THUMB_TIP_INDEX = 4;
const MIDDLE_TIP_INDEX = 14;
const WRIST_INDEX = 10;

AFRAME.registerComponent("xrhand-pin-ui", {
  schema: {
    hand: { default: "right", oneOf: ["left", "right"] },
  },
  init: function () {
    this.el.setAttribute("hand-tracking-controls", {
      hand: this.data.hand,
    });
    this.handTrackingComponent = this.el.components["hand-tracking-controls"];

    this.cameraEl = document.querySelector("[camera]");

    this.indexTipPosition = new THREE.Vector3();
    this.thumbTipPosition = new THREE.Vector3();
    this.wristPosition = new THREE.Vector3();
    this.wristRotation = new THREE.Quaternion();

    this.hasPoses = false;
    this.jointPoses = new Float32Array(16 * JOINTS_LEN);
    this.jointRadii = new Float32Array(JOINTS_LEN);
    this.addSphere();

    console.log(this.el.children);
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
      return;
    }
    if (controller.hand) {
      if (this.handTrackingComponent.mesh) {
        console.log(this.handTrackingComponent.skinnedMesh);
        this.handTrackingComponent.skinnedMesh.material.transparent = true;
        this.handTrackingComponent.skinnedMesh.material.opacity = 0;
        // this.handTrackingComponent.mesh.visible = false;
        // this.handTrackingComponent.el.object3D.= false;
      }
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

    this.wristCyliner = document.createElement("a-plane");
    this.wristCyliner.setAttribute("width", 0.1);
    this.wristCyliner.setAttribute("height", 0.2);
    this.wristCyliner.setAttribute("color", "white");
    this.wristCyliner.setAttribute("material", {
      transparent: true,
      opacity: 0.75,
    });
    this.wristCyliner.setAttribute("position", [100, 100, 100]);
    this.el.appendChild(this.wristCyliner);

    this.fingerLine = document.createElement("a-entity");
    this.fingerLine.setAttribute("line", {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: 0, z: 0 },
      color: "white",
      opacity: 0.5,
    });
    this.el.appendChild(this.fingerLine);
  },
  updateSphere: function () {
    // console.log(this.indexTipPosition);

    this.indexSphere.setAttribute("position", this.indexTipPosition);
    this.thumbSphere.setAttribute("position", this.thumbTipPosition);
    this.wristCyliner.setAttribute("position", {
      x: this.wristPosition.x,
      y: this.wristPosition.y,
      z: this.wristPosition.z,
    });

    var q2 = new THREE.Quaternion();
    q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    var q3 = this.wristRotation.multiply(q2);

    this.wristCyliner.object3D.quaternion.copy(q3);

    var distance = 0.05; // 平移距离

    var direction = new THREE.Vector3(0, 0, 1); // 默认朝向向量
    direction.applyQuaternion(q3); // 将四元数转换为方向向量

    var offset = direction.multiplyScalar(distance); // 计算平移向量
    this.wristCyliner.object3D.position.add(offset);

    let camPos = this.cameraEl.getAttribute("position");

    this.fingerLine.setAttribute("line", {
      start: {
        x: this.thumbTipPosition.x,
        y: this.thumbTipPosition.y,
        z: this.thumbTipPosition.z,
      },
      end: {
        x: this.indexTipPosition.x,
        y: this.indexTipPosition.y,
        z: this.indexTipPosition.z,
      },
    });

    // vector of wrist to camera
    var v = new THREE.Vector3();
    v.subVectors(this.wristPosition, this.cameraEl.getAttribute("position")); // 计算点与物体之间的向量
    // wristCyliner default direction
    var direction = new THREE.Vector3(0, 0, 1);
    direction.copy(this.wristRotation);

    // quateration of wrist to camera
    var q = new THREE.Quaternion();
    q.setFromUnitVectors(v.normalize(), new THREE.Vector3(0, 0, 1));
    // angle of wristcyliner to camera
    var angle = (direction.normalize().angleTo(v.normalize()) * 180) / Math.PI;
    if (this.data.hand == "left") {
    }
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
        MIDDLE_TIP_INDEX * 16
      )
    );
    this.thumbTipPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        THUMB_TIP_INDEX * 16
      )
    );
    this.wristPosition.setFromMatrixPosition(
      jointPose.fromArray(
        this.handTrackingComponent.jointPoses,
        WRIST_INDEX * 16
      )
    );

    this.updateSphere();
  },
});
