import React, {Component} from 'react';

import '../../../client/styles/support.scss'
import translate from "../translate/translate";

class SupportScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            didFormRender: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.didFormRender !== nextProps.didFormRender;
    }

    componentDidMount() {
        this.setState({didFormRender: !this.state.didFormRender})
    }

    componentWillUnmount() {
        let iframe = document.getElementsByTagName('iframe');
        iframe && iframe[0] ? iframe[0].remove() : null;

    }

    render() {
        return (
            <div>
                <div className="info-label">
                    {translate('SETTINGS.SUPPORT_FORM_MSG')}
                </div>
                {(function (d, src, c) {
                    var t = d.scripts[d.scripts.length - 1],
                        s = d.createElement('script');
                    s.id = 'la_x2s6df8d';
                    s.async = true;
                    s.src = src;
                    s.onload = s.onreadystatechange = function () {
                        var rs = this.readyState;
                        if (rs && (rs != 'complete') && (rs != 'loaded')) {
                            return;
                        }
                        c(this);
                        let iframe = document.getElementsByTagName('iframe');
                        iframe && iframe[0]
                            ? iframe[0].setAttribute("style", 'position: absolute; top: 220px; left: 0; border: none;')
                            : null
                    };
                    t.parentElement.insertBefore(s, t.nextSibling);
                })(document,
                    'https://blocktech.ladesk.com/scripts/track.js',
                    function (e) {
                        LiveAgent.createForm('8e09cf18', e);
                    })}
            </div>
        );
    }
}


export default SupportScreen;
