/* eslint-env browser */
import * as Y from 'yjs'
// import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'
import do_username from 'do_username';
import { WebrtcProvider } from 'y-webrtc'

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

function addNewStyle(newStyle) {
    var styleElement = document.getElementById('styles_js');

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'styles_js';
        document.getElementsByTagName('head')[0].appendChild(styleElement);
    }

    styleElement.appendChild(document.createTextNode(newStyle));
}

const styleLoadMap = {};
let nameLoad = false;

window.addEventListener('load', () => {
    const ydoc = new Y.Doc()
    // const provider = new WebsocketProvider('ws://localhost:8888', 'monaco-demo3', ydoc)
    const provider = new WebrtcProvider('awesome drawing', ydoc, { password: 'test' })

    const ytext = ydoc.getText('monaco')

    const editor = monaco.editor.create(/** @type {HTMLElement} */(document.getElementById('monaco-editor')), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark'
    });

    const user = {
        name: do_username.generate(8),
        color: usercolors[Math.floor(Math.random() * usercolors.length)]
    }

    provider.awareness.setLocalStateField('user', user);

    provider.awareness.on('change', changes => {
        provider.awareness.getStates().forEach((state, clientID) => {
            console.log('oncahgen state: ', state);

            if (clientID === provider.awareness.clientID) {
                if (!nameLoad) {
                    nameLoad = true;
                    document.getElementById('username').appendChild(document.createTextNode(state.user.name));
                }
                return;
            }

            // const cs1 = `yRemoteSelection-${clientID}`;
            const cs2 = `yRemoteSelectionHead-${clientID}`

            const target = document.getElementsByClassName(cs2)[0];

            if (target) {


                const _p = target;

                target.addEventListener('mouseenter', () => {
                    let _node;

                    for (let n of _p.children) {
                        if (n.hasAttribute('t_name')) {
                            _node = n;
                        }
                    }

                    if (!_node) {
                        _node = document.createElement('span');
                        _node.setAttribute('t_name', 'true');
                        _node.appendChild(document.createTextNode(state.user.name));
                        _p.appendChild(_node);
                    }

                    _node.classList.add(`${cs2}-active`);
                    _node.classList.remove(`${cs2}-inactive`);

                })

                target.addEventListener('mouseleave', () => {
                    let _node;

                    for (let n of _p.children) {
                        if (n.hasAttribute('t_name')) {
                            _node = n;
                        }
                    }

                    if (_node) {
                        // _node.classList.remove(`${cs2}-active`);
                        _node.classList.add(`${cs2}-inactive`);
                    }
                })
            }

            if (!styleLoadMap[clientID]) {

                styleLoadMap[clientID] = true;

                addNewStyle(
                    `
                       .${cs2} {
                            border-left: ${state.user.color} solid 2px;
                            border-top: 0px;
                            border-bottom: 0px;
                            // border-top: ${state.user.color} solid 2px;
                            // border-bottom: ${state.user.color} solid 2px;
                       } 

                       .${cs2}::after {
                            border: 2.2px solid ${state.user.color}
                       }
    
                       .${cs2}-active {
                            position: relative;
                            content: '${state.user.name}';
                            background-color: ${state.user.color};
                            border: 0px;
                            top: -18px;
                            left: 2px;
                            line-height: 1;
                            padding: 2px 2px;
                            font-size: 10px;
                            font-weight: 700;
                            overflow: hidden;
                            white-space: nowrap;
                            user-select: none;
                            color: #fff;
                            transform-origin: left bottom;
                            z-index: 1;
                            opacity: 1;
                            transition-property: opacity;
                            transition-duration: .2s;
                            transition-delay: 1s;
                        }

                        .${cs2}-inactive {
                            opacity: 0;
                        }
                    `
                )
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
