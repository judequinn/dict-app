(function() {
    'use strict';

    angular
    .module('translateApp', [])
    .config(altTemplateTags)
    .controller('TranslationController', TranslationController)
    .factory('getWord', getWord)
    .factory('saveWord', saveWord)
    .value('APIKEY', {
        key: 'dict.1.1.20160516T120928Z.ede67563564c0e7a.b4599c4d6cebf1c0566a42daedf871aaf1145dac'
    });

    altTemplateTags.$inject = ['$interpolateProvider'];
    TranslationController.$inject = ['$scope', '$window', '$timeout', '$log', 'getWord', 'saveWord'];
    getWord.$inject = ['$http', 'APIKEY'];
    saveWord.$inject = ['$http'];

    function altTemplateTags($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }

    function getWord($http, APIKEY) {
        var wordTrans = {
            async: function(word) {

                var urlDict = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIKEY.key +
                              '&lang=en-ru&text=' + word;

                var promise = $http.get(urlDict)
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

    function TranslationController($scope, $window, $timeout, $log, getWord, saveWord) {

        var vm = this;

        vm.changed = changed;
        vm.save = save;

        function changed() {

            vm.data.russian = '';

            if (vm.data.english) {

                getWord.async(vm.data.english)

                    .then(
                        function(response){

                            var res = angular.fromJson(response);

                            if (res.data.def[0]) {

                                var transArr = [];
                                var transSource = res.data.def[0].tr;

                                for (var i = 0; i < transSource.length; i++) {
                                    transArr.push(transSource[i].text);
                                }
                                vm.data.russian = transArr.join(', ');
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
                        $timeout(function() {
                            $window.location.href = '/';
                        });
                    }

                    return response;
                });
        }
    }

})();
