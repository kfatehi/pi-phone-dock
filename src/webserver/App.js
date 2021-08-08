import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import styles from './App.module.css'

function increment() {
    console.log("yooo");
}

function decrement() {
    console.log("ayy")
}

export function App() {
  const dockStatus = useSelector((state)=>state.dock.status)
  const dispatch = useDispatch()

  return (
    <div>
      <div className={styles.background}>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
        <h1>{dockStatus}</h1>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
      </div>
      {/* omit additional rendering output here */}
    </div>
  )
}