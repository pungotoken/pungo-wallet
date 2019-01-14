import React, {Component} from 'react';

class Peer2Card extends Component {
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

        return (
            <div className="container" style={containerStyles}>
                <iframe src="https://krd.pungo.app/reload" style={frameStyles} border="0"></iframe>
            </div>
        );
    }
}


export default Peer2Card;
