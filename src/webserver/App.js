import React from 'react'
// import styles from './App.module.css'

// Basic idea is this will be a "Progressive Web App" meant to be added to home screen
// See details on how to get that up and running. Want a fancy icon, get rid of address bar, etc
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen

export class App extends React.Component {
  constructor() {
    super()
    this.state = {
      wsConnected: false,
      bluetoothDiscoveredDevices: [],
      bluetoothPairedDevices: [],
      bluetoothDeviceInfo: {/* macAddress: {attributes}*/ },
      bluetoothController: {/* macAddress, info:{attributes}*/ }
    }

    setInterval(()=>{
      let {bluetoothController} = this.state;
      if (bluetoothController && bluetoothController.info && bluetoothController.info.discovering === "yes") {
        this.sendEvent("get-bluetooth-controller-info");
      }
    }, 1000);
  }

  componentDidMount() {
    this.interval = setInterval(() => this.keepaliveSocket(), 1000);
  }

  keepaliveSocket() {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    if (this.ws === undefined || (this.ws && this.ws.readyState === 3)) {
      this.setState({ wsConnected: false })
      let pingInterval = null;
      this.ws = new WebSocket("ws://" + window.location.host);
      this.sendEvent = (name, data = {}) => {
        let payload = { name, ...data };
        console.log('>>', payload);
        this.ws.send(JSON.stringify(payload));
      }
      this.ws.onerror = () => this.setState({ wsConnected: false })
      this.ws.onclose = () => {
        this.ws = undefined;
        this.setState({ wsConnected: false })
        clearInterval(pingInterval)
      }
      this.ws.onopen = () => {
        this.setState({ wsConnected: true })
        pingInterval = setInterval(() => {
          this.sendEvent('ping', { userAgent: navigator.userAgent });
        }, 5000)
        this.sendEvent("get-everything");
        this.sendEvent("get-bluetooth-paired-devices");
        this.sendEvent("get-bluetooth-controller-info");
      }
      this.ws.onmessage = ({ data }) => {
        try {
          let payload = JSON.parse(data);
          console.log('<<', payload);

          switch (payload.name) {
            case 'pong': {
              // nothing
            } break;
            case "bluetooth-devices": {
              this.sendEvent("pong")
            } break;
            case 'bluetooth-paired-devices': {
              payload.devices.forEach((device) => {
                this.sendEvent("get-bluetooth-device-info", { macAddress: device.macAddress })
              });
              this.setState({ bluetoothPairedDevices: payload.devices })
            } break;
            case 'bluetooth-device-info': {
              this.setState({
                bluetoothDeviceInfo: {
                  ...this.state.bluetoothDeviceInfo,
                  [payload.macAddress]: payload.info
                }
              })
            } break;
            case 'bluetooth-controller-info': {
              this.setState({ bluetoothController: { macAddress: payload.macAddress, info: payload.info } })
            } break;
            case 'bluetooth-discovered-devices': {
              this.setState({ bluetoothDiscoveredDevices: payload.devices })
            } break;
            default: {
              console.log('unhandled event:', payload);
            }
          }
        } catch (err) {
          console.error(err.stack)
        }
      }
    }
  }

  render() {
    return this.state.wsConnected ? this.renderConnectedWebsocket() : <div>Please wait...</div>;
  }


  renderConnectedWebsocket() {
    return this.state.bluetoothController && this.state.bluetoothController.info ? this.renderBluetoothControllerAvailable() : <div>Almost there...</div>;
  }

  renderBluetoothControllerAvailable() {
    return <div>
      { this.state.bluetoothController.info.discovering === "yes" ? <button onClick={() => this.sendEvent("bluetooth-scan-off")}>Stop Scan</button> : <button onClick={() => this.sendEvent("bluetooth-scan-on")}>Start Scan</button> }
      <button onClick={() => this.sendEvent("get-bluetooth-paired-devices")}>Refresh Bluetooth Paired Devices</button>
      
      <ul>
        {this.state.bluetoothDiscoveredDevices.map(device => <li key={device.macAddress}>
          <span>{device.name}</span>
        </li>)}
      </ul>

      <ul>
        {this.state.bluetoothPairedDevices.map(device => <li key={device.macAddress}>
          <span>{device.name}</span>{this.state.bluetoothDeviceInfo[device.macAddress] ? <div>
            {this.state.bluetoothDeviceInfo[device.macAddress].connected === "yes" ? <span>connected <button onClick={() => this.sendEvent('bluetooth-disconnect-paired-device', { macAddress: device.macAddress })}>disconnect</button></span> : <button onClick={() => this.sendEvent('bluetooth-connect-paired-device', { macAddress: device.macAddress })}>connect</button>}
          </div> : "getting info"}
        </li>)}
      </ul>
    </div>
  }
}