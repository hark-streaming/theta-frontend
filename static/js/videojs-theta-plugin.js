// i copied this from https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.js
// the function runs as soon as this file is loaded
// https://stackoverflow.com/questions/60365052/why-is-functionglobal-factory-used-in-so-many-js-libraries

/*! @name @theta/videojs-theta-plugin @version 0.0.0 @license UNLICENSED */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.videojsThetaPlugin = factory());
  }(this, (function () { 'use strict';
  
    function _extends() {
      _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
  
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
  
        return target;
      };
  
      return _extends.apply(this, arguments);
    }
  
    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      subClass.__proto__ = superClass;
    }
  
    function registerPlugin(Theta, Hls, videojs) {
      //TODO get dynamic version
      var VERSION = "0.0.0"; //TODO check all the depencies are here...
  
      var Tech = videojs.getTech('Tech');
      var Html5 = videojs.getTech('html5'); // Default options for the plugin.
  
      var defaults = {};
  
      var VideoJSThetaWalletWebSocketProvider = /*#__PURE__*/function (_Theta$WalletWebSocke) {
        _inheritsLoose(VideoJSThetaWalletWebSocketProvider, _Theta$WalletWebSocke);
  
        function VideoJSThetaWalletWebSocketProvider(config) {
          var _this;
  
          _this = _Theta$WalletWebSocke.call(this, config) || this;
          _this.onAccessToken = config.onAccessToken;
          return _this;
        } //Override getAuth to fetch our own short TTL access token first
  
  
        var _proto = VideoJSThetaWalletWebSocketProvider.prototype;
  
        _proto.getAuth = function getAuth() {
          var _this2 = this;
  
          return new Promise(function (resolve, reject) {
            _this2.onAccessToken().then(function (accessToken) {
              if (accessToken === null) {
                //No access token, try a non-authed call
                //TODO: is this smart or should the theta lib reject the call if it doesn't have an access token?
                resolve({});
              }
  
              resolve({
                //WebSocketProvider uses args instead of headers
                args: {
                  'access_token': accessToken
                }
              });
            });
          });
        };
  
        return VideoJSThetaWalletWebSocketProvider;
      }(Theta.WalletWebSocketProvider);
  
      function getDefaultThetaConfig() {
        return {
          fragmentSize: 5000,
          failoverFactor: 0.7,
          fragmentTimeout: 3000,
          probeTimeout: 600,
          statsReportInterval: 90000,
          peerReqInterval: 120000,
          peerServer: {
            host: "prod-theta-peerjs.thetatoken.org",
            port: 8700,
            secure: true
          },
          trackerServer: {
            host: "prod-testnet-grouping.thetatoken.org",
            port: 8700,
            secure: true,
            path: ""
          },
          debug: false
        };
      }
      /**
       * An advanced Video.js plugin. For more information on the API
       *
       * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
       */
      //TODO we should have different techs that support the Theta plugins (HLSjs only for now)
  
  
      var ThetaPlugin = /*#__PURE__*/function (_Html) {
        _inheritsLoose(ThetaPlugin, _Html);
  
        /**
         * Create a ThetaPlugin plugin instance.
         *
         * @param  {Player} player
         *         A Video.js Player instance.
         *
         * @param  {Object} [options]
         *         An optional options object.
         *
         *         While not a core part of the Video.js plugin architecture, a
         *         second argument of options is a convenient way to accept inputs
         *         from your plugin's caller.
         */
        function ThetaPlugin(player, options) {
          var _this3;
  
          // the parent class will add player under this.player
          _this3 = _Html.call(this, player) || this;
          _this3.options = videojs.mergeOptions(defaults, options); //this.theta_ = null;
  
          _this3.currentSource = null;
  
          _this3.on('toggleUseCDN', function () {
            try {
              Theta.toggleUseCDN();
            } catch (e) {
              console.log("Oops.  Could not toggle CDN");
            }
          });
  
          return _this3;
        }
  
        var _proto2 = ThetaPlugin.prototype;
  
        _proto2.dispose = function dispose() {
          _Html.prototype.dispose.call(this);
  
          this.currentSource = null;
  
          try {
            if (this.theta_) {
              this.theta_.destroy();
            }
          } catch (e) {
            console.log("Exception caught while destroying Theta.");
            console.error(e);
          }
        };
  
        _proto2.play = function play() {
          this.videoElement().play();
        };
  
        _proto2.pause = function pause() {
          this.videoElement().pause();
        };
  
        _proto2.videoElement = function videoElement() {
          return this.el();
        };
  
        _proto2.init = function init(src) {
          var _this$options_ = this.options_,
              onThetaReady = _this$options_.onThetaReady,
              onWalletAccessToken = _this$options_.onWalletAccessToken,
              walletUrl = _this$options_.walletUrl,
              videoId = _this$options_.videoId,
              userId = _this$options_.userId,
              thetaOpts = _this$options_.thetaOpts; //Create Wallet
  
          var wallet = this.initThetaWallet(walletUrl, onWalletAccessToken); //Create Theta
  
          this.theta_ = this.initTheta({
            wallet: wallet,
            videoId: videoId,
            userId: userId,
            thetaOpts: thetaOpts
          });
  
          if (onThetaReady && this.theta_) {
            onThetaReady(this.theta_);
          }
        };
  
        _proto2.initTheta = function initTheta(opts) {
          var wallet = opts.wallet,
              videoId = opts.videoId,
              userId = opts.userId,
              thetaOpts = opts.thetaOpts;
          var thetaConfig = getDefaultThetaConfig();
          thetaConfig['videoId'] = videoId;
          thetaConfig['userId'] = userId;
          thetaConfig['wallet'] = wallet;
          thetaConfig['allowGeoLocation'] = false;
  
          if (thetaOpts) {
            for (var prop in thetaOpts) {
              thetaConfig[prop] = thetaOpts[prop];
            }
          }
  
          return new Theta(thetaConfig);
        };
  
        _proto2.initThetaWallet = function initThetaWallet(walletURL, onWalletAccessToken) {
          if (!walletURL || !onWalletAccessToken) {
            return null;
          }
  
          var walletProvider = new VideoJSThetaWalletWebSocketProvider({
            url: walletURL,
            onAccessToken: onWalletAccessToken
          });
          var wallet = new Theta.Wallet({
            provider: walletProvider
          });
          wallet.start();
          return wallet;
        };
  
        ThetaPlugin.canPlaySource = function canPlaySource(source) {
          //Theta Plugins should override this method!
          return false;
        };
  
        ThetaPlugin.canPlayType = function canPlayType(type) {
          //Theta Plugins should override this method!
          return '';
        };
  
        ThetaPlugin.isSupported = function isSupported() {
          //Theta Plugins should override this method!
          return false;
        };
  
        _proto2.setSrc = function setSrc(src) {//Theta Plugins should override this method to start playing a new src!
        };
  
        _proto2.getTheta = function getTheta() {
          return this.theta_;
        };
  
        return ThetaPlugin;
      }(Html5);
  
      var ThetaHlsJsPlugin = /*#__PURE__*/function (_ThetaPlugin) {
        _inheritsLoose(ThetaHlsJsPlugin, _ThetaPlugin);
  
        /**
         * Create a ThetaPlugin plugin instance.
         *
         * @param  {Player} player
         *         A Video.js Player instance.
         *
         * @param  {Object} [options]
         *         An optional options object.
         *
         *         While not a core part of the Video.js plugin architecture, a
         *         second argument of options is a convenient way to accept inputs
         *         from your plugin's caller.
         */
        function ThetaHlsJsPlugin(player, options) {
          // the parent class will add player under this.player
          return _ThetaPlugin.call(this, player) || this;
        }
  
        var _proto3 = ThetaHlsJsPlugin.prototype;
  
        _proto3.dispose = function dispose() {
          _ThetaPlugin.prototype.dispose.call(this);
  
          if (this.hls_) {
            this.hls_.destroy();
            this.hls_ = null;
          }
        };
  
        _proto3.init = function init(src) {
          _ThetaPlugin.prototype.init.call(this, src);
  
          this.theta__ = this.theta; //HlsJS specific
  
          this.hls_ = this.initHlsjs(src, this.theta_);
        };
  
        _proto3.initHlsjs = function initHlsjs(videoURL, theta) {
          var hls = null;
          var videoEl = this.videoElement();
          var _this$options_2 = this.options_,
              autoplay = _this$options_2.autoplay,
              onStreamReady = _this$options_2.onStreamReady,
              onHls = _this$options_2.onHls;
  
          var ClosuredThetaLoader = /*#__PURE__*/function (_Theta$HlsJsFragmentL) {
            _inheritsLoose(ClosuredThetaLoader, _Theta$HlsJsFragmentL);
  
            function ClosuredThetaLoader() {
              return _Theta$HlsJsFragmentL.apply(this, arguments) || this;
            }
  
            var _proto4 = ClosuredThetaLoader.prototype;
  
            _proto4.load = function load() {
              var _Theta$HlsJsFragmentL2;
  
              // Inject context from closure.
              this.thetaCtx = theta;
  
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
  
              (_Theta$HlsJsFragmentL2 = _Theta$HlsJsFragmentL.prototype.load).call.apply(_Theta$HlsJsFragmentL2, [this].concat(args));
            };
  
            return ClosuredThetaLoader;
          }(Theta.HlsJsFragmentLoader);
  
          if (Hls.isSupported()) {
            var pluginHlsOpts = this.options_['hlsOpts'];
            var defaultHlsOpts = theta ? {
              fLoader: ClosuredThetaLoader,
              liveBackBufferLength: 30
            } : {};
  
            var hlsOpts = _extends({}, defaultHlsOpts, pluginHlsOpts);
  
            hls = new Hls(hlsOpts);
            hls.attachMedia(videoEl);
  
            if (onHls) {
              onHls(hls);
            }
  
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
              // load the stream
              hls.loadSource(videoURL);
              hls.on(Hls.Events.MANIFEST_PARSED, function (e) {
                if (onStreamReady) {
                  onStreamReady();
                }
  
                if (autoplay !== undefined) {
                  //Respect autoplay
                  this.player.autoplay(autoplay);
                }
              });
            });
          } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
            // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
            // This is using the built-in support of the plain video element, without using hls.js.
            // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
            // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
            videoEl.src = videoURL;
            videoEl.addEventListener('loadedmetadata', function () {
              if (autoplay === undefined) {
                //Play by default
                videoEl.play();
              } else {
                this.player.autoplay(autoplay);
              }
            });
          }
  
          return hls;
        };
  
        ThetaHlsJsPlugin.canPlaySource = function canPlaySource(source) {
          return source.type && /^application\/(?:x-|vnd\.apple\.)mpegurl/i.test(source.type) && Hls.isSupported();
        };
  
        ThetaHlsJsPlugin.canPlayType = function canPlayType(type) {
          if (/^application\/(?:x-|vnd\.apple\.)mpegurl/i.test(type)) {
            return 'probably';
          } else {
            //Cannot play this video type
            return '';
          }
        };
  
        ThetaHlsJsPlugin.isSupported = function isSupported() {
          return Hls.isSupported();
        };
  
        _proto3.setSource = function setSource(source) {
          var src = source.src;
          var currentSrc = this.currentSource ? this.currentSource.src : null;
  
          if (src === currentSrc) {
            console.log("Warning: the source is the same, safely ignoring...");
          } else if (this.hls_ === undefined || this.hls_ === null) {
            this.init(src);
            this.currentSource = source;
          } else {
            var videoEl = this.videoElement();
            videoEl.pause();
  
            if (this.hls_) {
              this.hls_.destroy();
            }
  
            this.hls_ = this.initHlsjs(src, this.theta_);
            this.currentSource = source;
          }
        };
  
        return ThetaHlsJsPlugin;
      }(ThetaPlugin); // Define default values for the plugin's `state` object here.
  
  
      ThetaPlugin.defaultState = {};
      ThetaHlsJsPlugin.defaultState = {}; // Include the version number.
  
      ThetaPlugin.VERSION = VERSION;
      ThetaHlsJsPlugin.VERSION = VERSION; // Register our Tech with videoJS
  
      Tech.registerTech('theta_hlsjs', ThetaHlsJsPlugin);
      videojs.options.techOrder.push('theta_hlsjs');
      // i added this log -kevin
        console.log("registering the theta plugin, techorder", videojs.options.techOrder);
    }
  
    if (window && window.Theta && window.Hls && window.videojs) {
      registerPlugin(window.Theta, window.Hls, window.videojs);
    }
  
    var plugin = {
      registerPlugin: registerPlugin
    };
  
    return plugin;
  
  })));