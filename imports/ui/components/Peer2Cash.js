import React, {Component} from 'react';
import {getLocalStorageVar} from "../actions/utils";

class Peer2Cash extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        let containerStyles = {
            overflow: "hidden",
            position: "fixed",
            top: "55px",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "#ffffff",
            zIndex: "1000"
        };
        let frameStyles = {
            position: "absolute",
            top: "-52px",
            left: "0",
            right: "0",
            bottom: "0",
            width: "100%",
            border: "0",
            zIndex: "1000"
        };

        frameStyles.height = (document.body.clientHeight) + "px";

        var timestamp = 0 + Date.now();

        var link = "https://cash.pungo.app";

        link = link + "?" + timestamp

        return (
            <div className="container" style={containerStyles}>
                <iframe src={link} style={frameStyles} border="0"></iframe>
            </div>
        );
    }
}


export default Peer2Cash;
