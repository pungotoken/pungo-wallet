import React, {Component} from 'react';
import translate from "../translate/translate";

class RecoveryOptions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="recovery-options-container">
                <div className="text-label">{translate('SETTINGS.RECOVER')}</div>
                <div className="buttons-block">
                    <img src={'/images/recover_wif_icon.svg'} className="button-center"
                         onClick={() => this.props.changeActiveSection('recovery')}/>
                </div>

                <div className="text-label">{translate('SETTINGS.RECOVER_PRIVATE_KEYS').toLowerCase()}</div>
                <div className="buttons-block">
                    <img src={'/images/backup_key_icon.svg'} className="button-center"
                         onClick={() => this.props.changeActiveSection('recovery-keys')}/>
                </div>
            </div>
        );
    }
}


export default RecoveryOptions;