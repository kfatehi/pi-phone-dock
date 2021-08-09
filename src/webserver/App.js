import React from 'react'
// import styles from './App.module.css'

// Basic idea is this will be a "Progressive Web App" meant to be added to home screen
// See details on how to get that up and running. Want a fancy icon, get rid of address bar, etc
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen

export class App extends React.Component {
  constructor() {
    super()
    this.state = { ws: "disconnected" }
  }
  
  componentDidMount() {
    this.interval = setInterval(()=>this.keepaliveSocket(), 1000);
  }

  keepaliveSocket() {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    if (this.ws === undefined || (this.ws && this.ws.readyState === 3)) {
      this.setState({ ws: "connecting websocket..." })
      let pingInterval = null;
      this.ws = new WebSocket("ws://"+window.location.host);
      this.ws.onmessage = (event) => {
        console.log(event.data);
        this.setState()
      }
      this.ws.onopen = () => {
        this.setState({ ws: "websocket connected!" })
        pingInterval = setInterval(()=>{
          this.ws.send(JSON.stringify({name:'ping', userAgent: navigator.userAgent }));
        }, 5000)
      }
      this.ws.onerror = () => this.setState({ ws: "websocket error!" })
      this.ws.onclose = () => {
        this.ws = undefined;
        this.setState({ ws: "websocket close!" })
        clearInterval(pingInterval)
      }
    }
  }

  render() {
    return <div>
      <div>
        {this.state.ws}
      </div>
    </div>
  }
}