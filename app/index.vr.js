import React from 'react';
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
      my_id: null,
    };

  }

  _postMessage(msg) {
    //Skyway(メインスレッド)へのメッセージ送信
    msg.from = 'react-vr';
    window.postMessage(JSON.stringify(msg));
  }

  _onStartClicked(e) {
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
          default:
            break;
        }
      }
    });
  }

  componentWillMount() {
    this._messageListener();
  }

  componentDidMount() {
    let msg = {
      'action': 'GET_USER_MEDIA',
    };
    this._postMessage(msg);
  }

  render() {
    return (
      <View>
        <Pano source={ asset('town.jpg') } />
        <Scene style={{ transform: [{ translate: [0, 1.5, 0] }] }} />

        {/*スタートボタン*/}
        <VrButton style={{
          position: 'absolute',
          height: 1,
          width: 2,
          transform: [
            { translate: [-1, 2, -2] }
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
          obj: asset('models/pjanic.obj'),
          mtl: asset('models/pjanic.mtl'),
        }} style={{
          transform: [
            { scale: 0.1 },
            { translate: [0, 13, -9] },
            { rotateY: -85 },
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

AppRegistry.registerComponent('SkywayVR', () => SkywayVR);
