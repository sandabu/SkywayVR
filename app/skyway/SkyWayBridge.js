export default class SkyWayBridge {
  constructor(worker) {
    this._worker = worker;
    // this.ACTION_TYPE = {
    //   GET_USER_MEDIA: 'GET_USER_MEDIA'
    // }

    this._peer = new Peer({
      key: "03f94c1b-f2d1-4c72-b6aa-c933aa4467ae",
      debug: 3
    });

    this._connectedPeers = {};

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

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then( (stream) => {
        // Success
        // $('#my-video').get(0).srcObject = stream;
        this._localStream = stream;
        const msg = {
          'info': 'succeeded getting mediaDevice',
        }
        this.postMessage(msg);
      }).catch(function (error) {
      // Error
      console.error('mediaDevice.getUserMedia() error:', error);
    });
  }

  postMessage(msg) {
    msg.from = "skyway";
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
    this._peer.on('connection', c => {
      // Show connection when it is completely ready
      c.on('open', () => connect(c));
    });
    this._peer.on('error', err => console.log(err));
  }

}