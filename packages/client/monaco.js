/* eslint-env browser */

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'
import do_username from 'do_username';
import { WebrtcProvider } from 'y-webrtc'

// @ts-ignore
window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return '/dist/json.worker.bundle.js'
        }
        if (label === 'css') {
            return '/dist/css.worker.bundle.js'
        }
        if (label === 'html') {
            return '/dist/html.worker.bundle.js'
        }
        if (label === 'typescript' || label === 'javascript') {
            return '/dist/ts.worker.bundle.js'
        }
        return '/dist/editor.worker.bundle.js'
    }
}

const usercolors = [
    '#30bced',
    '#6eeb83',
    '#ffbc42',
    '#ecd444',
    '#ee6352',
    '#9ac2c9',
    '#8acb88',
    '#1be7ff'
]

window.addEventListener('load', () => {
    const ydoc = new Y.Doc()
    // const provider = new WebsocketProvider('ws://localhost:8888', 'monaco-demo3', ydoc)
    // const provider = new WebsocketProvider('wss://demos.yjs.dev', 'monaco-demo3', ydoc)
    const provider = new WebrtcProvider('awesome drawing', ydoc, { password: 'test' })

    const ytext = ydoc.getText('monaco')

    const editor = monaco.editor.create(/** @type {HTMLElement} */(document.getElementById('monaco-editor')), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark'
    });

    const user = {
        // clientId: ydoc.clientID,
        name: do_username.generate(8),
        color: usercolors[Math.floor(Math.random() * usercolors.length)]
    }

    provider.awareness.setLocalStateField('user', user);

    provider.awareness.on('change', changes => {
        provider.awareness.getStates().forEach((state, clientID) => {
            console.log('oncahgen state: ', state);

            if (clientID === awareness.clientID) {
                return;
            }

            const pos = state.pos

            console.log('pos: ', pos)
            if (!pos) {
                return
            }

        })
    });

    const monacoBinding = new MonacoBinding(ytext, /** @type {monaco.editor.ITextModel} */(editor.getModel()), new Set([editor]), provider.awareness)



    const connectBtn = /** @type {HTMLElement} */ (document.getElementById('y-connect-btn'))
    connectBtn.addEventListener('click', () => {
        if (provider.shouldConnect) {
            provider.disconnect()
            connectBtn.textContent = 'Connect'
        } else {
            provider.connect()
            connectBtn.textContent = 'Disconnect'
        }
    })

    // @ts-ignore
    window.example = { provider, ydoc, ytext, monacoBinding }
})
