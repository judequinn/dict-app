(function() {
    'use strict';

    angular
    .module('translateApp', ['ngAnimate'])
    .config(altTemplateTags)
    .controller('TranslationController', TranslationController)
    .factory('getData', getData)
    .factory('getWord', getWord)
    .factory('saveWord', saveWord)
    .value('APIKEY', {
        key: 'dict.1.1.20160516T120928Z.ede67563564c0e7a.b4599c4d6cebf1c0566a42daedf871aaf1145dac'
    });

    altTemplateTags.$inject = ['$interpolateProvider'];
    TranslationController.$inject = ['$scope', '$window', '$timeout', '$log', 'getWord', 'saveWord', 'getData'];
    getData.$inject = ['$http', '$window'];
    getWord.$inject = ['$http', '$q', '$window', 'APIKEY'];
    saveWord.$inject = ['$http'];

    function altTemplateTags($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }

    function getData($http, $window) {
        var service = {
            fetch: function() {

                var url = 'http://' + $window.location.host + '/get_words/';

                var promise = $http.get(url)
                    .catch(function(){
                        throw new Error('Oh no, an error!');
                    });

                return promise;
            }
        };

        return service;
    }

    function getWord($http, $q, $window, APIKEY) {
        var wordTrans = {
            async: function(word) {

                var urlDict = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIKEY.key +
                              '&lang=en-ru&text=' + word;

                var urlGetWord = 'http://' + $window.location.host + '/get_word/' + word;

                var newWord = $http({method: 'GET', url: urlDict, cache: 'true'});
                var existingWord = $http({method: 'GET', url: urlGetWord, cache: 'true'});

                var promise = $q.all([newWord, existingWord])
                .catch(function() {
                    throw new Error('I am Error.');
                });
                return promise;
            }
        };

        return wordTrans;
    }

    function saveWord($http) {
        var wordSave = {
            save: function(request) {
                var promise = $http(request)
                    .catch(function(error) {
                        return error;
                    });
                return promise;
            }
        };

        return wordSave;
    }

    function TranslationController($scope, $window, $timeout, $log, getWord, saveWord, getData) {

        var vm = this;

        vm.changed = changed;
        vm.save = save;
        vm.editWord = editWord;
        vm.character = 'a';
        vm.data = {};

        activate();

        function activate(word) {

            getData.fetch()
                .then(function(response) {

                    var data = angular.fromJson(response);
                    var words = data.data;
                    var ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
                    var groups = Array(ALPHABET.length);

                    // create an array of arrays with letters
                    // as first elements
                    for (var k = 0; k < groups.length; k++) {
                        groups[k] = [];
                        groups[k].push({'english': ALPHABET.charAt(k)});
                    }

                    // push word to corresponding array
                    // judging by first character
                    for (var i = 0; i < words.length; i++) {
                        for (var j = 0; j < groups.length; j++) {
                            if (words[i].english.charAt(0) === groups[j][0].english) {
                                groups[j].push(words[i]);
                            }
                        }
                    }

                    vm.groups = groups;
                    if (word) {
                        vm.lastWord = word;
                    } else {
                        vm.lastWord = words[words.length - 1];
                    }
                })
                .catch(function(error) {
                    $log.log(error);
                });
        }

        function editWord(word) {

            vm.data.english = word.english;
            vm.data.russian = word.russian;

            if (!word.transcription) {

                getWord.async(vm.data.english)
                    .then(
                        function(response) {
                            var res = angular.fromJson(response);
                            vm.data.transcription = res[0].data.def[0].ts;
                        }
                    )
                    .catch(function(error) {
                        $log.log(error);
                    });
            } else {
                vm.data.transcription = word.transcription;
            }
        }

        function changed() {

            vm.data.russian = '';
            vm.existingWord = {};

            if (vm.data.english) {

                getWord.async(vm.data.english)

                    .then(
                        function(response){

                            var res = angular.fromJson(response);

                            if (!res[1].data.error) {
                                vm.existingWord = res[1].data;
                            }

                            if (res[0].data.def[0]) {

                                var transArr = [];
                                var transSource = res[0].data.def[0].tr;

                                for (var i = 0; i < transSource.length; i++) {
                                    transArr.push(transSource[i].text);
                                }
                                vm.data.russian = transArr.join(', ');
                                vm.data.transcription = res[0].data.def[0].ts;
                            }
                        }
                    )
                    .catch(function(error) {
                        $log.log(error);
                    });
            }
        }

        function save() {

            angular.element('#submit-btn').attr('disabled', true).html('Сохраняю слово...');

            var req = {
                method: 'POST',
                url: 'http://' + $window.location.host + '/',
                headers: {
                    'X-CSRFToken' : $scope.csrf_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: angular.toJson(vm.data)
            };

            saveWord.save(req)
                .then(function(response) {

                    if (response.status < 200 || response.status >= 300) {

                        $log.log('Error status: ' + response.status + ' ' + response.statusText);
                        angular.element('#submit-btn').attr('disabled', false).html('Добавить');
                    } else {

                        angular.element('#submit-btn').attr('disabled', false).html('Добавить');
                        var word = vm.data;
                        activate(word);
                        vm.character = vm.data.english.charAt(0);
                        vm.data = {};
                        vm.existingWord = {};
                    }

                    return response;
                })
                .catch(function(error) {
                    $log.log('Server error: ' + error);
                });
        }
    }

})();
