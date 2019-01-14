'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastContainer = exports.ToastStore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n'], ['\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  position: fixed;\n  overflow: hidden;\n  z-index: 9999;\n  max-height: calc(100vh - 10px);\n  text-align: right;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n'], ['\n  position: fixed;\n  overflow: hidden;\n  z-index: 9999;\n  max-height: calc(100vh - 10px);\n  text-align: right;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  font-family: \'Montserrat\', Helvetica, Arial, serif;\n  display: flex;\n  align-items: center;\n  text-align: center;\n  padding: 5px 15px;\n  white-space: pre-line;\n  min-height: 50px;\n  margin-bottom: 15px;\n  border-radius: 0px;\n  animation-name: ', ';\n  animation-duration: 1s;\n  animation-fill-mode: both;\n'], ['\n  font-family: \'Arial\';\n  display: flex;\n  align-items: center;\n  text-align: center;\n  padding: 5px 15px;\n  white-space: pre-line;\n  min-height: 50px;\n  margin-bottom: 15px;\n  border-radius: 0px;\n  animation-name: ', ';\n  animation-duration: 1s;\n  animation-fill-mode: both;\n']);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _watchableStores = require('watchable-stores');

var _watchableStores2 = _interopRequireDefault(_watchableStores);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var FadeInUp = (0, _styledComponents.keyframes)(_templateObject);

var Toasts = _styledComponents2.default.div(_templateObject2);

var Toast = _styledComponents2.default.div(_templateObject3, FadeInUp);

var BackgroundColor = {
  success: {
    backgroundColor: '#1a1a1a'
    // backgroundColor: "rgba(46, 204, 113, 1)"
  },
  info: {
    backgroundColor: '#1a1a1a'
    // backgroundColor: "rgba(236, 240, 241, 1)"
  },
  warning: {
    backgroundColor: '#1a1a1a'
    // backgroundColor: "rgba(241, 196, 15, 1)"
  },
  error: {
    backgroundColor: '#1a1a1a'
    // backgroundColor: "rgba(231, 76, 60, 1)"
  }
};

var LightBackgroundColor = {
  success: {
    color: '#468847',
    // backgroundColor: '#dff0d8',
    backgroundColor: '#666666',
    // borderColor: '#d6e9c6'
  },
  info: {
    color: '#3a87ad',
    backgroundColor: '#666666',
    // backgroundColor: '#d9edf7',
    borderColor: '#666666',
    // borderColor: '#bce8f1'
    borderRadius: 0
  },
  warning: {
    color: '#c09853',
    // backgroundColor: '#fcf8e3',
    backgroundColor: '#666666',
    // borderColor: '#fbeed5'
  },
  error: {
    color: '#b94a48',
    // backgroundColor: '#f2dede',
    backgroundColor: '#666666',
    // borderColor: '#eed3d7'
  }
};

var Store = function Store() {
  var store = (0, _watchableStores2.default)({
    action: '',
    message: ''
  });

  ['success', 'info', 'warning', 'error'].forEach(function (status) {
    store[status] = function (message, timer, classNames) {
      store.data = {
        status: status,
        message: message,
        timer: timer,
        classNames: classNames
      };
    };
  });

  return store;
};

var Container = function (_Component) {
  _inherits(Container, _Component);

  function Container(props) {
    _classCallCheck(this, Container);

    var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, props));

    _this.state = {
      styles: {},
      toasts: []
    };
    return _this;
  }

  _createClass(Container, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.storeSubscription = this.props.store.watch(function (data) {
        var toast = Object.assign({}, _extends({}, data, { id: Math.random() }));
        _this2.setState({ toasts: [toast].concat(_this2.state.toasts) });
        setTimeout(function () {
          _this2.setState({ toasts: _this2.state.toasts.filter(function (t) {
              return t.id !== toast.id;
            }) });
        }, data.timer || 3000);
      });

      var styles = {};
      switch (this.props.position) {
        case Container.POSITION.TOP_LEFT:
          styles.top = 10;
          styles.left = 10;
          break;
        case Container.POSITION.TOP_RIGHT:
          styles.top = 10;
          styles.right = 10;
          break;
        case Container.POSITION.TOP_CENTER:
          styles.top = 10;
          styles.left = '50%';
          styles.transform = 'translateX(-50%)';
          break;
        case Container.POSITION.BOTTOM_LEFT:
          styles.bottom = 10;
          styles.left = 10;
          break;
        case Container.POSITION.BOTTOM_RIGHT:
          styles.bottom = 10;
          styles.right = 10;
          break;
        case Container.POSITION.BOTTOM_CENTER:
          styles.bottom = 10;
          styles.left = '50%';
          styles.transform = 'translateX(-50%)';
          break;
        default:
          styles.bottom = 10;
          styles.right = 10;
          break;
      }
      this.setState({ styles: styles });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.store.unwatch(this.storeSubscription);
    }
  }, {
    key: '_renderContainer',
    value: function _renderContainer() {
      var style = this.props.lightBackground ? LightBackgroundColor : BackgroundColor;
      return _react2.default.createElement(
        Toasts,
        { style: this.state.styles },
        this.state.toasts.map(function (toast) {
          return _react2.default.createElement(
            Toast,
            {
              key: toast.id,
              className: 'toast toast-' + toast.status + ' ' + toast.classNames,
              style: style[toast.status]
            },
            toast.message
          );
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactDom2.default.createPortal(this._renderContainer(), document.body);
    }
  }]);

  return Container;
}(_react.Component);

Container.POSITION = {
  TOP_LEFT: "top_left",
  TOP_RIGHT: "top_right",
  BOTTOM_LEFT: "bottom_left",
  BOTTOM_RIGHT: "bottom_right",
  TOP_CENTER: "top_center",
  BOTTOM_CENTER: "bottom_center"
};


Container.propTypes = {
  store: _propTypes2.default.object.isRequired,
  position: _propTypes2.default.string
};

var ToastStore = exports.ToastStore = Store();
var ToastContainer = exports.ToastContainer = Container;