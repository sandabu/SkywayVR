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
  Animated,
  Image,
} from 'react-vr';

export default class SkywayVR extends React.Component {

  constructor(props) {
    super(props);

    this.Status = {
      INIT: 'INIT',
      CONNECTED: 'CONNECTED',
      GET_LIKE: 'GET_LIKE',
    };

    this.state = {
      status: this.Status.INIT,
      avatar_rot: {
        x: 0,
        y: 180,
        z: 180,
      },
      my_id: null,
      friend_id: null,
      likeBounceValue: new Animated.Value(0.1),
    };
    //
    this._avatarReflesh = 100;
    this._likeIntervalTime = 2000;
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
              friend_id: msg.friend_id,
            });
            break;
          case 'RETURN_FRIENDS_HEAD_ROT':
            if(this.state.status === this.Status.CONNECTED) {
              this.setState({
                avatar_rot: {
                  x: -msg.rot.x,
                  y: msg.rot.y + 180,
                  z: msg.rot.z + 180,
                },
              });
            }
            break;
          case 'RETURN_FRIENDS_LIKE':
            this._getLike();
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

  _getLike() {
    console.log('いいね！されました');

    this.setState({
      status: this.Status.GET_LIKE,
      avatar_rot: {
        x: -14.67994310099575,
        y: 218.1507823613087,
        z: 180
      }
    });

    Animated.spring(this.state.likeBounceValue, {
      toValue: 1.5,
      friction: 4,
    }).start();

    //いいね解除
    this.setTimeout(() => {
      this.setState({
        status: this.Status.CONNECTED,
      });

      Animated.spring(this.state.likeBounceValue, {
        toValue: 0.1,
        friction: 4,
      }).start();

    }, this._likeIntervalTime);

  }

  _gazeLike() {
    console.log('いいね！しました');
    this._postMessage({
      'action': 'LIKE'
    });
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
        <Pano source={ asset('lake.jpg') } />
        <Scene style={{ transform: [{ translate: [0, 1.5, 0] }] }} />

        {/*スタートボタン*/}
        <VrButton style={{
          position: 'absolute',
          height: 1,
          width: 2,
          transform: [
            { translate: [-1, 2, -1.3] }
          ],
          backgroundColor: '#666',
          display: this.state.friend_id ? 'none' : 'flex',
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

        {/*いいねボタン*/}
        <Image source={ asset('like_button.jpg') } style={{
          height: 0.6, width: 2,
          backgroundColor: '#ffffff66',
          transform: [
            { translate: [1.5, 2.5, -1.5] },
            { rotateY: -25 }
          ],
        }} onEnter={ this._gazeLike.bind(this)} >
        </Image>
        {/*いいねボタン*/}

        {/*サムアップ*/}
        <Animated.Image source={ asset('like.svg') } style={{
          height: 1.2,
          width: 1.2,
          transform: [
            { scale: this.state.likeBounceValue },
            { translate: [1.6, 1.5, -1.4] },
            { rotateY: -80 }
          ],
        }}/>

        {/*サムアップ*/}


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
          display: this.state.friend_id ? 'flex' : 'none',
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
