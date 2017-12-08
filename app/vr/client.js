// Auto-generated content.
// This file contains the boilerplate to set up your React app.
// If you want to modify your application, start in "index.vr.js"

// Auto-generated content.
import {VRInstance} from 'react-vr-web';
import SkyWayBridge from '../skyway/SkyWayBridge.js';
import 'webvr-polyfill';

function init(bundle, parent, options) {
  //iOS11でも2眼モード(一部機能せず)
  //https://qiita.com/shalman/items/ee576fa28e763ce83bdf
  WebVRPolyfill.InstallWebVRSpecShim();

  //パノラマ設定
  const panoSearch = location.search.match(/pano=(.*?)(&|$)/);
  const pano = panoSearch? panoSearch[1] : 'lake.jpg';

  const vr = new VRInstance(bundle, 'SkywayVR', parent, {
    // Add custom options here
    //レイを飛ばす
    raycasters: [
      {
        getType: () => 'mycursor',
        getRayOrigin: () => [0, 0, 0],
        getRayDirection: () => [0, 0, -1],
        drawsCursor: () => true
      }
    ],
    cursorVisibility: 'visible',
    initialProps: { 'pano': pano},
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
