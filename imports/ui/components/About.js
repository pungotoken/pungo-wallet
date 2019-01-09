import React, {Component} from 'react';
import translate from "../translate/translate";

class About extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="about-ui">
                <div className="about-inner">
                    <div className="pungo-logo-container">
                        <img className="about-logo" src={'images/about_wallet_logo.svg'}
                        onClick={() => window.open("...", '_system')}
                        />
                        <div className="app-details">
                            <span className="build">...</span>
                            <span className="version">...</span>
                        </div>
                    </div>
                    <div className="pungo-logo-container">
                        <img className="img-powered-by" src="images/about_poweredby_core_logo.svg"/>
                    </div>
                    <div className="license-container">
                        <p>LICENSE</p>
                        <div className="license-logo"
                             onClick={() => window.open("https://choosealicense.com/licenses/agpl-3.0", '_system')}>
                            <img src="images/template/about/gnu_agpl_icon.svg"/>
                        </div>
                    </div>
                    <div className="disclaimer-text">
                        {translate('SETTINGS.DISCLAIMER_MSG_ABOUT')}
                    </div>
                    <div className="copyright-container"
                         onClick={() => window.open("...", '_system')}>
                        <p>UNLIMITED WEB SERVICES LTD</p>
                    </div>
                </div>
            </div>
        );
    }
}


export default About;