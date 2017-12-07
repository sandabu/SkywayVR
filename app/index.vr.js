import React from 'react';
import ReactMixin from 'react-mixin';
import ReactTimerMixin from 'react-timer-mixin';
import {
  AppRegistry,
  asset,
  Pano,
  Text,
  View,
  Scene,
  Model,
  PointLight,
  AmbientLight,
  VrButton,
  VrHeadModel,

} from 'react-vr';

export default class SkywayVR extends React.Component {

  constructor(props) {
    super(props);

    this.Status = {
      INIT: 'INIT',
      CONNECTED: 'CONNECTED',
    };

    this.state = {
      status: this.Status.INIT,
      avatar_rot: {
        x: 0,
        y: 180,
        z: 180,
      },
      my_id: null,
    };
    //
    this._avatarReflesh = 100;

  }

  _postMessage(msg) {
    //Skyway(メインスレッド)へのメッセージ送信
    msg.from = 'react-vr';
    window.postMessage(JSON.stringify(msg));
  }

  _onStartClicked() {
    let msg = {
      'action': 'COPY_ID'
    }
    this._postMessage(msg);
  }

  _messageListener() {
    //Skyway(メインスレッド)からのメッセージ取得
    window.addEventListener('message', (e) => {
      let msg = JSON.parse(e.data);
      if(msg.from === 'skyway') {
        switch(msg.action) {
          case 'OPEN':
            this.setState({
              id: msg.id
            });
            break;
          case 'CONNECTED':
            this.setState({
              status: this.Status.CONNECTED,
            });
            break;
          case 'RETURN_FRIENDS_HEAD_ROT':
            this.setState({
              avatar_rot: {
                x: -msg.rot.x,
                y: msg.rot.y + 180,
                z: msg.rot.z + 180,
              },
            });
            break;
          default:
            break;
        }
      }
    });
  }

  _watchHeadRotation() {
    this.setInterval(() => {
      const rot = VrHeadModel.rotation();
      this._postMessage({
        action: 'SEND_HEAD_ROT',
        rot: rot,
      });
    }, this._avatarReflesh);
  }

  componentWillMount() {
    this._messageListener();
  }

  componentDidMount() {
    //マウント後にUserMediaを取得しないと，window.SkyWayBridgeが存在しない
    let msg = {
      'action': 'GET_USER_MEDIA',
    };
    this._postMessage(msg);
    this._watchHeadRotation();
  }

  render() {
    return (
      <View>
        <Pano source={ asset('Golden_Louvre.jpg') } />
        <Scene style={{ transform: [{ translate: [0, 1.5, 0] }] }} />

        {/*スタートボタン*/}
        <VrButton style={{
          position: 'absolute',
          height: 1,
          width: 2,
          transform: [
            { translate: [-1, 2, -1] }
          ],
          backgroundColor: '#666',
          display: this.state.status === this.Status.CONNECTED ? 'none' : 'flex',
        }} onClick={this._onStartClicked.bind(this)}>
          <Text style={{
            textAlign: 'center',
            margin: '8px 0',
          }}>
            {`Your id is ${this.state.id}`}
          </Text>
          <Text style={{
            textAlign: 'center',
            margin: '8px 0',
          }}>Click to dump</Text>
        </VrButton>
        {/*スタートボタン*/}


        <View style={{
          flex: 1,
          flexDirection: 'column',
          padding: 0.2,
          height: 2, width: 2,
          transform: [
            { translate: [1, 2.5, -1.5] },
            { rotateY: -25 }
          ],
        }}>
          <View style={{
            backgroundColor: 'blue',
            margin: 0.1,
            flex: 0.3
          }} />
          <View style={{
            backgroundColor: 'red',
            margin: 0.1,
            flex: 0.3
          }}/>
        </View>

        <Model source={{
          obj: asset('models/RikuFace/mesh.obj'),
          mtl: asset('models/RikuFace/mesh.mtl'),
        }} style={{
          transform: [
            { translate: [0, 1.5, -0.65] },
            { rotateX : this.state.avatar_rot.x },
            { rotateY : this.state.avatar_rot.y },
            { rotateZ : this.state.avatar_rot.z },
          ],
          display: this.state.status === this.Status.CONNECTED ? 'flex' : 'none',
        }} lit={true} />

        <PointLight intensity={1.0} style={{ transform: [{ translate: [0, 2, 0] }, {rotateX: -90}] }} />
        {/*<Box dimDepth={2} dimHeight={2} dimWidth={2}*/}
             {/*style={{*/}
               {/*transform: [*/}
                {/*{ translate: [3, 1, -5] },*/}
               {/*],*/}
               {/*color: 'red',*/}
             {/*}}*/}
             {/*lit={true}*/}
        {/*/>*/}
        <AmbientLight intensity={0.2} />
      </View>
    );
  }
};

//ES6でのTimerMixin
ReactMixin.onClass(SkywayVR, ReactTimerMixin);

AppRegistry.registerComponent('SkywayVR', () => SkywayVR);
