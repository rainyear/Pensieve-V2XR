const _shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const _randomColor = () => {
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
};
const _ROTATIONS = () => _shuffle([0, 0, 45, 45, 45, 45, -45, -45, -45, -45]);
const _GAME_STATE = (() => {
  return {
    isEnterVR: false,
    isPositionSet: false,
    isGameStart: false,
    isSuccess: {},
    BGM: document.querySelector("#sound-bgm"),
    successSound: document.querySelector("#sound-success"),
    missedSound: document.querySelector("#sound-missed"),
    controlPanel: document.querySelector("[control-panel]"),
    camera: document.querySelector("[camera]"),
    mask: document.querySelector("#model-mask"),
    maskInitPosition: new THREE.Vector3(0, 0, -4),
    maskZRotations: _ROTATIONS(),
    currentRotation: 0,
    gameScore: 0,
    gameScoreBoard: document.querySelector("#gameScore"),
    resetMask: function () {
      // reset mask
      console.log("Reset object");
      this.currentRotation = this.maskZRotations.pop();
      this.mask.setAttribute("rotation", `0 0 ${Math.random() * 90}`);
      var pos = this.maskInitPosition;
      pos.x = (Math.random() - 0.5) * 2;
      pos.z = -4;

      this.mask.setAttribute("position", pos);
      this.mask
        .querySelector("a-dodecahedron")
        .setAttribute("color", _randomColor());
      this.mask.setAttribute("visible", true);
      // start animation
      this.mask.emit("gametick", null, false);
    },
    startGame: function () {
      this.isGameStart = true;
      this.controlPanel.setAttribute("visible", false);
      this.BGM.components.sound.playSound();
      this.resetMask();
    },
    endGame: function () {
      this.isGameStart = false;
      this.controlPanel.setAttribute("visible", true);
      this.mask.setAttribute("visible", false);
      this.BGM.components.sound.stopSound();

      this.maskZRotations = _ROTATIONS();
      this.isSuccess = {};

      this.gameScoreBoard.setAttribute("visible", "true");
      this.gameScoreBoard
        .querySelector("a-text")
        .setAttribute("value", `Score: ${this.gameScore}`);

      this.gameScore = 0;
    },
    response: function (headRot) {
      console.log(headRot);
      if (this.currentRotation === 0) {
        if (Math.abs(headRot) < 5) {
          return true;
        }
        return false;
      }
      if (headRot > 0 && headRot >= this.currentRotation) {
        return true;
      }
      if (headRot < 0 && headRot <= this.currentRotation) {
        return true;
      }
      return false;
    },
  };
})();

_GAME_STATE.mask.addEventListener("click", (event) => {
  _GAME_STATE.gameScore += 10;
  console.log("Hit", _GAME_STATE.gameScore);
  _GAME_STATE.successSound.components.sound.playSound();
  if (_GAME_STATE.maskZRotations.length <= 0) {
    // End Game
    _GAME_STATE.endGame();
    console.log("Game Over");
  } else {
    _GAME_STATE.resetMask();
  }
});

AFRAME.registerComponent("startgame-btn", {
  init: function () {
    const sceneEl = this.el.sceneEl;
    this.el.addEventListener("click", () => {
      // Start Game
      if (!_GAME_STATE.isGameStart) {
        _GAME_STATE.startGame();
      }
    });

    _GAME_STATE.mask.addEventListener("animationcomplete", function () {
      if (_GAME_STATE.isGameStart) {
        if (_GAME_STATE.maskZRotations.length <= 0) {
          // End Game
          _GAME_STATE.endGame();
          console.log("Game Over");
        } else {
          // miss
          console.log("miss");
          _GAME_STATE.missedSound.components.sound.playSound();
          _GAME_STATE.resetMask();
        }
      }
    });
  },
});
AFRAME.registerComponent("rotation-reader", {
  init: function () {
    this.initialRotation = this.el.object3D.rotation.clone();
    this.initialPosition = this.el.object3D.position.clone();
    // var position = new THREE.Vector3();
    // this.cameraWorldPosition = this.el.object3D.getWorldPosition(position);
  },
  tick: function () {
    const maskPos = _GAME_STATE.mask.getAttribute("position");

    if (_GAME_STATE.isEnterVR && !_GAME_STATE.isPositionSet) {
      var position = new THREE.Vector3();
      this.cameraWorldPosition = this.el.object3D.getWorldPosition(position);
      console.log("Set position", this.cameraWorldPosition);
      if (this.cameraWorldPosition.y > 0) {
        _GAME_STATE.controlPanel.object3D.position.y =
          this.cameraWorldPosition.y;
        _GAME_STATE.maskInitPosition.y = this.cameraWorldPosition.y;
        _GAME_STATE.isPositionSet = true;
      }
    }

    /*
    if (
      _GAME_STATE.isGameStart &&
      maskPos.z > -0.05 &&
      _GAME_STATE.isSuccess[_GAME_STATE.maskZRotations.length] === undefined
    ) {
      console.log(_GAME_STATE.mask.getAttribute("rotation").z);
      var headRot = this.el.object3D.rotation.z * (180 / Math.PI);
      var isCorrect = _GAME_STATE.response(headRot);
      if (isCorrect) {
        // correct
        _GAME_STATE.successSound.components.sound.playSound();
      } else {
        // wrong
        _GAME_STATE.missedSound.components.sound.playSound();
      }
      _GAME_STATE.isSuccess[_GAME_STATE.maskZRotations.length] = isCorrect;
    }
      */
  },
});
