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
app.directive("typewriter",["$timeout", function($timeout){
  return {
    restrict: "C",
    scope: true,
    template: "<span class='letters'><span class='letter' ng-repeat='letter in letters track by $index'>{{letter}}</span><span>",
    link: function(scope, element, attrs){
      if(attrs.text){
        var $e    = $(element),
            speed = parseInt(attrs.typingSpeed) || 100,
            lastTimeout,
            nextLetter = 0,
            stopTimer = function(){
              $timeout.cancel(lastTimeout);
            },
            type = function(){
              if(nextLetter < scope.letters.length){
                $($e.find(".letter")[nextLetter++]).addClass("display");
              }else{
                stopTyping();
              }
              if(!scope.done){
                lastTimeout = $timeout(type, speed);
              }
            },
            startTyping = function(){
              stopTimer();
              $timeout(function(){
                $(".letters").addClass("typing");
                scope.done = false;
                nextLetter = 0;
                attrs.beforeTyping && scope.$eval(attrs.beforeTyping);
                lastTimeout = $timeout(type, speed);
              });
            },
            stopTyping = function(){
              $timeout(function(){
                $(".letters").removeClass("typing");
                scope.done = true;
                attrs.afterTyping && scope.$eval(attrs.afterTyping);
              });
              stopTimer();
            };
        scope.$watch(attrs.text, function(text){
          scope.letters = text.split("");
          startTyping();
          $(".letters").html(text);
          stopTyping();
        });
      }
    }
  };
}])
},{}],5:[function(require,module,exports){
app.value("remote", "https://findfalcone.herokuapp.com");
app.value("requestConfig", {headers: {Accept: "application/json", "Content-Type": "application/json"}});

},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
require("./components/passage/passage");
require("./components/passage/drag-drop-relations/drag-drop-relations");
require("./components/video-player-directive");
require("./components/video-player-service");
require("./components/user-action-log-service");

require("./player/crgameplay");
require("./editor/crg-editor");
require("./scenes/scenes");
require("./crg-data-service");

},{"./components/passage/drag-drop-relations/drag-drop-relations":6,"./components/passage/passage":7,"./components/user-action-log-service":8,"./components/video-player-directive":9,"./components/video-player-service":10,"./crg-data-service":11,"./editor/crg-editor":15,"./player/crgameplay":23,"./scenes/scenes":50}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
require('./crg-editor-controller');
require('./preview/crg-preview-controller');
require('./crg-editor-service');
require('./passage-selector');
},{"./crg-editor-controller":13,"./crg-editor-service":14,"./passage-selector":16,"./preview/crg-preview-controller":17}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
app.controller('CRGPreviewController', [function () {
  window.scrollTo(0,0);
}]);
},{}],18:[function(require,module,exports){
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
                inputHeight        = $(".chat-input").height();

            $dialogues.css("padding-bottom",inputHeight);
          },
          updateChatHistory = function (ready) {
            resize();
            scrollToBottom();
          };

      scope.$watch("game.player.chat.input.ready", updateChatHistory);
    }
  };
}]);
},{}],19:[function(require,module,exports){
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

  $scope.game = game;
}]);
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
app.factory("CRGGameService", [function () {
  var game = {
    player: null
  };
  return game;
}]);
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
require('./crg-game-service');
require('./crg-game-controller');
require('./phrase-selector');
require('./selection-pointer');
require('./crg-player-service');
require('./crg-game-script');
require('./chat-window/chat-history/scroll-bottom-on-resize');
},{"./chat-window/chat-history/scroll-bottom-on-resize":18,"./crg-game-controller":19,"./crg-game-script":20,"./crg-game-service":21,"./crg-player-service":22,"./phrase-selector":24,"./selection-pointer":25}],24:[function(require,module,exports){
app.directive("phraseSelector", [function () {
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
      var highlightSelected = function () {
        var selections = getSelectionText();
        $("[data-word-number]").removeClass("selected-word");
        selections.forEach(function(dataWordNumber){
          var selector = "[data-word-number='<number>']".replace('<number>', dataWordNumber);
          $(selector).addClass("selected-word");
        });
        scope.$selection.indices = selections;
        scope.$eval(attrs.onTextSelect);
      };
      document.addEventListener("selectionchange", highlightSelected, false);
      scope.$selection = {indices: []};
    }
  };
}]);


},{}],25:[function(require,module,exports){
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


},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
app.factory("BaseScene", ["CRGGameService", "UserActionLogService", function (game, UserActionLogService) {
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
        game.player.video.play(config.sceneLoadVideo).then(function(){
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
      return game.player.video.play(video);
    };
    scene.toNextScene = function(){
      game.player.toNextScene();
    };

    scene.highlight = function(phrase){
      scene.highlightPhrase.indices = scene.highlightPhrase.indices.concat(phrase.indices);
      game.player.setHighlightText(scene.highlightPhrase);
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
    scene.setButtons(scene.buttons|| []);
    return scene;
  };
}]);
},{}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
        state.highlight(relation.droppable);
        noneLeft && state.endState();
      },
      wrongTextDropped: function(relation){
        var noAttemptLeft = ++state.wrongAttempts ==  state.wrongAttemptsAllowed,
            video =  config.wrongAttemptMessages[state.wrongAttempts];
        if(video){
          state.playVideo(video).then(function(){
            noAttemptLeft && state.endState();
          });
        } else {
          noAttemptLeft && state.endState();
        }
      },
      endState: function(){
        if(config.onFinish){
          state.playVideo(config.onFinish).then(function(){
            state.toNextScene();
          });
        }else{
          state.toNextScene();
        }
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
app.factory("FindPhrase", ["CRGGameService",  "BaseScene", function (game, BaseScene) {

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
      correctOptions      : optionId(config.correctOptions),
      partialCorrectOptions: optionId(config.partialCorrectOptions),
      wrongAttemptLeft     : config.wrongAttemptsAllowed,
      expectedCorrectAnswers     :  config.expectedCorrectAnswers || config.correctOptions.length,
      onTextSelection   : function(selectedPhrase){
        state.selectingText = true;
      },
      submitTextSelection: function(selectedPhrase){
        var correctOption         = state.correctOptions[phraseId(selectedPhrase)],
            partialCorrectOption  = state.partialCorrectOptions[phraseId(selectedPhrase)],
            closeMatch             = (correctOption || partialCorrectOption) ? null : findCloseMatch(selectedPhrase, config.correctOptions, MIN_SELECTION_DISTANCE);
        state.selectingText = false;
        game.player.chat.add.fromAgent(state.transcript.text);
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
        state.highlightPhrase.indices = state.highlightPhrase.indices.concat(selection.phrase.indices);
        game.player.setHighlightText(state.highlightPhrase);
        game.player.video.stop();
        game.player.chat.add.fromUser(selection.phrase.text);
        state.transcript.text = selection.successVideo.transcript;
        if(!state.expectedCorrectAnswers) {
          state.buttons = [];
        }
        game.player.video.play(selection.successVideo).then(function(){
          game.player.chat.add.fromAgent(state.transcript.text);
          if(!state.expectedCorrectAnswers) {
            state.allCorrectSelected();
          }
        });
      },
      allCorrectSelected: function(){
        state.showAllCorrect();
        if(config.showAllSelectionsVideo){
          game.player.video.play(config.showAllSelectionsVideo).then(function(){
            game.player.chat.add.fromAgent(config.showAllSelectionsVideo.transcript);
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
        state.highlightPhrase = {indices: [].concat.apply([], correctOptionIndices)};
        game.player.setHighlightText(state.highlightPhrase);
      },
      endGame: function(){
        state.buttons = [{
          label: "Proceed",
          onClick : function(){
            game.player.toNextScene();
          }
        }];
      },
      onPartialCorrectSelection: function(option){
        game.player.video.stop();
        game.player.chat.add.fromUser(option.phrase.text);

        state.transcript.text = option.successVideo.transcript;
        game.player.video.play(option.successVideo);
      },
      onWrongAttempt: function(phrase){
        game.player.video.stop();
        game.player.chat.add.fromUser(phrase.text);
        var video = config.wrongAttemptMessages[config.wrongAttemptMessages.length - (state.wrongAttemptLeft--)];
        state.transcript.text = video.transcript;
        if(!state.wrongAttemptLeft){
          state.allCorrectSelected();
        }else{
          game.player.video.play(video).then(function(){});
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
},{}],37:[function(require,module,exports){
app.factory("GenericSceneState", ["BaseScene", function ( BaseScene) {
  return function(config){

    var state = {
      sceneId        : config.sceneId,
      highlightPhrase: config.phrase || {indices: []},
      buttons        : config.buttons.map(function(button){
        return {
          label: button.label,
          onClick : function(){
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
},{}],38:[function(require,module,exports){
app.factory("DoneReadingPassageState", ["EnterMainIdeaState", "CRGGameService", "BaseScene", function (EnterMainIdeaState, game, BaseScene) {
  return function(config){
    var transcript = "Did the passage make sense ?";
    var acceptInput = function(message){
      game.player.chat.add.fromAgent(transcript);
      game.player.chat.add.fromUser(message);

      game.player.transitTo(EnterMainIdeaState(config));
    };


    var state = {
      transcript: {text: transcript},
      buttons: [
        {
          label: "Definitely",
          onClick: function () {
            acceptInput("Definitely");
          }}, {
          label: "Sort of",
          onClick: function () {
            acceptInput("Sort of");
          }}, {
          label: "Not Really",
          onClick: function () {
            acceptInput("Not Really");
          }}]
    };
    return BaseScene(state, config);
  };
}]);
},{}],39:[function(require,module,exports){
app.factory("EnterMainIdeaState", ["CRGGameService", "BaseScene",function (game, BaseScene) {
  return function(config){
    var transcript = "Describe the main idea in 120 characters or less.";
    return BaseScene({
      transcript: {text: transcript},
      submitInput : function(userInput){
        game.player.chat.add.fromAgent(transcript);
        game.player.chat.add.fromUser(userInput);

        game.player.toNextScene();
      }
    }, config);
  };
}]);
},{}],40:[function(require,module,exports){
app.factory("ReadingPassageState", ["DoneReadingPassageState", "CRGGameService", "BaseScene", function (DoneReadingPassageState, game, BaseScene) {
  return function(config){
    var agentSays = "Before Attempting any skills, read the passage to the left.";
    var userSaid = "I am done!";

    var state = {
      load: function () {
        game.player.video.play(config.sceneLoadVideo).then(function () {
          state.buttons = [
            {
              label: userSaid,
              onClick: function () {
                game.player.chat.add.fromAgent(agentSays);
                game.player.chat.add.fromUser(userSaid);
                game.player.transitTo(DoneReadingPassageState(config))
              }
            }
          ];
        });
      },
      showInput: false,
      transcript: {text: agentSays},
    };
    return BaseScene(state, config);
  };
}]);
},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
app.factory("AskMultiChoiceQuestion", ["MultiChoiceResult", "CRGGameService", "BaseScene", function (MultiChoiceResult, game, BaseScene) {
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
            game.player.chat.add.fromAgent(config.question);
            game.player.chat.add.fromUser(selectedOptions);

            if(config.correctMessage){
              game.player.transitTo(MultiChoiceResult(config, state.options));
            } else{
              game.player.toNextScene();
            }
          }
        }],
      options: config.options.map(function(usage){
        return {
          label: usage.label,
          correct: usage.correct,
        }
      }),
      transcript: {text: config.question},
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
    };
    return BaseScene(state, config);
  };
}]);
},{}],43:[function(require,module,exports){
app.factory("MultiChoiceResult", ["CRGGameService", "BaseScene", function (game, BaseScene) {
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
            game.player.chat.add.fromAgent(message);
            game.player.toNextScene();
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
},{}],44:[function(require,module,exports){
app.factory("PauseAndReadState", ["CRGGameService", "BaseScene", function (game, BaseScene) {

  return function (config) {

    var
        getTime = function(){return (new Date()).getTime();},
        timeForAction = config.waitForAction.timeToWait*1000,
        askToWaitVideo = config.waitForAction.beforeTimeVideo,
        state = {
          afterVideo: function () {
            state.buttons = [{
              label: config.nextButtonLabel,
              onClick: function () {
                var timePassed = (getTime() - state._videoEndedAt),
                    shouldWait = timeForAction > timePassed;
                if (shouldWait) {
                  game.player.video.play(askToWaitVideo);
                } else {
                  game.player.toNextScene();
                }
              }
            }
            ]
          },
          buttons: [],
          transcript: {text: config.sceneLoadVideo.transcript}
        };

    return BaseScene(state, config);
  };
}]);
},{}],45:[function(require,module,exports){
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
},{}],46:[function(require,module,exports){
app.factory("PlayVideoState", ["DoneReadingPassageState", "CRGGameService", "BaseScene", function (DoneReadingPassageState, game, BaseScene) {
  return function(config){
    var userSaid = config.nextButtonLabel,
        agentSaid = config.sceneLoadVideo.transcript,
        skipMessage = config.skipMessage || 'Skip',
        buttons     = config.nextButton ? []:[];

    var state = {
      afterVideo: function () {
        if(config.autoNext){
          game.player.toNextScene();
        }else{
          state.buttons = [
            {
              label: userSaid,
              onClick: function () {
                game.player.chat.add.fromAgent(agentSaid);
                game.player.chat.add.fromUser(userSaid);
                game.player.toNextScene();
              }
            }
          ];
        }
      },
      skip: {
        allowed: config.canSkip,
        onClick: function () {
          game.player.chat.add.fromAgent(agentSaid);
          game.player.chat.add.fromUser(skipMessage);
          game.player.toNextScene();
        }
      },
      transcript: {text: agentSaid},
    };
    return BaseScene(state, config);
  };
}]);
},{}],47:[function(require,module,exports){
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
},{}],48:[function(require,module,exports){
app.factory("PollResultState", ["CRGGameService", "BaseScene", function ( game, BaseScene) {
  return function (config) {
    var resultSummary = function(){
      return config.transcript.text + " : " + config.pollResult.map(function(result){
        return "<label>(<score>%)".replace("<label>", result.label).replace("<score>", result.score);
      }).join(", ");
    };
    var transcript = resultSummary();
    var state = {
      highlightPhrase : config.phrase,
      focusPhrase     : config.focus,
      transcript      : {text: transcript},
      pollResult      : config.pollResult,
      buttons         : [
        {
          label  : "Proceed",
          onClick: function(){
            game.player.chat.add.fromAgent(transcript);
            game.player.toNextScene();
          },
        }
      ]
    };
    return BaseScene(state, config);
  };
}]);
},{}],49:[function(require,module,exports){
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
},{}],50:[function(require,module,exports){
require('./scene-editor-controller');
require('./crg-base-scene');
require('./components/set-focus-directive');
require('./components/set-highlight-directive');
require('./components/set-key-image-directive');

require('./intro/states/reading-passage-state');
require('./intro/states/done-reading-passage-state');
require('./intro/states/enter-main-idea-state');
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

},{"./components/set-focus-directive":26,"./components/set-highlight-directive":27,"./components/set-key-image-directive":28,"./crg-base-scene":29,"./drag-and-drop-on-text/drag-and-drop-text-editor":30,"./drag-and-drop-on-text/states/drag-and-drop-text-state":31,"./drag-and-drop/drag-and-drop-editor":32,"./drag-and-drop/states/drag-drop-state":33,"./exit/states/exit-game-state":34,"./find-phrase/find-phrase-editor":35,"./find-phrase/states/find-phrase-state":36,"./generic-scene/generic-scene-state":37,"./intro/states/done-reading-passage-state":38,"./intro/states/enter-main-idea-state":39,"./intro/states/reading-passage-state":40,"./multi-choice/multi-choice-editor":41,"./multi-choice/states/ask-multi-choice-question-state":42,"./multi-choice/states/multi-choice-result-state":43,"./pause-and-read/reading-text-state":44,"./play-video/play-video-editor":45,"./play-video/play-video-state":46,"./poll-result/poll-result-editor":47,"./poll-result/states/poll-result-state":48,"./scene-editor-controller":49,"./text-input/states/text-input-state":51,"./text-input/text-input-editor":52,"./yes-no-choice/states/ask-question":53,"./yes-no-choice/states/wrong-answer":54,"./yes-no-choice/yes-no-editor":55}],51:[function(require,module,exports){
app.factory("TextInputState", ["CRGGameService", "BaseScene", function ( game, BaseScene) {
  return function (config) {
    var transcript = config.transcript.text || "What do you imagine when you read the highlighted text ?";
    var state = {
      transcript: {text: transcript},
      highlightPhrase: config.phrase,
      focusPhrase    : config.focus,
      showInput      : true,
      submitInput: function (userInput) {
        game.player.chat.add.fromAgent(transcript);
        game.player.chat.add.fromUser(userInput);

        game.player.toNextScene();
      }
    };
    return BaseScene(state, config);
  };
}]);
},{}],52:[function(require,module,exports){
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
},{}],53:[function(require,module,exports){
app.factory("AskQuestion", ['CRGGameService', 'WrongAnswerToYesNo',  'BaseScene', function (game, WrongAnswerToYesNo, BaseScene) {
  return function (config) {
    var onCorrectAnswer = function(answer){
          game.player.video.stop();
          game.player.chat.add.fromUser(answer);
          state.transcript.text = config.correctAnswerMessageVideo.transcript;
          state.buttons = [];
          game.player.video.play(config.correctAnswerMessageVideo).then(function(){
            game.player.toNextScene();
            game.player.chat.add.fromAgent(config.correctAnswerMessageVideo.transcript);
          });
        },
        onWrongAnswer = function(){
          game.player.transitTo(WrongAnswerToYesNo(config));
        };
    var state = {
      showInput: false,
      buttons: [
        {
          label: 'Yes',
          onClick: function(){
            config.expectedYes ? onCorrectAnswer("Yes") : onWrongAnswer();
          }
        },
        {
          label: 'No',
          onClick: function(){
            config.expectedYes ?  onWrongAnswer("No") : onCorrectAnswer();
          }
        }
      ],
      transcript        : {text: config.question},
      highlightPhrase   : config.phrase,
      focusPhrase       : config.focus
    };
    return BaseScene(state, config);
  };
}]);
},{}],54:[function(require,module,exports){
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
},{}],55:[function(require,module,exports){
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
},{}],56:[function(require,module,exports){
app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider",function($stateProvider, $urlRouterProvider, $locationProvider){

	$urlRouterProvider.otherwise('/crg');
	$stateProvider
			.state('crg', {
				url: '/crg',
				templateUrl: 'assets/templates/crg-template.html'
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

},{}],57:[function(require,module,exports){
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

app.value("SceneLoader", {
  "intro"                 :{
    entry: "ReadingPassageState",
    label: "Main Idea"
  },
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
},{}],58:[function(require,module,exports){
require("./app/app");
require("./app/variables");
require("./app/config");
require("./app/routes");
require("./app/components/forms/drop-down");
require("./app/components/state-loader/state-loader");
require("./app/components/typewriter/typewriter");

require("./app/crg/crg");
},{"./app/app":1,"./app/components/forms/drop-down":2,"./app/components/state-loader/state-loader":3,"./app/components/typewriter/typewriter":4,"./app/config":5,"./app/crg/crg":12,"./app/routes":56,"./app/variables":57}]},{},[58]);
