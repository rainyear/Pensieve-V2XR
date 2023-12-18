const _shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const _ROTATIONS = () => _shuffle([0, 0, 45, 45, 45, 45, -45, -45, -45, -45]);
const _GAME_STATE = (() => {
  return {
    isGameStart: false,
    isSuccess: {},
    BGM: document.querySelector("#sound-bgm"),
    successSound: document.querySelector("#sound-success"),
    missedSound: document.querySelector("#sound-missed"),
    controlPanel: document.querySelector("[control-panel]"),
    camera: document.querySelector("[camera]"),
    mask: document.querySelector("#model-mask"),
    maskInitPosition: "0 1.5 -4",
    maskZRotations: _ROTATIONS(),
    currentRotation: 0,
    resetMask: function () {
      // reset mask
      this.currentRotation = this.maskZRotations.pop();
      this.mask.setAttribute("position", this.maskInitPosition);
      this.mask.setAttribute("rotation", `0 0 ${this.currentRotation}`);
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

AFRAME.registerComponent("startgame-btn", {
  init: function () {
    const sceneEl = this.el.sceneEl;
    this.el.addEventListener("click", () => {
      // Start Game
      _GAME_STATE.startGame();
    });

    _GAME_STATE.mask.addEventListener("animationcomplete", function () {
      if (_GAME_STATE.maskZRotations.length <= 0) {
        // End Game
        _GAME_STATE.endGame();
        console.log("Game Over");
      } else {
        _GAME_STATE.resetMask();
      }
    });
  },
});
AFRAME.registerComponent("rotation-reader", {
  init: function () {
    this.initialRotation = this.el.object3D.rotation.clone();
    this.initialPosition = this.el.object3D.position.clone();

    console.log(
      "init rotation and position: ",
      this.initialRotation,
      this.initialPosition
    );
  },
  tick: function () {
    const maskPos = _GAME_STATE.mask.getAttribute("position");
    // console.log(maskPos.z);
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
  },
});

/*
      AFRAME.registerComponent("wall", {
        schema: {
          direction: { type: "string", default: "up" },
        },
        init: function () {
          const wall = this.el.querySelector("a-plane");
          const circle = this.el.querySelector("a-circle");
          wall.getObject3D("mesh").renderOrder = 2;
          circle.getObject3D("mesh").material.colorWrite = false;
          circle.getObject3D("mesh").renderOrder = 1;

          switch (this.data.direction) {
            case "up":
              break;
            case "left":
              circle.setAttribute("rotation", "0 0 45");
              break;
            case "right":
              circle.setAttribute("rotation", "0 0 -45");
              break;
          }
        },
      });
      */
