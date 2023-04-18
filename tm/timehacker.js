// ==UserScript==
// @name         timehacker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://rides.imaginaryones.com/*
// @icon         https://rides.imaginaryones.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    var hackerInstall = false;

    var old_requestAnimFrame = null;
    var old_requestAnimationFrame = null;

    var old_cancelAnimFrame = null;
    var old_cancelAnimationFrame = null;

    var old_performance_now = null;

    var gStep = -1;
    var gTime = null;
    var gSimuTime = null;
    var gLastTime = null;
    var gId = 0;
    var gRequests = [];
    const kMillisecondPerFrame = 16.666666;
    var gStartRequest = false;

    var gFixedFrameRate = 0;
    var gFixedFrameTime = 0;
    var gTimeMulti = 1;

    /**
     *
     * @param {FrameRequestCallback} cb
     * @returns number
     */
    function hacked_requestAnimationFrame(cb) {
        //console.log("hacked_requestAnimationFrame");
        var id = ++gId;
        gRequests.push({
            id,
            cb,
        });
        if (!gStartRequest) {
            old_requestAnimationFrame(animation_callback);
            gStartRequest = true;
        }
        return id;
    }

    /**
     *
     * @param {number} handle
     */
    function hacked_cancelAnimationFrame(handle) {
        for (var i = 0; i < gRequests.length; ++i) {
            if (gRequests[i].id == handle) {
                gRequests.splice(i, 1);
                break;
            }
        }
    }

    /**
     *
     * @param {DOMHighResTimeStamp} time
     * @returns
     */
    function do_animation_callback(time) {
        if (gTime) {
            var advance = gStep < 0 && gLastTime ? time - gLastTime : kMillisecondPerFrame;
            if (gFixedFrameRate > 0) {
                let nextFrameTime = 1000 / gFixedFrameRate;
                if (time - gLastTime < nextFrameTime) {
                    return;
                }
            }
            if (gFixedFrameTime) {
                advance = gFixedFrameTime;
            }
            gLastTime = time;
            time = gSimuTime = gSimuTime + advance * gTimeMulti;
            gTime += advance;
        }

        var requests = gRequests;
        gRequests = [];

        for (var i = 0; i < requests.length; ++i) {
            requests[i].cb(time);
        }
    }

    /**
     *
     * @param {DOMHighResTimeStamp} time
     * @returns
     */
    function animation_callback(time) {
        old_requestAnimationFrame(animation_callback);
        if (gStep < 0) {
            do_animation_callback(time);
            return;
        } else {
            if (gStep) {
                --gStep;
                do_animation_callback(time);
            }
        }
    }

    /**
     *
     * @returns number
     */
    function hacked_performance_now() {
        //console.log("hacked_performance_now");
        if (gTime) {
            var advance = gStep < 0 ? old_performance_now() - gLastTime : 0;
            return gSimuTime + advance * gTimeMulti;
        }
        return old_performance_now();
    }

    function install() {
        if (!hackerInstall) {
            old_requestAnimationFrame = window.requestAnimationFrame;
            window.requestAnimationFrame = hacked_requestAnimationFrame;
            old_cancelAnimationFrame = window.cancelAnimationFrame;
            window.cancelAnimationFrame = hacked_cancelAnimationFrame;
            old_performance_now = performance.now.bind(performance);
            performance.now = hacked_performance_now;

            // hack cocos
            old_requestAnimFrame = window.requestAnimFrame;
            window.requestAnimFrame = hacked_requestAnimationFrame;
            old_cancelAnimFrame = window.cancelAnimFrame;
            window.cancelAnimFrame = hacked_cancelAnimationFrame;

            hackerInstall = true;

            gTime = old_performance_now();
            gSimuTime = gTime;
        }
    }

    function pause() {
        install();
        gStep = 0;
    }

    function step() {
        install();
        gStep = 1;
    }

    function run() {
        gStep = -1;
    }

    function isRunning() {
        return gStep < 0;
    }

    /**
     *
     * @param {number} rate rate <= 0 no limit rate > 0 limit to rate
     */
    function setFixedFrameRate(rate) {
        gFixedFrameRate = rate;
    }

    function setFixedFrameTime(time) {
        gFixedFrameTime = time;
    }

    function setTimeMulti(multi) {
        gTimeMulti = multi;
    }

    install();

    console.log("injected timehacker");

    window.bc = window.bc || {};
    Object.assign(window.bc, {
        pause,
        step,
        run,
        setFixedFrameRate,
        setFixedFrameTime,
        setTimeMulti,
    });
})();

/*
// ==UserScript==
// @name         timehacker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       bianchui
// @match        https://rides.imaginaryones.com/b-rider/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=imaginaryones.com
// @grant        none
// @require      file:///Users/bian/Proj/bian/mywork/tm/timehacker.js
// ==/UserScript==
*/
