﻿/// <reference path="../js/facepunch.webgame.d.ts"/>

namespace SourceUtils {
    import WebGame = Facepunch.WebGame;

    export class MapViewer extends WebGame.Game {
        private mainCamera: WebGame.PerspectiveCamera;
        private mainRenderContext: WebGame.RenderContext;

        private time = 0;

        protected onInitialize(): void {
            super.onInitialize();

            this.canLockPointer = true;

            this.mainCamera = new WebGame.PerspectiveCamera(75, this.getWidth() / this.getHeight(), 1, 8192);
            this.mainRenderContext = new WebGame.RenderContext(this);

            const gl = this.context;

            gl.clearColor(0.675, 0.75, 0.5, 1.0);
        }

        protected onResize(): void {
            super.onResize();

            this.mainCamera.setAspect(this.getWidth() / this.getHeight());
        }

        private readonly lookAngs = new Facepunch.Vector2();
        private readonly tempQuat = new Facepunch.Quaternion();
        private readonly lookQuat = new Facepunch.Quaternion();

        private updateCameraAngles(): void {
            if (this.lookAngs.y < -Math.PI * 0.5) this.lookAngs.y = -Math.PI * 0.5;
            if (this.lookAngs.y > Math.PI * 0.5) this.lookAngs.y = Math.PI * 0.5;

            this.lookQuat.setAxisAngle(Facepunch.Vector3.unitZ, this.lookAngs.x);
            this.tempQuat.setAxisAngle(Facepunch.Vector3.unitX, this.lookAngs.y + Math.PI * 0.5);
            this.lookQuat.multiply(this.tempQuat);

            this.mainCamera.setRotation(this.lookQuat);
        }

        protected onMouseLook(delta: Facepunch.Vector2): void {
            super.onMouseLook(delta);

            this.lookAngs.sub(delta.multiplyScalar(1 / 800));
            this.updateCameraAngles();
        }

        private readonly move = new Facepunch.Vector3();

        protected onUpdateFrame(dt: number): void {
            super.onUpdateFrame(dt);

            if (this.isPointerLocked()) {
                this.move.set(0, 0, 0);
                const moveSpeed = 512 * dt;

                if (this.isKeyDown(WebGame.Key.W)) this.move.z -= moveSpeed;
                if (this.isKeyDown(WebGame.Key.S)) this.move.z += moveSpeed;
                if (this.isKeyDown(WebGame.Key.A)) this.move.x -= moveSpeed;
                if (this.isKeyDown(WebGame.Key.D)) this.move.x += moveSpeed;

                if (this.move.lengthSq() > 0) {
                    this.mainCamera.applyRotationTo(this.move);
                    this.mainCamera.translate(this.move);
                }
            } else {
                this.time += dt;

                const ang = this.time * Math.PI / 15;
                const height = Math.sin(this.time * Math.PI / 4) * 96 + 256;
                const radius = 512;

                this.lookAngs.set(ang, Math.atan2(128 - height, radius));
                this.updateCameraAngles();

                this.mainCamera.setPosition(Math.sin(-ang) * -radius, Math.cos(-ang) * -radius, height);
            }
        }

        protected onRenderFrame(dt: number): void {
            super.onRenderFrame(dt);

            const gl = this.context;

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
            gl.cullFace(gl.FRONT);

            this.mainRenderContext.render(this.mainCamera);
        }

        populateDrawList(drawList: WebGame.DrawList, camera: WebGame.Camera): void {

        }
    }
}