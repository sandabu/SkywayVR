import Peer from 'skyway-js';

export default class SkyWayBridge {
  constructor(worker) {
    this._worker = worker;
    // this.ACTION_TYPE = {
    //   GET_USER_MEDIA: 'GET_USER_MEDIA'
    // }

    this._peer = new Peer({
      key: "03f94c1b-f2d1-4c72-b6aa-c933aa4467ae",
      debug: 1
    });

    //Message Listener from worker
    this._worker.addEventListener('message', (e) => {
      try {
        let msg = JSON.parse(e.data);
        if(msg.from === 'react-vr') {
          switch(msg.action) {
            case 'GET_USER_MEDIA':
              this.getUserMedia();
              break;
            case 'COPY_ID':
              this.copyId();
              break;
            case 'SEND_HEAD_ROT':
              this.sendHeadRot(msg.rot);
              break;
            default:
              break;
          }
        }
      }catch(e) {
        return;
      }
    });

    this.peerListener();

  }

  copyId() {
    console.log(this._id);
    //コピーのため実DOMを作成
    // const tmpEl = document.createElement('pre');
    // tmpEl.innerHTML = this._id;
    //
    // const body = document.getElementsByTagName("body").item(0);
    // body.appendChild(tmpEl);
    // const range = document.createRange();
    // range.selectNodeContents(body.getElementsByTagName('pre').item(0));
    // window.getSelection().addRange(range);
    // console.log(range);
    // document.execCommand('copy');

    //実DOM削除
    // tmpEl.parentNode.removeChild(tmpEl);
  }

  sendHeadRot(rot) {
    if(this._dataConn && rot) {
      this._dataConn.send({
        type: 'rot',
        rot: rot
      });
    }
  }

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then( (stream) => {
        // Success
        this._localStream = stream;
        const msg = {
          'info': 'succeeded getting mediaDevice',
        };
        this.postMessage(msg);

        //Connect the peer if rid exists.
        const search = location.search.match(/rid=(.*?)(&|$)/);
        const rid = search ? search[1] : '';
        if(rid){
          const call = this._peer.call(rid, stream);
          this.setupCallEventHandlers(call);

          const dataConn = this._peer.connect(call.peer);
          this.setupSendDataEventHandler(dataConn);
        }

      }).catch(function (error) {
      // Error
      console.error('mediaDevice.getUserMedia() error:', error);
    });
  }

  setupCallEventHandlers(call) {
    if(this._mediaConn) {
      this._mediaConn.close();
    }

    this._mediaConn = call;


    //When you get friend's stream
    call.on('stream', (stream) => {
      //ReactVRのSoundComponentを使うためには，WorkerにJSON化してstreamを送らないといけないので
      //今回はメインスレッドにて実DOMでVideoタグを作成
      const body = document.getElementsByTagName("body").item(0);
      const videoEl = document.createElement('video');
      videoEl.srcObject = stream;
      //Safari 11だとautoplayに対応していない．playsinline系が必須．
      //https://gist.github.com/voluntas/af937c1fd353e6f677e155b53d661807
      videoEl.setAttribute('webkit-playsinline', true);
      videoEl.setAttribute('playsinline', true);
      videoEl.setAttribute('autoplay', true);
      body.appendChild(videoEl);
      videoEl.play();

      this.postMessage({
        action: 'CONNECTED'
      });


    });

    call.on('close', () => {
      console.log('disconnected!');
      //When friend or you closed stream
    });
  }

  setupSendDataEventHandler(dataConn) {
    if(this._dataConn) {
      this._dataConn.close();
    }

    this._dataConn = dataConn;

    dataConn.on('data', (data) => {
      if(data.type === 'rot'){
        const rot = data.rot;
        this.postMessage({
          action: 'RETURN_FRIENDS_HEAD_ROT',
          rot: {
            x: rot[0],
            y: rot[1],
            z: rot[2],
          }
        });
      }
    });
  }

  postMessage(msg) {
    msg.from = 'skyway';
    this._worker.postMessage(JSON.stringify(msg));
  }

  peerListener() {
    this._peer.on('open', (id) => {
      this._id = id;
      const msg = {
        'id': id,
        'action': 'OPEN'
      }
      this.postMessage(msg);

    });

    // Await connections from others
    this._peer.on('call', (c) => {
      // Show connection when it is completely ready
      //応答
      c.answer(this._localStream);
      //Audio作成
      this.setupCallEventHandlers(c);
    });

    this._peer.on('connection', (c) => {
      console.log('get some data...');
      this.setupSendDataEventHandler(c);
    });

    this._peer.on('error', (err) => console.log(err));
  }

}