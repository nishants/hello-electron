(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.app = angular.module("crg", ['ui.router', 'ngDraggable']);
},{}],2:[function(require,module,exports){
app.directive("dropDown", [function () {

	return {
		restrict: "C",
		scope   : true,
		template: "<div class='dropdown-inner' ><div class='current' ng-click='dropdown.show(!dropdown.active)'><label class='value' ng-bind='dropdown.current.value' ng-show='dropdown.current.value'></label> <label class='placeholder' ng-bind='dropdown.name' ng-hide='dropdown.current.value'></label><div class='caret fa fa-chevron-down'></div></div><ul class='options'><li ng-repeat='option in dropdown.options' ng-bind='option.value' ng-click='dropdown.select(option)'></li><li ng-click='dropdown.clear()' ng-show='dropdown.reset' ng-bind='dropdown.reset'></li></ul></div>",
		link    : function (scope, element, attrs) {
			var dropdown = {
				name: attrs.name,
				active: false,
				reset: scope.$eval(attrs.reset) || attrs.reset,
				current: {
					value: scope.$eval(attrs.value)
				},
				options: scope.$eval(attrs.options),
				select: function (option) {
					dropdown.current.value = option.value;
					dropdown.show(false);
				},
				show: function(value){
					dropdown.active = value;
					value ? element.addClass("active") : element.removeClass("active");
				},
				clear: function(){
					dropdown.current = {value: null};
					dropdown.show(false);
				}
			};
			scope.dropdown = dropdown;

		}
	};
}]);
},{}],3:[function(require,module,exports){
app.run(["$rootScope", "stateMessages" ,function($rootScope, stateMessages){
	var state = {
			name				: "",
			loading     : null,
			message     : "Welcome Onboard !",
			error     	: null,
			loadingNext	: function(name, message){
				state.message = message;;
				state.loading = name;
				state.error   = null;
			},
			done   			: function(stateName){
				state.loading = null;
				state.message = null;
				state.name    = stateName;
			},
			failed: function(error){
				state.loading = null;
				state.message = null;
				state.error   = error;
			}
		},
		nameFor = function(state){
			return state.replace(/\./g, "-");
		};

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
		state.loadingNext(nameFor(toState.name), stateMessages[toState.name]);
	});

	$rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){
		state.failed("Unknown Error");
	});

	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
		state.failed("Unknown Error");
    console.log(error);
	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		state.done(nameFor(toState.name));
	});

	$rootScope.state = state;
}]);
},{}],4:[function(require,module,exports){
app.factory("Throttle", ["$timeout", function ($timeout) {
  return function (time) {
    var throttle = {
      timeout: undefined,
      work: function(){},
      push: function (work) {
        throttle.clear();
        throttle.work     = work;
        throttle.timeout  = setTimeout(throttle.flush, time);
      },
      clear: function(){
        clearTimeout(throttle.timeout);
      },
      flush: function(){
        throttle.work();
      },
    };
    return throttle;
  };
}]);
},{}],5:[function(require,module,exports){
app.directive("typewriter",["TYPING_SPEED", "$timeout", function(typingSpeed, $timeout){
  return {
    restrict: "C",
    scope   : false,
    link: function(scope, element, attrs){
      if(attrs.text){
        var $e    = $(element),
            speed = parseInt(attrs.typingSpeed) || typingSpeed,
            timer,
            stopTimer = function(){
              clearInterval(timer);
            },
            type = function(){
              var nextLetter = $e.find(".letter:not(.display)").first();
              nextLetter.length ? $(nextLetter).addClass("display")  : stopTyping();
            },
            setText= function(text){
              var letters = text.split(""),
                  toLetterElement = function(letter){
                    return "<span class='letter'>{{letter}}</span>".replace("{{letter}}", letter.trim().length ? letter : '&nbsp;' );
                  },
                  element = letters.map(toLetterElement).join("\n");
              $e.html(element);
            },
            startTyping = function(){
              stopTimer();
              setText(scope.$eval(attrs.text));
              attrs.beforeTyping && scope.$eval(attrs.beforeTyping);
              timer = setInterval(type, speed);
            },
            stopTyping = function(){
              $timeout(function(){
                attrs.afterTyping && scope.$eval(attrs.afterTyping);
              });
              stopTimer();
            },
            clear = function(){
              setText("");
              stopTimer();
              $e.addClass("no-show");
            };
        scope.$watch(attrs.text, function(text){
          text ? startTyping() : clear();
        });
      }
    }
  };
}])

},{}],6:[function(require,module,exports){
app.directive("viewportSafariFix",["$timeout", function($timeout){
  return {
    restrict: "C",
    scope   : false,
    link: function(scope, element, attrs){
      var fixViewport = function () {
        var viewPortHeight = $(window).innerHeight() - 20;
        $(element).height(viewPortHeight);
      };
      if(window.safari !== undefined){
        $(window).on("resize",fixViewport);
        $(window).trigger("resize");
      }
    }
  };
}]);
},{}],7:[function(require,module,exports){
app.value("remote", "https://findfalcone.herokuapp.com");
app.value("requestConfig", {headers: {Accept: "application/json", "Content-Type": "application/json"}});

},{}],8:[function(require,module,exports){
app.directive("maskPhrase", [function(){

  return {
    restrict : "C",
    scope    : false,
    link     : function(scope, element, attrs){
      var phrase = scope.$eval(attrs.phrase),
          phraseElements = phrase.indices.map(function(wordIndex){
            return $(".word[data-word-number=<word-index>]".replace("<word-index>", wordIndex))
          }),
          maskDimensions = function(phraseElements){
            var first = phraseElements[0],
                firstPosition = first.position(),
                inlineWidth   = 0;
            phraseElements.forEach(function(word){
              inlineWidth += word.outerWidth()
            });
            return {
              top   : firstPosition.top,
              left  : firstPosition.left,
              height: first.outerHeight(),
              width : inlineWidth,
            };
          },
          applyMask = function($element, mask){
            $element.css("top",     "<top>px".replace("<top>", mask.top));
            $element.css("left",    "<left>px".replace("<left>", mask.left));
            $element.css("height",  "<height>px".replace("<height>", mask.height));
            $element.css("width",   "<width>px".replace("<width>", mask.width));
          };

      $(window).on("resize", function(){
        applyMask($(element), maskDimensions(phraseElements));
      });
      $(window).trigger("resize");
    }
  };
}]);
},{}],9:[function(require,module,exports){
app.factory("Passage", [function () {
  var toSelectableNodes = function(paragraphs){
        var nodes = [];
        for(var i =0; i < paragraphs.length; i++){
          var words = paragraphs[i].split(" ");
          for(var j =0; j < words.length; j++){
            nodes.push({text: words[j]});
          }
          nodes.push({text: '', linebreak: true});
        }
        return nodes;
      };

  return function(passage){
    return {
      from  : passage.from,
      by    : passage.by,
      words : toSelectableNodes(passage.text.split("\n"))
    };
  };
}]);
},{}],10:[function(require,module,exports){
app.service("UserActionLogService", [function(){

  var service = {
    log: [],
    reset: function(){
      service.log = [];
    },
    logButton: function(sceneId, buttonId){
      service.log.push({
        time    : (new Date()).getTime(),
        type    : "button",
        sceneId : sceneId,
        name    : buttonId,
      });
      console.log(sceneId+"."+buttonId);
    },
    getAction : function(sceneId, name){
      return service.log.filter(function(log){
        return log.sceneId == sceneId && log.name == name;
      })[0];
    }
  };
  return service;
}]);
},{}],11:[function(require,module,exports){
app.directive("videoPlayer", [ "VideoPlayerService", function(VideoPlayerService){

  return {
    restrict : "A",
    scope    : true,
    link     : function(scope, element, attrs){
      var videoEnded = function(){
            scope.$eval(attrs.afterVideo);
          };
      var resetVideo = function(){
        var $e = $(element),
            videoElement = $e.find("video")[0]
        $e.addClass("no-video");
        videoElement && videoElement.pause();
      };

      var setVideo = function (video) {
        var thumbnail = scope.game.player.chat.agent.videoThumbnail,
            videoTemplate = '<video width="100%"><source ></video><div class="no-video-place-holder"><img src="<video-thumbnail>"></div>';
        $(element).html('');
        $(element).html(videoTemplate.replace("<video-thumbnail>", thumbnail));

        var $e = $(element),
            videoType = video.type,
            $video = $e.find("video"),
            videoElement = $video[0];

        $video.find("source").attr("src", video.url)
        $video.find("source").attr("type", videoType)

        if (video.url.length) {
          $video.on("ended", videoEnded);
          $e.removeClass("no-video");
          videoElement.play();
        } else {
          resetVideo()
        }
      };
      VideoPlayerService.onVideoLoad(setVideo)
      VideoPlayerService.onStop(resetVideo)
    }
  };
}]);
},{}],12:[function(require,module,exports){
app.service("VideoPlayerService", ["CRGGameService", "$rootScope",function (game, $rootScope) {
  var videoPlayer = {
    pendingVideo: null,
    loadVideo : null,
    onStop: function (callback) {
      videoPlayer.stopVideo = callback;
    },
    onVideoLoad: function (callback) {
      videoPlayer.loadVideo = callback;
      if(videoPlayer.pendingVideo){
        videoPlayer.loadVideo(videoPlayer.pendingVideo);
      }
    },
    play: function (video) {
      if(videoPlayer.loadVideo){
        videoPlayer.loadVideo(video);
      } else{
        videoPlayer.pendingVideo = video;
      }
    },
    stop: function(){
      videoPlayer.stopVideo && videoPlayer.stopVideo();
    }
  };
  return videoPlayer;
}]);
},{}],13:[function(require,module,exports){
app.factory("CRGDataService", ["$http", "SceneLoader",function ($http, SceneLoader) {
  var
      labelFor = function(scene){
        return SceneLoader[scene.name].label;
      },
      setScene = function(scene){
        scene.label = labelFor(scene)
        return scene;
      };
  return {
    getGame: function(id){
      var url = "assets/data/crg/crg-sample-game-data-<id>.json".replace("<id>", id);
      return $http.get(url).then(function(response){
        response.data.script.scenes = response.data.script.scenes.map(setScene);
        return response.data;
      })
    }
  };
}]);
},{}],14:[function(require,module,exports){
require("./components/passage/passage");
require("./components/passage/drag-drop-relations/drag-drop-relations");
require("./components/video-player-directive");
require("./components/video-player-service");
require("./components/user-action-log-service");

require("./player/crgameplay");
require("./editor/crg-editor");
require("./scenes/scenes");
require("./crg-data-service");

},{"./components/passage/drag-drop-relations/drag-drop-relations":8,"./components/passage/passage":9,"./components/user-action-log-service":10,"./components/video-player-directive":11,"./components/video-player-service":12,"./crg-data-service":13,"./editor/crg-editor":17,"./player/crgameplay":25,"./scenes/scenes":49}],15:[function(require,module,exports){
app.controller('CRGEditorController', ['$scope', '$timeout', 'CRGEditorService', function ($scope, $timeout, CRGEditorService) {
  var editor  = CRGEditorService;

  $scope.onTextSelect = function(indexes){
    $timeout(function(){
      var selectedText = indexes.map(function (index) {
        return editor.passageSelector.passage.words[index].text;
      }).join(" ")

      editor.passageSelector.selection.onTextSelect(indexes, selectedText);
    });
  };

  $scope.editor = editor;
}]);
},{}],16:[function(require,module,exports){
app.factory("CRGEditorService", ["Passage", "PassageSelector", "SceneGroups", "$state", function (Passage, PassageSelector, SceneGroups, $state) {
  var findScene = function(name){
    return function(scene){
      return scene.name == name;
    };
  };
  var sceneGroups = Object.keys(SceneGroups).map(function(group){
    return {
      name: group,
      label: SceneGroups[group].label,
      subgroups: SceneGroups[group].subgroups
    };
  });
  var editorService = {
        gameId: null,
        script: {
          scenes: []
        },
        passage: {
          to: null,
          from: null,
          text: null,
        },
        sceneGroups: sceneGroups,
        previewing: [],
        setGameToEdit: function(gameData){
          editorService.script.gameId   = gameData.id;
          editorService.script.scenes   = gameData.script.scenes;
          editorService.passage         = gameData.passage;
          editorService.agent           = gameData.agent;
          editorService.passageSelector =  PassageSelector(Passage(editorService.passage));
        },
        prepareGamePlan : function(scenes){
          var exitScene = editorService.script.scenes.filter(findScene("exit"))[0];
          var previewScenes = scenes ? scenes.concat(exitScene) : null,
              gameData      = JSON.parse(JSON.stringify({
            passage : editorService.passage,
            agent   : editorService.agent,
            script  : {scenes: previewScenes || editorService.script.scenes}
          }));
          return gameData;
        },
        previewScene: function(scene){
          editorService.previewing = [scene];
          $state.go("crg.editor.preview-scenes");
        },
        addScene: function(scene){
          var index = editorService.script.scenes.length - 1;
          editorService.script.scenes.splice(index, 0, scene);
        },
        removeScene: function(sceneToRemove){
          editorService.script.scenes = editorService.script.scenes.filter(function(scene){
            return sceneToRemove !== scene;
          });
        },
        publish: function(){
          console.log(JSON.stringify(editorService.script));
        },
       passageSelector: null
  };
  return editorService;
}]);
},{}],17:[function(require,module,exports){
require('./crg-editor-controller');
require('./preview/crg-preview-controller');
require('./crg-editor-service');
require('./passage-selector');
},{"./crg-editor-controller":15,"./crg-editor-service":16,"./passage-selector":18,"./preview/crg-preview-controller":19}],18:[function(require,module,exports){
app.factory("PassageSelector", ["passageSelectorHeadings", function (passageSelectorHeadings) {
  var scrollTime = 500,
      scrollBackOffset = 200,
      scrollTo = function(position, then){
        $("html, body").stop().animate({scrollTop:position}, scrollTime, 'swing', then || function(){});
      },
      currentScrollPosition = function(){
        return $(window).scrollTop();
      },
      resetSelection = function(){
        window.getSelection().empty();
      };
  return function(passage){
    var passageSelector = {
      selecting: false,
      lastScrollOffset: 0,
      passage: passage,
      selection: {
        current: {text: '', indices: []},
        selectingFocus: false,
        selectingPhrase: false,
        focus: {text: '', indices: []},
        phrase: {text: '', indices: []},
        selectFocus: function () {
          passageSelector.selection.selectingFocus = true;
          passageSelector.selection.selectingPhrase = false;
          passageSelector.heading = passageSelectorHeadings.focus;
        },
        selectPhrase: function () {
          passageSelector.selection.selectingFocus = false;
          passageSelector.selection.selectingPhrase = true;
          passageSelector.heading = passageSelectorHeadings.highlight;
          resetSelection();
        },
        setFocus: function () {
          passageSelector.selection.focus = passageSelector.selection.getTextSelection();
          angular.forEach(passageSelector.passage.words,function(word,index){
            word.focus = passageSelector.selection.focus.indices.indexOf(index) > -1;
          });
          passageSelector.doneSelecting(
              passageSelector.selection.focus
          );
        },
        setPhrase: function () {
          passageSelector.selection.phrase = passageSelector.selection.getTextSelection();
          passageSelector.doneSelecting(
              passageSelector.selection.focus,
              passageSelector.selection.phrase
          );
        },
        onTextSelect: function (indices, text) {
          passageSelector.selection.current.indices = indices.map(function(index){return parseInt(index);});
          passageSelector.selection.current.text = text;
        },
        getTextSelection: function () {
          return {
            indices: passageSelector.selection.current.indices,
            text: passageSelector.selection.current.text
          };
        }
      },
      whenDone: function () {
      },
      reset: function () {
        passageSelector.lastScrollOffset = 0;
        passageSelector.selecting = false;
        passageSelector.whenDone = function () {};
        passageSelector.selection.focus = {text: '', indices: []};
        passageSelector.selection.phrase = {text: '', indices: []};
        passageSelector.selection.selectingFocus = false;
        passageSelector.selection.selectingPhrase = false;
        passageSelector.heading = null;
        angular.forEach(passageSelector.passage,function(word){
          word.focus = false;
          word.highlight = false;
        });
        resetSelection();
      },

      selectFocusFromPassage: function (params) {
        passageSelector.lastScrollOffset = currentScrollPosition();
        scrollTo(0);
        passageSelector.selecting = true;
        passageSelector.whenDone = params.whenDone;
        passageSelector.selection.selectFocus();
      },

      selectHighlightFromPassage: function (params) {
        passageSelector.lastScrollOffset = currentScrollPosition();
        scrollTo(0);
        passageSelector.selecting = true;
        passageSelector.selection.focus = params.focus || passageSelector.selection.focus;
        passageSelector.whenDone = params.whenDone;
        passageSelector.selection.selectPhrase();
      },

      doneSelecting: function (focus, phrase) {
        passageSelector.whenDone({
          focus: focus,
          phrase: phrase
        });
        scrollTo(passageSelector.lastScrollOffset + scrollBackOffset);
        passageSelector.reset();
      }
    }
    return passageSelector;
  };
}]);
},{}],19:[function(require,module,exports){
app.controller('CRGPreviewController', [function () {
  window.scrollTo(0,0);
}]);
},{}],20:[function(require,module,exports){
app.directive("scrollToBottomOnResize", [function(){

  return {
    restrict : "A",
    scope    : false,
    link     : function(scope, element, attrs){

      var
          scrollToBottom = function () {
            var $chatHistory = $(".chat-history")
            $chatHistory.stop().animate({scrollTop: $chatHistory[0].scrollHeight}, 100, 'swing', function () {
            });
          },
          resize = function () {
            var $dialogues         = $(".chat-history"),
                inputHeight        = $(".console-user-input").height();

            $dialogues.css("padding-bottom",inputHeight);
          },
          updateChatHistory = function (ready) {
            resize();
            scrollToBottom();
          };

      scope.$watch("game.player.chat.input.ready", updateChatHistory);
      $('.console-user-input').bind("DOMSubtreeModified",updateChatHistory);
    }
  };
}]);
},{}],21:[function(require,module,exports){
app.controller('CRGameplayController', ['$scope', '$timeout', 'CRGPlayer', 'CRGGameService', 'gamePlan', function ($scope, $timeout, CRGPlayer, CRGGameService, gamePlan) {

  var game    = CRGGameService;

  $scope.onTextSelect = function(indexes){
    $timeout(function(){
      game.selectedText = indexes.map(function (index) {
        return game.player.passage.words[index].text;
      }).join(" ");
      game.player.onTextSelection({indices: indexes, text: game.selectedText});
    });
  };

  $scope.onTextSelectTouch = function(indexes){
    $timeout(function(){
      game.selectedText = indexes.map(function (index) {
        return game.player.passage.words[index].text;
      }).join(" ");
      var selection = {indices: indexes, text: game.selectedText};
      game.player.onTextSelection(selection);
      game.player.submitText(selection);
    });
  };

  $scope.game = game;
}]);
},{}],22:[function(require,module,exports){
app.service("CRGGameScript", ["SceneLoader", "$injector", "SceneGroups", function (SceneLoader, $injector, SceneGroups) {

  var
      getSceneLoader = function(name){
        return $injector.get(SceneLoader[name].entry);
      },
      groupName = function(scene){
        return scene.config.group;
      },
      uniqueGroups = function(element, index, allGroups){
        return index == allGroups.indexOf(element);
      },
      toGroup=  function(groupName){
        var sceneGroup = SceneGroups[groupName];
        return {
          name: groupName,
          label: sceneGroup.label
        };
      };

  var
      script = {
        scenes    : [],
        sceneIndex: -1,
        next: function(){
          var nextScene = script.scenes[script.sceneIndex++];
          return getSceneLoader(nextScene.name)(nextScene.config);
        },
        load: function(scriptData){
          script.scenes     = scriptData.scenes;
          script.sceneIndex = 0;
        },
        getGroups: function(){
          return script.scenes.map(groupName).filter(uniqueGroups).map(toGroup);
        }
      };
  return script;
}]);
},{}],23:[function(require,module,exports){
app.factory("CRGGameService", [function () {
  var game = {
    player: null
  };
  return game;
}]);
},{}],24:[function(require,module,exports){
app.service("CRGPlayer", ["CRGGameScript", "Passage", "VideoPlayerService", "SceneGroups", "$timeout",function (CRGGameScript, Passage, VideoPlayerService, SceneGroups, $timeout) {
  var FLASH_TIMEOUT = 3000,
      user  = {
        type : "user",
        image: "assets/images/anonymous.png",
      },
      agent = {
        type : "agent",
        image: null,
        videoThumbnail: null,
      },
      resetSelection = function(){
        window.getSelection().empty();
      };
  var player = {
    points: 10,
    sound: true,
    input: '',
    typing: true,
    selectedText: null,
    passage: null,
    subgroups: [],
    groups: [],
    mode: {chat: false},
    video: {
      url: '',
      type: '',
      fullscreen: false,
      whenDone: function(){},
      ended: function(){
        $timeout(function(){
          player.video.whenDone();
        });
      },
      play: function(video){
        player.video.url  = video.url;
        player.video.type = video.type;
        player.video.fullscreen = video.fullscreen;
        player.video.canSkip    = video.canSkip;

        VideoPlayerService.stop();
        VideoPlayerService.play(video);
        return {
          then: function(callback){
            player.video.whenDone = callback;
          }
        };
      },
      stop: function(){
        VideoPlayerService.stop();
      }
    },
    chat: {
      agent: agent,
      user: user,
      dialogues: [],
      input: {
        ready: false,
      },
      reset: function(){
        player.chat.dialogues = [];
        player.chat.input.ready = false;
      },
      add: {
        fromUser: function(text){
          player.chat.dialogues.push({
            sender: player.chat.user,
            text  : text,
          });
        },
        fromAgent: function(text){
          player.chat.dialogues.push({
            sender: player.chat.agent,
            text  : text
          });
        },
      },
    },
    exit: function(){
      window.history.back();
    },
    load: function(gameData){
      player.passage = Passage(gameData.passage);
      player.chat.agent.image = gameData.agent.smallProfilePicture;
      player.chat.agent.videoThumbnail = gameData.agent.videoPlaceholder;
      CRGGameScript.load(gameData.script);
      player.groups = CRGGameScript.getGroups();
      player.start();
    },
    reset: function(){
      resetSelection();
      player.input = '';
      player.chat.input.ready = false;
      player.video.stop();
      player.video.url = "";
      player.video.type = "";
      player.video.fullscreen = false;
    },
    transitTo: function(state){
      player.reset();
      player.state = state;
      player.setHighlightText(state.highlightPhrase);
      player.setFocusText(state.focusPhrase);
      player.subgroups = SceneGroups[state.group].subgroups;
      state.load();
    },
    state: null,
    setFocusText: function(phrase){
      angular.forEach(player.passage.words, function(word, index){
        word.focus = phrase.indices.indexOf(index) > -1;
      });
    },
    setHighlightText: function(phrase){
      angular.forEach(player.passage.words, function(word, index){
        word.highlight = phrase.indices.indexOf(index) > -1;
      })
    },
    onTextSelection: function(phrase){
      if(player.state.onTextSelection){
        player.state.onTextSelection(phrase);
      }
    },
    submitText: function(phrase){
      if(player.state.submitTextSelection){
        player.state.submitTextSelection(phrase);
      }
      resetSelection();
    },
    resetSelection: function(){
      window.getSelection().empty();
    },
    flashHighlight: function(phrase, retain){
      player.resetSelection();
      angular.forEach(phrase.indices, function(wordIndex){
        player.passage.words[wordIndex].flash = true;
      });
      if(!retain){
       $timeout(function(){
         angular.forEach(phrase.indices, function(wordIndex){
           player.passage.words[wordIndex].flash = false;
         });
       },FLASH_TIMEOUT);
      }
    },
    toNextScene: function(){
      player.transitTo(CRGGameScript.next());
    },
    start: function(){
      player.toNextScene();
    }
  };
  return player;
}]);
},{}],25:[function(require,module,exports){
require('./crg-game-service');
require('./crg-game-controller');
require('./phrase-selector');
require('./selection-pointer');
require('./crg-player-service');
require('./crg-game-script');
require('./chat-window/chat-history/scroll-bottom-on-resize');
},{"./chat-window/chat-history/scroll-bottom-on-resize":20,"./crg-game-controller":21,"./crg-game-script":22,"./crg-game-service":23,"./crg-player-service":24,"./phrase-selector":26,"./selection-pointer":27}],26:[function(require,module,exports){
app.directive("phraseSelector", ["Throttle", function (Throttle) {
  var getSelectionText = function (){

    var selection = window.getSelection();
    if(!selection || selection.type == 'None'){
      return [];
    }
    var
        range     = selection.getRangeAt(0),
        elements  = range.cloneContents().children ,
        node      = [];

    if(!elements.length){
      elements = [selection.anchorNode.parentElement];
    }
    for(var i = 0; i < elements.length; i++){
      node.push(angular.element(elements[i]).attr('data-word-number'))
    }
    return node.filter(function(index){return index !=undefined ;});
  };

  return {
    restrict: "C",
    scope   : true,
    link    : function (scope, element, attrs) {
      var
          throttle = Throttle(2000),
          selectForTouch = function (selections) {
            throttle.push(function(){
              scope.$selection.indices = selections;
              scope.$eval(attrs.onTextSelectTouch);
            });
          },
          setTouchMenu = function(selections){
            scope.$selection.indices = selections;
            scope.$eval(attrs.onTextSelect);
          },
          isTouchDevice = function(selections){
            return $("html").hasClass("touch");
          },
          highlightSelected = function () {
            var selections = getSelectionText();
            $("[data-word-number]").removeClass("selected-word");
            selections.forEach(function(dataWordNumber){
              var selector = "[data-word-number='<number>']".replace('<number>', dataWordNumber);
              $(selector).addClass("selected-word");
            });
            isTouchDevice() ?  selectForTouch(selections) : setTouchMenu(selections);
          };
      document.addEventListener("selectionchange", highlightSelected, false);
      scope.$selection = {indices: []};
    }
  };
}]);


},{}],27:[function(require,module,exports){
app.directive("selectionPointer", [function () {

  return {
    restrict: "C",
    scope   : false,
    link    : function (scope, element, attrs) {
      scope.$watch("$selection.indices", function(indices){
        if(indices.length){
          var firstSelectedWord = $(element).find("[data-word-number='<index>']".replace('<index>', indices[0])),
              wordHeight = 25,
              y = firstSelectedWord.position().top - wordHeight,
              x = firstSelectedWord.position().left;

          $(element).find(".selection-options").css("transform", "translateX(<x>px) translateY(<y>px)".replace('<x>', x).replace('<y>',y ));
        }else{
          $(element).find(".selection-options").css("transform", "scale(0)");
        }

      }, true);
    }
  };
}]);


},{}],28:[function(require,module,exports){
app.directive("setFocus", ['CRGEditorService', function(CRGEditorService){

  return {
    restrict : "A",
    scope    : false,
    link     : function(scope, element, attrs){
      element.on("click", function(){
        CRGEditorService.passageSelector.selectFocusFromPassage({
          whenDone: function(selection){
            scope.scene.config.focus = selection.focus;
          }
        })
      });
    }
  };
}]);
},{}],29:[function(require,module,exports){
app.directive("setHighlight", ['CRGEditorService', function(CRGEditorService){

  return {
    restrict : "A",
    scope    : false,
    link     : function(scope, element, attrs){
      element.on("click", function(){
        CRGEditorService.passageSelector.selectHighlightFromPassage({
          focus : scope.scene.config.phrase,
          whenDone: function(selection){
            scope.scene.config.phrase = selection.phrase;
          }
        })
      });
    }
  };
}]);
},{}],30:[function(require,module,exports){
app.directive("addKeyImage", ['CRGEditorService', function(CRGEditorService){

  return {
    restrict : "A",
    scope    : false,
    link     : function(scope, element, attrs){
      element.on("click", function(){
        CRGEditorService.passageSelector.selectHighlightFromPassage({
          whenDone: function(selection){
            scope.keyImage.phrase = selection.phrase;
          }
        })
      });
    }
  };
}]);
},{}],31:[function(require,module,exports){
app.factory("BaseScene", ["CRGGameService", "UserActionLogService", "$q", function (game, UserActionLogService, $q) {
  return function(scene, config){
    scene.sceneId           = scene.sceneId;
    scene.group             = config.group;
    scene.subgroup          = config.subgroup;
    scene.showInput         = scene.showInput;

    scene.highlightPhrase   = scene.highlightPhrase || {indices: []};
    scene.focusPhrase       = scene.focusPhrase     || {indices: []};
    scene.transcript        = scene.transcript      || {text: ""};
    scene.submitInput       = scene.submitInput     || function(userInput){};
    scene.load              = function(){
      if(config.condition){
        var condition   = config.condition,
            savedAction = UserActionLogService.getAction(condition.sceneId, condition.action),
            skip        = !(!!savedAction == !!condition.expected);
        if(skip)  {
          scene.toNextScene();
          return;
        }
      }
      scene._loadTime        = (new Date()).getTime();
      if(config.sceneLoadVideo){
        scene.playVideo(config.sceneLoadVideo).then(function(){
          scene._videoEndedAt   = (new Date()).getTime();
          if(scene.afterVideo){
            scene.afterVideo();
          }
        });
      }
    };

    scene.showTextSelectionHelp   = scene.showTextSelectionHelp;
    scene.textSelectedIsClose     = scene.textSelectedIsClose;
    scene.drag          = null;
    scene.dragRelations = scene.dragRelations || [];

    scene.dropBoxes  = scene.dropBoxes || [];
    scene.playVideo = function(video){
      game.player.video.stop();
      scene.playTranscript(video.transcript);
      var onVideoEnd = $q.defer();
      game.player.video.play(video).then(function(){
        scene.agentSaid(video.transcript);
        scene.clearTranscript();
        onVideoEnd.resolve(video);
      });
      return onVideoEnd.promise;
    };
    scene.toNextScene = function(){
      game.player.toNextScene();
    };

    scene.highlight = function(phrase){
      scene.highlightPhrase = phrase;
      game.player.setHighlightText(scene.highlightPhrase);
    };

    scene.clearTranscript = function(){
      scene.transcript = {text: ""};
    };
    scene.playTranscript = function(text){
      scene.transcript = {text: text};
    };
    scene.setButtons = function(buttons){
      scene.buttons = buttons.map(function(button){
        return {
          label: button.label,
          onClick: function(){
            UserActionLogService.logButton(scene.sceneId, button.label)
            button.onClick();
          }
        };
      })   ;
    };
    scene.userSaid = function(text){
      game.player.chat.add.fromUser(text);
    };
    scene.agentSaid = function(text){
      game.player.chat.add.fromAgent(text);
    };
    scene.transitTo = function(state){
      game.player.transitTo(state);
    };
    scene.setButtons(scene.buttons|| []);
    return scene;
  };
}]);
},{}],32:[function(require,module,exports){
app.service("DragDropTextEditor", ['SceneLoader', function (SceneLoader) {

  var editor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "drag-drop-text",
            label         : SceneLoader["drag-drop-text"].label,
            "config"      : {
              "group"       : group,
              "phrase": {"indices": [], "text"  : ""},
              "focus": {"indices" : [], "text"  : ""},
              "transcript": {"text"    : ""},
              "options": []
            }
          };
        }
      };
  return editor;
}]);
},{}],33:[function(require,module,exports){
app.factory("DragDropTextState", ["CRGGameService", "BaseScene", function ( game, BaseScene) {
  return function (config) {
    var state = {
      transcript     : config.transcript,
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
      dragText       : null,
      dragTarget     : null,
      dragRelations  : config.relations,
      draggingRelation   : null,
      expectedCorrectAnswers : config.expectedCorrectAnswers || config.relations.length,
      answeredCorrect : 0,
      wrongAttemptsAllowed: config.wrongAttemptsAllowed || config.wrongAttemptMessages.length || 0,
      wrongAttempts   : 0,
      draggingText   : function(relation){
                        state.draggingRelation = relation;
                       },
      droppedTextOnRelation: function(relation){
        var correctDrop = relation.droppable.indices.join() == state.draggingRelation.droppable.indices.join();
        correctDrop ? state.correctlyDroppedText(relation): state.wrongTextDropped(relation);
      },
      correctlyDroppedText: function(relation){
        var noneLeft = ++state.answeredCorrect == state.expectedCorrectAnswers;
        state.userSaid(relation.droppable.text);
        state.highlight(relation.droppable);
        noneLeft && state.endState();
      },
      wrongTextDropped: function(relation){
        var noAttemptLeft = (++state.wrongAttempts ==  state.wrongAttemptsAllowed),
            video =  config.wrongAttemptMessages[(state.wrongAttempts -1)%config.wrongAttemptMessages.length];
        if(video){
          state.playVideo(video).then(function(){
            noAttemptLeft && state.endState();
          });
        } else {
          noAttemptLeft && state.endState();
        }
      },
      endState: function(){
        state.showResult();
        if(config.onFinish){
          state.playVideo(config.onFinish).then(function(){
            state.toNextScene();
          });
        }else{
          state.toNextScene();
        }
      },
      showResult: function(){
        var draggables = [].concat.apply([], config.relations.map(function(relation){
              return relation.draggable.indices;
            })),
            dropppables = [].concat.apply([], config.relations.map(function(relation){
              return relation.droppable.indices;
            }));

        state.highlight({indices: draggables.concat(dropppables)})
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],34:[function(require,module,exports){
app.service("DragDropEditor", ['SceneLoader', function (SceneLoader) {

  var editor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "drag-drop",
            label         : SceneLoader["drag-drop"].label,
            "config"      : {
              "group"       : group,
              "phrase": {"indices": [], "text"  : ""},
              "focus": {"indices" : [], "text"  : ""},
              "transcript": {"text"    : ""},
              "options": []
            }
          };
        }
      };
  return editor;
}]);
},{}],35:[function(require,module,exports){
app.factory("DragDropState", ["CRGGameService", "BaseScene", function ( game, BaseScene) {
  return function (config) {
    var transcript = config.transcript.text || "";
    var state = {
      transcript: {text: transcript},
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
      dropBoxes      : [
                        {
                          label: "Drag and drop your answer here",
                          onDrop: function(){
                            window.getSelection().empty();
                            setTimeout(function(){
                              alert("Got it !");
                            },500);
                          },
                        }
                      ],
      onTextSelection   : function(selectedPhrase){
        state.drag = selectedPhrase;
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],36:[function(require,module,exports){
app.factory("ExitGameState", ["BaseScene", function (BaseScene) {
  return function (config) {
    var state = {
      showInput: false,
      buttons: [{
        label: "Exit",
        onClick: function(){
          window.history.back();
        },
      }],
      transcript: {text: "End of game."},
      highlightPhrase: {indices: []},
      focusPhrase    : {indices: []},
    };

    return BaseScene(state, config);
  };
}]);
},{}],37:[function(require,module,exports){
app.service("FindPhraseSceneEditor", ['SceneLoader', function (SceneLoader) {

  var findPhraseEditor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "find-phrase",
            label         : SceneLoader["find-phrase"].label,
            "config":       {
              "transcript" : {"text": ""},
              "expectedCorrectAnswers" : 1,
              placeholder         : 'Select text form passage',
              "findMoreMessage": "Carry on. Find <selections-left> more.",
              "minimumSelectedMessage" : "Well done! However, we found <more-options> more.",
              "keyImages": []
            }
          };
        }
      };
  return findPhraseEditor;
}]);
},{}],38:[function(require,module,exports){
app.factory("FindPhrase", ["BaseScene", function ( BaseScene) {

  var phraseId = function(phrase){
        return phrase.indices.join("-");
      },
      optionId = function (options) {
        var indexed = {};
        options.forEach(function (option) {
          indexed[phraseId(option.phrase)] = option;
        });
        return indexed;
      },
      MIN_SELECTION_DISTANCE = 0.66,
      selectionDistance = function(selection, expectedPhrase){
        var common = selection.indices.filter(function(index){
          return expectedPhrase.indices.indexOf(parseInt(index)) > -1;
        });
        return common;
      },
      findCloseMatch = function(selected, options, min_match){
        var match = null;
        options.forEach(function(option){
          var commonChars = selectionDistance(selected, option.phrase),
              matches     = commonChars.length/option.phrase.indices.length > min_match;
          match = matches ? option : match;
        });
        return match;
      };
  return function (config) {
    var state = {
      highlightPhrase     : config.phrase,
      focusPhrase         : config.focus,
      transcript          : {text : config.sceneLoadVideo.transcript},
      selectingText       : true,
      disabledSelection   : false,
      correctOptions      : optionId(config.correctOptions),
      partialCorrectOptions: optionId(config.partialCorrectOptions),
      wrongAttemptLeft     : config.wrongAttemptsAllowed,
      expectedCorrectAnswers     :  config.expectedCorrectAnswers || config.correctOptions.length,
      onTextSelection   : function(selectedPhrase){
        !state.disabledSelection && (state.selectingText = true);
      },
      submitTextSelection: function(selectedPhrase){
        var correctOption         = state.correctOptions[phraseId(selectedPhrase)],
            partialCorrectOption  = state.partialCorrectOptions[phraseId(selectedPhrase)],
            closeMatch             = (correctOption || partialCorrectOption) ? null : findCloseMatch(selectedPhrase, config.correctOptions, MIN_SELECTION_DISTANCE);
        state.selectingText = false;
        if(!!correctOption){
          state.onCorrectSelection(correctOption);
        } else if(!!partialCorrectOption){
          state.onPartialCorrectSelection(partialCorrectOption);
        } else if(closeMatch){
          state.onCorrectSelection(closeMatch);
        }else{
          state.onWrongAttempt(selectedPhrase);
        }
      },
      onCorrectSelection: function(selection){
        state.expectedCorrectAnswers--;
        state.highlight({indices: state.highlightPhrase.indices.concat(selection.phrase.indices)});
        state.userSaid(selection.phrase.text);
        state.transcript.text = selection.successVideo.transcript;
        if(!state.expectedCorrectAnswers) {
          state.buttons = [];
          state.disabledSelection = true;
        }
        state.playVideo(selection.successVideo).then(function(){
          if(!state.expectedCorrectAnswers) {
            state.allCorrectSelected();
          }
        });
      },
      allCorrectSelected: function(){
        state.showAllCorrect();
        if(config.showAllSelectionsVideo){
          state.playVideo(config.showAllSelectionsVideo).then(function(){
            state.endGame();
          });
        }else{
          state.endGame();
        }
      },
      showAllCorrect: function(){
        var correctOptionIndices = config.correctOptions.map(function(option){
          return option.phrase.indices;
        });
        state.highlight({indices: [].concat.apply([], correctOptionIndices)});
      },
      endGame: function(){
        state.buttons = [{
          label: "Proceed",
          onClick : function(){
            state.toNextScene();
          }
        }];
      },
      onPartialCorrectSelection: function(option){
        state.userSaid(option.phrase.text);
        state.transcript.text = option.successVideo.transcript;
        state.playVideo(option.successVideo);
      },
      onWrongAttempt: function(phrase){
        var video = config.wrongAttemptMessages[config.wrongAttemptMessages.length - (state.wrongAttemptLeft--)];
        state.transcript.text = video.transcript;
        if(!state.wrongAttemptLeft){
          state.allCorrectSelected();
        }else{
          state.playVideo(video).then(function(){});
        }
      },
      buttons: [{
        label: "Help",
        onClick: function(){
          state.showTextSelectionHelp = true;
        }
      }]
    };
    return BaseScene(state, config);
  };
}]);
},{}],39:[function(require,module,exports){
app.factory("GenericSceneState", ["BaseScene", function ( BaseScene) {
  return function(config){

    var state = {
      sceneId        : config.sceneId,
      highlightPhrase: config.phrase || {indices: []},
      message        : !config.message ?  undefined : {
        text: config.message.text,
        button: {
          label: config.message.button.label,
          onClick: function(){
            state.userSaid(config.message.button.label);
            state.toNextScene()
          }
        }
      },
      buttons        : (config.buttons || []).map(function(button){
        return {
          label: button.label,
          onClick : function(){
            state.userSaid(button.label);
            state.toNextScene();
          }
        }
      }),
      showInput   : config.showInput,
      submitInput : function (userInput) {
        state.toNextScene();
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],40:[function(require,module,exports){
app.service("MultiChoiceEditor", ['SceneLoader', function (SceneLoader) {

  var multiChoiceEditor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "multi-choice",
            label         : SceneLoader["multi-choice"].label,
            "config"      : {
              "phrase": {"indices": [], "text"  : ""},
              "focus": {"indices" : [], "text"  : ""},
              "question":  "",
              "options": [],
              correctMessage: "That was correct answer.",
            }
          };
        }
      };
  return multiChoiceEditor;
}]);
},{}],41:[function(require,module,exports){
app.factory("AskMultiChoiceQuestion", ["MultiChoiceResult", "BaseScene", function (MultiChoiceResult, BaseScene) {
  return function (config) {
    var selectedByUser = function (option) {
          return option.input;
        },
        optionText = function(option){
          return option.label;
        };
    var state = {
      showInput: false,
      buttons: [
        {
          label: 'Submit',
          onClick: function(){
            var selectedOptions = state.options.filter(selectedByUser).map(optionText).join(", ").replace(new RegExp(',$'), '');
            state.agentSaid(config.question);
            state.userSaid(selectedOptions);

            if(config.correctMessage){
              state.transitTo(MultiChoiceResult(config, state.options));
            } else{
              state.toNextScene();
            }
          }
        }],
      options: config.options.map(function(usage){
        return {
          label: usage.label,
          correct: usage.correct,
        }
      }),
      highlightPhrase: config.highlight,
      focusPhrase    : config.focus,
    };
    return BaseScene(state, config);
  };
}]);
},{}],42:[function(require,module,exports){
app.factory("MultiChoiceResult", ["BaseScene", function ( BaseScene) {
  return function (config, input) {
    var correctMessage = config.correctMessage || "That's correct.";
    var
        result = config.options.map(function (option, index) {
          return {
            label: option.label,
            correct: option.correct,
            result: input[index].input == option.correct
          }
        }),
        isIncorrect = function (option) {
          return !option.result;
        },
        incorrectAnswer = result.filter(isIncorrect).length > 0,
        message = incorrectAnswer ? config.answerExplanation : correctMessage;

    var state = {
      buttons: [
        {
          label: 'Proceed',
          onClick: function(){
            state.agentSaid(message);
            state.toNextScene();
          }
        }],
      //result: result,
      transcript: {text: message},
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
    };
    return BaseScene(state, config);
  };
}]);
},{}],43:[function(require,module,exports){
app.factory("PauseAndReadState", ["BaseScene", function ( BaseScene) {

  return function (config) {

    var
        getTime = function(){return (new Date()).getTime();},
        timeForAction = config.waitForAction.timeToWait*1000,
        askToWaitVideo = config.waitForAction.beforeTimeVideo,
        state = {
          afterVideo: function () {
            state.setButtons([{
              label: config.nextButtonLabel,
              onClick: function () {
                var timePassed = (getTime() - state._videoEndedAt),
                    shouldWait = timeForAction > timePassed;
                state.userSaid(config.nextButtonLabel);
                if (shouldWait) {
                  state.playVideo(askToWaitVideo);
                } else {
                  state.toNextScene();
                }
              }
            }]);
          },
          buttons: [],
          transcript: {text: config.sceneLoadVideo.transcript}
        };

    return BaseScene(state, config);
  };
}]);
},{}],44:[function(require,module,exports){
app.service("PlayVideoEditor", ['SceneLoader', function (SceneLoader) {

  var editor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "play-video",
            label         : SceneLoader["play-video"].label,
            "config"      : {
              "group"     : group,
              "canSkip"   :  true,
              "autoNext"  :  true,
              "sceneLoadVideo" : {
                "fullscreen" : false,
                "url"        : "",
                "type"       : "video/mp4",
                "transcript" : ""
              }
            }
          };
        }
      };
  return editor;
}]);
},{}],45:[function(require,module,exports){
app.factory("PlayVideoState", ["BaseScene", function (BaseScene) {
  return function (config) {
    var
        state = {
          afterVideo: function () {
            config.autoNext ? state.toNextScene() : state.setButtons([{
                label: config.nextButtonLabel || 'Proceed',
                onClick: function(){
                  state.toNextScene();
                }}]);
          },
          skip: {
            onClick: function(){
              state.agentSaid(config.sceneLoadVideo.transcript);
              state.toNextScene();
            }
          }
        };
    return BaseScene(state, config);
  };
}]);
},{}],46:[function(require,module,exports){
app.service("PollResultEditor", ['SceneLoader', function (SceneLoader) {

  var editor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "poll-result",
            label         : SceneLoader["poll-result"].label,
            "config"      : {
              "group"       : group,
              "phrase": {"indices": [], "text"  : ""},
              "focus": {"indices" : [], "text"  : ""},
              "transcript": {"text"    : ""},
            }
          };
        }
      };
  return editor;
}]);
},{}],47:[function(require,module,exports){
app.factory("PollResultState", ["BaseScene", function (BaseScene) {
  return function (config) {
    var resultSummary = function(){
      return  + config.pollResult.map(function(result){
        return "<label>(<score>%)".replace("<label>", result.label).replace("<score>", result.score);
      }).join(", ");
    };
    var transcript = resultSummary();
    var state = {
      highlightPhrase : config.highlight,
      focusPhrase     : config.focus,
      pollResult      : config.pollResult,
      buttons         : [
        {
          label  : "Proceed",
          onClick: function(){
            state.toNextScene();
          }
        }
      ]
    };
    return BaseScene(state, config);
  };
}]);
},{}],48:[function(require,module,exports){
app.controller("SceneEditorController", ['$scope','$injector', 'MultiChoiceEditor', 'SceneLoader', function ($scope, $injector, MultiChoiceEditor, SceneLoader) {

  var sceneConfigs = [];
  for(var scene in SceneLoader){
    var config = SceneLoader[scene];
    if(config.editor){
      sceneConfigs.push({
        name: scene,
        entry: config.entry,
        label: config.label,
        editor: $injector.get(config.editor),
      });
    }
  }

  $scope.sceneConfigs = sceneConfigs;
  $scope.sceneEditors  = {
    multiChoice: MultiChoiceEditor
  };
}]);
},{}],49:[function(require,module,exports){
require('./scene-editor-controller');
require('./crg-base-scene');
require('./components/set-focus-directive');
require('./components/set-highlight-directive');
require('./components/set-key-image-directive');

require('./exit/states/exit-game-state');

require('./generic-scene/generic-scene-state');

require('./text-input/text-input-editor');
require('./text-input/states/text-input-state');

require('./drag-and-drop/drag-and-drop-editor');
require('./drag-and-drop/states/drag-drop-state');

require('./drag-and-drop-on-text/drag-and-drop-text-editor');
require('./drag-and-drop-on-text/states/drag-and-drop-text-state');

require('./yes-no-choice/states/ask-question');
require('./yes-no-choice/states/wrong-answer');
require('./yes-no-choice/yes-no-editor');

require('./multi-choice/multi-choice-editor');
require('./multi-choice/states/ask-multi-choice-question-state');
require('./multi-choice/states/multi-choice-result-state');


require('./find-phrase/states/find-phrase-state');
require('./find-phrase/find-phrase-editor');

require('./poll-result/states/poll-result-state');
require('./poll-result/poll-result-editor');

require('./play-video/play-video-state');
require('./play-video/play-video-editor');

require('./pause-and-read/reading-text-state');

},{"./components/set-focus-directive":28,"./components/set-highlight-directive":29,"./components/set-key-image-directive":30,"./crg-base-scene":31,"./drag-and-drop-on-text/drag-and-drop-text-editor":32,"./drag-and-drop-on-text/states/drag-and-drop-text-state":33,"./drag-and-drop/drag-and-drop-editor":34,"./drag-and-drop/states/drag-drop-state":35,"./exit/states/exit-game-state":36,"./find-phrase/find-phrase-editor":37,"./find-phrase/states/find-phrase-state":38,"./generic-scene/generic-scene-state":39,"./multi-choice/multi-choice-editor":40,"./multi-choice/states/ask-multi-choice-question-state":41,"./multi-choice/states/multi-choice-result-state":42,"./pause-and-read/reading-text-state":43,"./play-video/play-video-editor":44,"./play-video/play-video-state":45,"./poll-result/poll-result-editor":46,"./poll-result/states/poll-result-state":47,"./scene-editor-controller":48,"./text-input/states/text-input-state":50,"./text-input/text-input-editor":51,"./yes-no-choice/states/ask-question":52,"./yes-no-choice/states/wrong-answer":53,"./yes-no-choice/yes-no-editor":54}],50:[function(require,module,exports){
app.factory("TextInputState", ["BaseScene", function (BaseScene) {
  return function (config) {
    var state = {
      highlightPhrase: config.highlight,
      focusPhrase    : config.focus,
      showInput      : true,
      submitInput: function (userInput) {
        state.userSaid(userInput);
        state.toNextScene();
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],51:[function(require,module,exports){
app.service("TextInputEditor", ['SceneLoader', function (SceneLoader) {

  var textInputEditor = {
        createFor: function(group){
          return             {
            "group"       : group,
            "name"        : "text-input",
            label         : SceneLoader["text-input"].label,
            "config"      : {
              "phrase": {"indices": [], "text"  : ""},
              "focus": {"indices" : [], "text"  : ""},
              "transcript": {"text"    : ""},
              "options": []
            }
          };
        }
      };
  return textInputEditor;
}]);
},{}],52:[function(require,module,exports){
app.factory("AskQuestion", ['WrongAnswerToYesNo',  'BaseScene', function ( WrongAnswerToYesNo, BaseScene) {
  return function (config) {
    var
        onCorrectAnswer = function(answer){
          state.setButtons([]);
          state.playVideo(config.correctAnswerMessageVideo).then(function(){
            state.toNextScene();
          });
        },
        onWrongAnswer = function(){
          state.transitTo(WrongAnswerToYesNo(config));
        },
        state = {
          showInput: false,
          buttons: [
            {
              label: 'Yes',
              onClick: function(){
                state.userSaid("Yes");
                config.expectedYes ? onCorrectAnswer("Yes") : onWrongAnswer();
              }
            },
            {
              label: 'No',
              onClick: function(){
                state.userSaid("No");
                config.expectedYes ?  onWrongAnswer("No") : onCorrectAnswer();
              }
            }
          ],
          highlightPhrase   : config.phrase,
          focusPhrase       : config.focus
    };
    return BaseScene(state, config);
  };
}]);
},{}],53:[function(require,module,exports){
app.factory("WrongAnswerToYesNo", ["CRGGameService", "BaseScene", function ( game, BaseScene) {
  return function (config) {
    var state = {
      buttons: [],
      transcript: {text: config.wrongAnswerMessageVideo.transcript},
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
      afterVideo: function(){
        game.player.toNextScene();
      }
    };
    return BaseScene(state, {
      group: config.group,
      subgroup: config.subgroup,
      sceneLoadVideo: config.wrongAnswerMessageVideo
    });
  };
}]);
},{}],54:[function(require,module,exports){
app.service("YesNoEditor", ['SceneLoader', function (SceneLoader) {

  var textInputEditor = {
        createFor: function(group){
          var sceneName = "yes-no";
          return             {
            "group"           : group,
            "name"            : sceneName,
            label             : SceneLoader[sceneName].label,
            "config"          : {
              "phrase"        : {"indices" : [], "text"    : ""},
              "focus"         : {"indices" : [], "text"    : ""},
              "question"      : "",
              "expectedYes"   : false,
              "wrongAnswerMessage": ""
            }
          };
        }
      };
  return textInputEditor;
}]);
},{}],55:[function(require,module,exports){
app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider",function($stateProvider, $urlRouterProvider, $locationProvider){

	$urlRouterProvider.otherwise('/crg-home');
	$stateProvider
			.state('crg', {
				url: '/crg',
				templateUrl: 'assets/templates/crg-template.html'
			})
      .state('crg-home', {
				url: '/crg-home',
				templateUrl: 'assets/templates/crg-home-template.html'
			})
      .state('crg-demo', {
				url: '/crg-demo',
				templateUrl: 'assets/templates/crg-demo-template.html'
			})
			.state('crg.gameplay', {
				url: '/play/:id',
				templateUrl: 'assets/templates/crg-gameplay-template.html',
        controller: 'CRGameplayController',
        resolve : {
          gamePlan: ['CRGDataService', 'CRGPlayer', 'CRGGameService','$stateParams', function(CRGDataService, CRGPlayer,game,  $stateParams){
            return CRGDataService.getGame($stateParams.id).then(function(gameData){
              game.player = CRGPlayer;
              CRGPlayer.chat.reset();
              CRGPlayer.load(gameData);
              return gameData;
            });
          }]
        }
			})
      .state('crg.editor', {
        url: '/editor/:id',
        templateUrl: 'assets/templates/crg-editor-template.html',
        controller: 'CRGEditorController',
        resolve : {
          gamePlan: ['CRGDataService', 'CRGEditorService', '$stateParams', function(CRGDataService, CRGEditorService, $stateParams){
            return CRGDataService.getGame($stateParams.id).then(function(gameData){
              CRGEditorService.setGameToEdit(gameData);
            });
          }]
        }
      })
      .state('crg.editor.preview', {
        url: '/preview',
        templateUrl: 'assets/templates/crg-preview-template.html',
        controller: 'CRGameplayController',
        resolve : {
          gamePlan: ['CRGEditorService', 'CRGGameService', 'CRGPlayer', function(CRGEditorService, game, CRGPlayer){
            var gameData = CRGEditorService.prepareGamePlan();
            game.player = CRGPlayer;
            CRGPlayer.chat.reset();
            CRGPlayer.load(gameData);
            return gameData;
          }]
        }

      })
      .state('crg.editor.preview-scenes', {
        url: '/preview-scenes',
        templateUrl: 'assets/templates/crg-preview-template.html',
        controller: 'CRGameplayController',
        resolve : {
          gamePlan: ['CRGEditorService', 'CRGGameService', 'CRGPlayer', function(CRGEditorService, game, CRGPlayer){
            var gameData = CRGEditorService.prepareGamePlan(CRGEditorService.previewing);
            game.player = CRGPlayer;
            CRGPlayer.chat.reset();
            CRGPlayer.load(gameData);
            return gameData;
          }]
        }
      });
}]);

},{}],56:[function(require,module,exports){
app.value("stateMessages", {
  "default"     : "Loading ",
});

app.value("passageSelectorHeadings", {
  focus  : {
    label       : "Select text for student to focus upon.",
    description   : "This is the part of passage that the student should focus on while answering questions in this scene.",
  },
  highlight  : {
    label       : "Select text to highlight",
    description   : "This is tha part of text that will be highlighted for student to analyze.",
  }
});

app.value("TYPING_SPEED", 100);

app.value("SceneLoader", {
  "pause-and-read" :{
    entry: "PauseAndReadState",
    label: "Pause and Read",
    editor: "PlayVideoEditor"
  },
  "generic-scene" :{
    entry: "GenericSceneState",
    label: "Generic Scene",
    editor: "PlayVideoEditor"
  },
  "play-video"                 :{
    entry: "PlayVideoState",
    label: "Play Video",
    editor: "PlayVideoEditor",
  },
  "text-input"            :{
    entry: "TextInputState",
    label: "Input Text",
    editor: "TextInputEditor",
  },
  "drag-drop"            :{
    entry: "DragDropState",
    label: "Drag and Drop To Box",
    editor: "DragDropEditor",
  },
  "drag-drop-text"            :{
    entry: "DragDropTextState",
    label: "Drag and Drop To Text",
    editor: "DragDropTextEditor",
  },
  "multi-choice"          :{
    entry: "AskMultiChoiceQuestion",
    label: "Multiple Choice Question",
    editor: "MultiChoiceEditor"
  },
  "yes-no"                :{
    entry: "AskQuestion",
    label: "Yes/No Question",
    editor: "YesNoEditor"
  },
  //"find-all-key-images"   :{
  //  entry: "FindAllKeyImages",
  //  label: "Find Phrase",
  //  editor: "FindPhraseEditor"
  //},
  "find-phrase"   :{
    entry: "FindPhrase",
    label: "Find Phrase",
    editor: "FindPhraseSceneEditor"
  },
  "poll-result"   :{
    entry: "PollResultState",
    label: "Poll Result",
    editor: "PollResultEditor"
  },
  "exit"                  : {
    entry: "ExitGameState",
    label: "Exit"
  }
});

app.value("SceneGroups", {
  "intro": {
    label: "Main Idea",
    subgroups: []
  },
  "zincing": {
    label: "Zincing",
    subgroups: [
      {id: "visualize"  , label:"Visualise"},
      {id: "imagine"    , label:"Imagine"},
      {id: "key-images" , label:"Key Images"}
    ]
  },
  "navigators": {
    label: "Navigators",
    subgroups: [
      {id: "road-signs"  , label:"Road Signs"},
      {id: "pronouns"    , label:"Pronouns"},
      {id: "explainers" , label:"Explainers"}
    ]
  },
  "exit": {
    label: "Main Idea",
    subgroups: []
  }
})
},{}],57:[function(require,module,exports){
require("./app/app");
require("./app/variables");
require("./app/config");
require("./app/routes");
require("./app/components/viewport-safari-fix");
require("./app/components/forms/drop-down");
require("./app/components/throttle");
require("./app/components/state-loader/state-loader");
require("./app/components/typewriter/typewriter");

require("./app/crg/crg");
},{"./app/app":1,"./app/components/forms/drop-down":2,"./app/components/state-loader/state-loader":3,"./app/components/throttle":4,"./app/components/typewriter/typewriter":5,"./app/components/viewport-safari-fix":6,"./app/config":7,"./app/crg/crg":14,"./app/routes":55,"./app/variables":56}]},{},[57]);
