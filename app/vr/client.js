// Auto-generated content.
// This file contains the boilerplate to set up your React app.
// If you want to modify your application, start in "index.vr.js"

// Auto-generated content.
import {VRInstance} from 'react-vr-web';
import 'webvr-polyfill';
import SkyWayBridge from '../skyway/SkyWayBridge.js';

function init(bundle, parent, options) {
  WebVRPolyfill.InstallWebVRSpecShim();
  const vr = new VRInstance(bundle, 'SkywayVR', parent, {
    // Add custom options here
    ...options,
  });
  vr.render = function() {
    // Any custom behavior you want to perform on each frame goes here
  };
  // Begin the animation loop
  vr.start();

  //Workerの取得とBridgeの作成
  const VRWorker = vr.rootView.context.bridge.getWorker();
  window.SkyWayBridge = new SkyWayBridge(VRWorker);

  return vr;
}

window.ReactVR = {init};
